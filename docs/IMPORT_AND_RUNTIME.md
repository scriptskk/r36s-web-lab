# R36S Web Lab v0.8 — importação de projetos e botões traseiros

## Importação dos seus projetos

1. Entre no laboratório protegido pelo Cloudflare Access.
2. Abra **Projetos da Comunidade → SLOT36S** ou **PKForge R36S**.
3. Use **Importar projeto compactado (.zip)**, **Importar pasta**, ou selecione arquivos individualmente.
4. Na seção **Explorar arquivos importados**, veja os nomes, formatos e tamanhos disponíveis. Em **Tela HTML inicial**, escolha qual HTML abrir na tela do console.
5. Edite HTML/CSS e veja a prévia atualizar automaticamente. Se o ZIP tiver JavaScript web **de sua confiança**, ative explicitamente **Executar JavaScript web isolado (experimental)**. O modo padrão não executa scripts.
6. A tela continua com proporção 4:3 e área virtual de 640×480. Você pode usar os botões do R36S, teclado e gamepad. Uma prévia web não reproduz automaticamente APIs do ArkOS, binários ARM ou drivers de periféricos.

**Privacidade:** o ZIP, suas imagens e seus códigos são processados localmente. Não se faz upload do projeto para o GitHub nem para o banco D1. O D1 recebe somente registros de ações e contagens de arquivos.

**Limites e formatos:** ZIP até 32 MiB, descompactado até 16 MiB, até 160 arquivos válidos; cada arquivo HTML/CSS/JS/XML até 1 MiB e cada imagem até 3 MiB. ZIP comum com STORE/DEFLATE. Arquivos de ROM, BIOS e imagem de cartão .img/.iso não são executados por este importador. Se o navegador não suportar a descompressão ZIP usada, extraia a pasta e importe os arquivos diretamente.

## Botões R36S

A fotografia frontal do console não mostra fisicamente os gatilhos traseiros. Para não adulterar a imagem, o laboratório exibe controles discretos separados para L1, L2, R1 e R2.

| Botão | Teclado | Gamepad padrão | Ação no menu visual |
|---|---|---|---|
| L1 | Q | button 4 | Projeto: anterior; simulador: sistema anterior |
| R1 | E | button 5 | Projeto: próximo; simulador: próximo sistema |
| L2 | Z | button 6 | Projeto: voltar; simulador: voltar |
| R2 | C | button 7 | Projeto: selecionar; simulador: confirmar |

Nos projetos web com JS isolado, as entradas também são encaminhadas como eventos sintéticos de teclado ao iframe. Softwares que exigem eventos físicos confiáveis ou APIs nativas poderão ignorá-las; não é uma emulação de GPIO.

## JavaScript web experimental

O modo opcional executa scripts **locais** referenciados pelo HTML importado dentro de um iframe com `sandbox="allow-scripts"`, **sem** `allow-same-origin`. A resposta de `project-runtime.html` tem política CSP separada: não permite conexões de rede, formulários, objetos incorporados nem outros frames.

A origem fica isolada da sessão de login, do banco D1 e do armazenamento da página. Pode ter problemas com dependências npm, JavaScript ES Modules que importam chunks, React/Vite não compilados, `fetch()`, WebSockets ou qualquer código que exija servidores. A confirmação do modo experimental é necessária porque código de terceiros pode travar o próprio navegador; use apenas arquivos de confiança.

## Limites do ArkOS e fidelidade

O R36S usa um **Rockchip RK3326**, aproximadamente **1 GB de RAM** e um display **640×480**. O sistema ArkOS inicializa a partir de imagens de microSD e depende de bootloader, kernel, device tree e drivers do aparelho.

O Cloudflare Worker não pode executar uma VM persistente do R36S. Para boot e validação real de jogos, sistemas e aplicações ARM, será necessário um **runner separado** compatível com o RK3326 e seus periféricos, ou o próprio R36S físico como alvo de testes. Mesmo um QEMU ARM genérico não garante boot fiel de uma imagem ArkOS do R36S.

Próxima etapa: avaliar os arquivos originais de SLOT36S e PKForge R36S para identificar quais partes são web (HTML/CSS/JS), temas EmulationStation, scripts Linux, aplicativos ELF ARM ou dados de mídia. A partir daí, criar adaptadores específicos e testes de compatibilidade. **Nenhuma alegação de execução de 100% de jogos, sistemas ou firmware está validada nesta versão.**
