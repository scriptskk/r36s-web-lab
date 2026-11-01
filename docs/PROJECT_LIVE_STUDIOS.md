# Slot.R36S e PKForge R36S — workspaces visuais

O R36S Web Lab agora contém duas áreas independentes: **Slot.R36S** e **PKForge R36S**. Cada uma permite selecionar arquivos locais para visualizar um frontend HTML/CSS na tela simulada de **640 × 480 (4:3)**.

**Importante:** nenhum código-fonte dos projetos Slot.R36S e PKForge R36S foi sincronizado automaticamente. São espaços para importar os arquivos reais; não são réplicas inventadas.

## Teste no navegador

1. Entre no Web Lab privado pelo Cloudflare Access.
2. Selecione Slot.R36S ou PKForge R36S no menu.
3. Clique em Importar pasta de frontend para selecionar arquivos HTML, CSS e imagens, ou escolha os arquivos individualmente. Se o projeto usa React/Vite, prepare uma versão estática HTML/CSS de referência.
4. Havendo HTML principal, ele será exibido na tela. Os CSS importados serão combinados e imagens locais PNG/JPG/WebP/GIF referenciadas pelo HTML serão resolvidas a partir da pasta selecionada.
5. Edite os campos HTML e CSS; o preview é atualizado automaticamente após 300 ms sem digitação.
6. Use Exportar prévia HTML para salvar uma cópia da interface. A exportação não altera firmware, backups ou partições.
7. Os eventos project_imported, project_preview_updated e project_exported poderão aparecer na aba Atividade, caso a sessão e o banco D1 estejam funcionando.

## Escopo e segurança

- Nenhuma ROM, imagem de cartão, BIOS ou HTML importado é enviada à Cloudflare. D1 registra apenas os eventos e seus metadados limitados.
- Imagens importadas permanecem na sessão. Rascunhos curtos de HTML/CSS podem ser armazenados no armazenamento local do mesmo navegador.
- Limite de 160 arquivos e 16 MiB totais por importação; arquivos HTML/CSS/XML até 1 MiB e imagens até 3 MiB.
- A prévia é um iframe com origem isolada (sandbox) e CSP que proíbe scripts, conexões de rede e formulários. HTML ativo e URLs externas não são executados. A prévia não é adequada para testar aplicações que dependem de JS, processos ARM ou emuladores nativos.
- O modelo 3D Sketchfab é hospedado por terceiros; a tela da prévia 2D não é injetada na superfície do modelo 3D.
- O nome de um workspace não certifica compatibilidade com ArkOS nem com as interfaces originalmente planejadas. Para fidelidade visual, é necessário importar o código/assets reais de cada projeto.

## ArkOS não é uma ISO de PC

O R36S usa Rockchip RK3326 e um cartão microSD com uma imagem de sistema geralmente distribuída em .img/.img.xz. O Firmware Lab só interpreta partes do cabeçalho dessas imagens. Não inicializa kernel, sistema operacional, GPU Mali, display, BIOS nem componentes do hardware.

Workers Free tem recursos de CPU/memória incompatíveis com uma máquina virtual RK3326 persistente. Uma fase futura precisará de um executor separado, com suporte técnico e validação para o hardware específico, além de entregar a saída de tela ao Web Lab. Um Linux ARM genérico no QEMU não prova que uma imagem ArkOS do R36S vai inicializar.

## Roadmap

- Integrar código/assets reais de Slot.R36S e PKForge R36S.
- Criar runner isolado mais completo para builds web confiáveis, como React/Vite, sem permitir execução arbitrária de arquivos de backup.
- Interpretar theme.xml e pacotes completos de temas EmulationStation conforme versão real do console.
- Adicionar armazenamento privado e versionamento de pequenas alterações no D1, com assets em armazenamento separado.
- Investigar um executor de hardware RK3326 verificável e interoperável com a tela 640 × 480; manter este componente fora do Worker gratuito.
