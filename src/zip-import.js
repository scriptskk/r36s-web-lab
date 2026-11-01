/**
 * Browser-local ZIP importer for source previews (not a firmware loader).
 * Supports standard single-disk ZIP archives with STORE and DEFLATE methods.
 * Rejects encrypted entries, ZIP64, nested path traversal, oversized files
 * and ZIP bombs before materializing files where possible.
 */
import {cleanPath,fileCategory,MAX_FILES,MAX_TOTAL_BYTES,MAX_TEXT_BYTES,MAX_IMAGE_BYTES} from "./project-lab.js";
export const MAX_ZIP_BYTES=32*1024*1024;
const MAX_CENTRAL_ENTRIES=500;
const dv=(b)=>new DataView(b.buffer,b.byteOffset,b.byteLength);
function need(b,pos,n){if(pos<0||n<0||pos+n>b.length)throw Error("Arquivo ZIP incompleto ou inválido.");}
function mime(path){
  const e=path.split(".").pop().toLowerCase();
  return ({html:"text/html",htm:"text/html",css:"text/css",xml:"application/xml",js:"text/javascript",mjs:"text/javascript",png:"image/png",jpg:"image/jpeg",jpeg:"image/jpeg",gif:"image/gif",webp:"image/webp"})[e]||"application/octet-stream";
}
export function getZipEntries(bytes){
  if(!(bytes instanceof Uint8Array))throw Error("Dados ZIP inválidos.");
  if(bytes.length>MAX_ZIP_BYTES)throw Error("ZIP maior que 32 MB: use uma pasta com apenas o frontend.");
  const view=dv(bytes);
  let eocd=-1;
  const begin=Math.max(0,bytes.length-22-65535);
  for(let i=bytes.length-22;i>=begin;i--){if(view.getUint32(i,true)===0x06054b50){eocd=i;break;}}
  if(eocd<0)throw Error("Arquivo ZIP inválido. Não foi encontrado o diretório central.");
  need(bytes,eocd,22);
  const disk=view.getUint16(eocd+4,true),onDisk=view.getUint16(eocd+8,true);
  const count=view.getUint16(eocd+10,true),all=view.getUint16(eocd+8,true);
  const size=view.getUint32(eocd+12,true),start=view.getUint32(eocd+16,true);
  if(disk!==0||onDisk!==count||count>MAX_CENTRAL_ENTRIES||size===0xffffffff||start===0xffffffff)
    throw Error("ZIP multivolume, ZIP64 ou com entradas demais não é suportado.");
  need(bytes,start,size);
  let pos=start,total=0;
  const entries=[],seen=new Set();
  for(let i=0;i<count;i++){
    need(bytes,pos,46);
    if(view.getUint32(pos,true)!==0x02014b50)throw Error("Diretório ZIP corrompido.");
    const flags=view.getUint16(pos+8,true);
    const method=view.getUint16(pos+10,true);
    const compressed=view.getUint32(pos+20,true);
    const uncompressed=view.getUint32(pos+24,true);
    const nameLen=view.getUint16(pos+28,true);
    const extraLen=view.getUint16(pos+30,true);
    const commentLen=view.getUint16(pos+32,true);
    const external=view.getUint32(pos+38,true);
    const offset=view.getUint32(pos+42,true);
    need(bytes,pos+46,nameLen+extraLen+commentLen);
    const name=new TextDecoder(flags&0x800?"utf-8":"latin1").decode(bytes.subarray(pos+46,pos+46+nameLen));
    pos+=46+nameLen+extraLen+commentLen;
    if(name.endsWith("/"))continue;
    const path=cleanPath(name);
    if(!path)throw Error("O ZIP contém um caminho inseguro.");
    if(seen.has(path))throw Error("O ZIP contém nomes de arquivos duplicados.");
    seen.add(path);
    // Unix symlinks and arbitrary executables are ignored, never followed.
    if(((external>>>16)&0o170000)===0o120000)continue;
    const category=fileCategory(path);
    if(category==="unsupported")continue;
    if(flags&1 || (method!==0 && method!==8))
      throw Error("Arquivo compactado com criptografia ou formato não suportado: "+path);
    const limit=category==="image"?MAX_IMAGE_BYTES:MAX_TEXT_BYTES;
    if(uncompressed>limit)throw Error("Arquivo muito grande dentro do ZIP: "+path);
    total+=uncompressed;
    if(total>MAX_TOTAL_BYTES)throw Error("O ZIP descompactado excede 16 MB.");
    if(entries.length>=MAX_FILES)throw Error("O projeto excede o limite de 160 arquivos.");
    entries.push({path,method,compressed,uncompressed,offset,mime:mime(path)});
  }
  return entries;
}
async function inflateRawLimited(data,maxExpected){
  if(typeof DecompressionStream==="undefined")
    throw Error("Seu navegador não oferece DecompressionStream. Extraia o ZIP e use Importar pasta.");
  let ds;
  try{ds=new DecompressionStream("deflate-raw");}
  catch{throw Error("Seu navegador não suporta ZIP DEFLATE RAW. Extraia o ZIP e selecione a pasta.");}
  const stream=new Blob([data]).stream().pipeThrough(ds);
  const reader=stream.getReader();
  const parts=[];let size=0;
  try{
    while(true){
      const {value,done}=await reader.read();if(done)break;
      size+=value.length;
      if(size>maxExpected){await reader.cancel();throw Error("O ZIP declara um tamanho menor que os dados reais.");}
      parts.push(value);
    }
  }finally{reader.releaseLock();}
  const out=new Uint8Array(size);let p=0;
  for(const part of parts){out.set(part,p);p+=part.length;}
  return out;
}
export async function unzipSourceFiles(file){
  if(!file||!Number.isFinite(file.size)||file.size>MAX_ZIP_BYTES)throw Error("Selecione um ZIP de até 32 MB.");
  const bytes=new Uint8Array(await file.arrayBuffer());
  const entries=getZipEntries(bytes),view=dv(bytes),files=[];
  if(!entries.length)throw Error("Nenhum arquivo HTML/CSS/JS/XML/imagem encontrado neste ZIP.");
  for(const entry of entries){
    const p=entry.offset;
    need(bytes,p,30);
    if(view.getUint32(p,true)!==0x04034b50)throw Error("Arquivo local do ZIP inválido.");
    const nameLength=view.getUint16(p+26,true);
    const extraLength=view.getUint16(p+28,true);
    const dataStart=p+30+nameLength+extraLength;
    need(bytes,dataStart,entry.compressed);
    const compressed=bytes.subarray(dataStart,dataStart+entry.compressed);
    const data=entry.method===0?compressed:await inflateRawLimited(compressed,entry.uncompressed);
    if(data.length!==entry.uncompressed)throw Error("Tamanho descompactado inconsistente: "+entry.path);
    files.push(new File([data],entry.path,{type:entry.mime}));
  }
  return files;
}
