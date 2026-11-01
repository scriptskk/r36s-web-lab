const IMAGE_EXTENSIONS = [".img.xz", ".img.gz", ".img.zip", ".img", ".iso", ".dtbo", ".dtb", ".xz", ".gz", ".zip"];
const PARTITION_TYPES = {1:"FAT12",4:"FAT16",6:"FAT16B",7:"NTFS/exFAT",11:"FAT32",12:"FAT32 LBA",14:"FAT16 LBA",131:"Linux",142:"Linux LVM",238:"GPT protetora"};

export function formatSize(bytes) {
  if (!Number.isFinite(bytes) || bytes < 0) return "Tamanho desconhecido";
  if (bytes < 1024) return bytes + " B";
  const units = ["KB", "MB", "GB", "TB"];
  let value = bytes;
  let index = -1;
  do { value /= 1024; index++; } while (value >= 1024 && index < units.length-1);
  return value.toLocaleString("pt-BR", {maximumFractionDigits: 2}) + " " + units[index];
}
export function imageType(name) {
  const lower = String(name || "").toLowerCase();
  return IMAGE_EXTENSIONS.find(ext => lower.endsWith(ext)) || null;
}
export function inspectFirmwareHeader(bytes, name, size) {
  const type = imageType(name);
  if (!type) throw new Error("Formato não reconhecido. Selecione .img, .img.xz, .img.gz, .iso, .dtb ou .zip.");
  const header = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  const result = {name: String(name).slice(0,180), size, type, partitions: [], notes: [], classification: "Arquivo para inspeção"};
  if ([".xz", ".gz", ".zip", ".img.xz", ".img.gz", ".img.zip"].includes(type)) {
    result.classification = "Imagem compactada";
    result.notes.push("O arquivo compactado não foi descomprimido nem executado. Extraia uma cópia .img localmente para analisar a tabela de partições.");
    return result;
  }
  if (type === ".dtb" || type === ".dtbo") {
    result.classification = "Device tree";
    if (header.length >= 4 && header[0]===0xd0 && header[1]===0x0d && header[2]===0xfe && header[3]===0xed) {
      result.notes.push("Cabeçalho FDT encontrado. Isto não comprova compatibilidade com o painel do console.");
    } else result.notes.push("Assinatura FDT não encontrada no início do arquivo.");
    return result;
  }
  if (header.length >= 32774 && String.fromCharCode(...header.subarray(32769,32774)) === "CD001") {
    result.classification = "Imagem óptica ISO 9660";
    result.notes.push("Imagem óptica detectada. Não é um cartão SD inicializável do R36S.");
    return result;
  }
  if (header.length >= 512 && header[510]===0x55 && header[511]===0xaa) {
    result.classification = "Imagem de disco com assinatura MBR";
    const view = new DataView(header.buffer,header.byteOffset,header.byteLength);
    for (let i=0; i<4; i++) {
      const pos = 446 + i*16;
      const id = header[pos+4];
      const start = view.getUint32(pos+8,true);
      const sectors = view.getUint32(pos+12,true);
      if (id !== 0 && sectors > 0) result.partitions.push({number:i+1,id,type:PARTITION_TYPES[id] || "Tipo 0x"+id.toString(16).padStart(2,"0"),start,sectors,bytes:sectors*512});
    }
    if (result.partitions.some(p=>p.id===238)) result.notes.push("Entrada GPT protetora detectada; a tabela GPT não é interpretada nesta versão.");
    if (!result.partitions.length) result.notes.push("Assinatura 0x55AA presente, mas não foram encontradas entradas MBR reconhecíveis.");
    if (result.partitions.some(p => p.start*512 + p.bytes > size)) result.notes.push("Ao menos uma partição declara um fim além do tamanho do arquivo.");
    result.notes.push("Inspeção apenas de cabeçalho; não inicializa o sistema nem modifica dados.");
    return result;
  }
  result.classification = type === ".iso" ? "ISO não identificada" : "Imagem sem tabela MBR reconhecida";
  result.notes.push("Nenhuma assinatura MBR ou ISO 9660 foi reconhecida na região inspecionada. Algumas imagens usam outros formatos de boot.");
  return result;
}
export async function inspectFirmwareFile(file) {
  if (!file || typeof file.slice !== "function" || !imageType(file.name)) throw new Error("Selecione uma imagem de firmware suportada.");
  // Reading a short prefix avoids loading multi-gigabyte firmware images into browser memory.
  const prefix = new Uint8Array(await file.slice(0, 34816).arrayBuffer());
  return inspectFirmwareHeader(prefix, file.name, file.size);
}
