/** Safe same-origin, read-only bundles from the linked public GitHub repository.
 * Build output is guarded by Cloudflare Access; bundles contain NO firmware/ROMs.
 * Files in community/ are the authoritative source for the initial preview.
 */
export const COMMUNITY_SOURCES=Object.freeze({
  slot:Object.freeze({root:"community/slot36s",github:"https://github.com/scriptskk/r36s-web-lab/tree/main/community/slot36s",origin:"historical-reconstruction"}),
  pkforge:Object.freeze({root:"community/pkforge-r36s",github:"https://github.com/scriptskk/r36s-web-lab/tree/main/community/pkforge-r36s",origin:"placeholder"})
});
export function sourcePaths(id){
  const entry=COMMUNITY_SOURCES[id];
  if(!entry)return null;
  return {html:"./"+entry.root+"/preview.html",css:"./"+entry.root+"/style.css"};
}
export async function getCommunitySource(id,fetchImpl=fetch){
  const paths=sourcePaths(id);
  if(!paths)throw Error("Projeto não cadastrado.");
  async function load(path){
    const res=await fetchImpl(path,{credentials:"same-origin",cache:"no-store"});
    if(!res.ok)throw Error("Arquivo não encontrado no GitHub publicado: "+path);
    const length=Number(res.headers.get("content-length")||0);
    if(length>1_000_000)throw Error("Arquivo de prévia maior que 1 MB.");
    const content=await res.text();
    if(content.length>1_000_000)throw Error("Prévia maior que 1 MB.");
    return content;
  }
  const [html,css]=await Promise.all([load(paths.html),load(paths.css)]);
  return {...paths,html,css,source:COMMUNITY_SOURCES[id]};
}
