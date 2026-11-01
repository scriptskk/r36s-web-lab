# PokeForge R36S v1.6 — adaptador de prévia Go/ARM

## Origem da compatibilidade

O arquivo PokeForge-R36S-v1.6-Pokedex-Geracoes-Bank-PK3.zip foi analisado como pacote do usuário. Contém scripts de inicialização em EASYROMS/ports/, binários ARM32/ARM64, código-fonte em Go, fontes de tela de framebuffer /dev/fb0 e entrada /dev/input/event*, além de data/pokedex.json com 151 espécies de Kanto.

Nenhum conteúdo do ZIP — nem executáveis ARM, arquivos de save, código-fonte ou catálogo — foi enviado a este repositório público. O navegador lê o ZIP selecionado somente na sessão atual.

## Abrir no laboratório

1. Abra o R36S Web Lab privado, entre com Cloudflare Access e atualize a página.
2. Vá para Projetos da Comunidade → PKForge R36S.
3. Em Importar projeto compactado (.zip), escolha o ZIP original do PokeForge v1.6, sem extrair previamente.
4. O laboratório reconhece os marcadores codigo-fonte/main.go e EASYROMS/ports/PokeForge R36S.sh, importa o catálogo Pokédex local e abre a prévia interativa 640 × 480.
5. Use os botões físicos simulados ou teclado: **L2/R2** troca as telas, **L1/R1** alterna boxes ou gerações, **setas** navegam as opções, **A** abre opções e **B** volta.
6. Para a versão original, somente a geração I está presente no catálogo offline. Gerações posteriores indicam que o banco não foi instalado, em vez de inventar espécies.
7. O explorador de arquivos mostra apenas fontes suportadas; executáveis nativos, arquivos de save e áudio não são enviados à Cloudflare ou executados.

## Limites de compatibilidade — não afirmar emulação real

Esta integração é um **adaptador visual de fluxo de interface** inspirado no código Go original, não um porte completo do PokeForge, um VM RK3326 ou um processo ARM. Ele reproduz as oito telas, layout do menu, grade de 30 slots e o catálogo offline. Não lê nem modifica saves reais, perfis, bank local, exportações PK3, framebuffer, áudio, animações nem recursos nativos.

Elementos nativos que não podem ser executados exibem uma mensagem explicativa de simulação. Nenhuma alteração é feita nos arquivos do usuário.

Para rodar o aplicativo original integralmente, seria necessário um executor Linux ARM com framebuffer e input compatíveis, ou o próprio R36S físico. Um Cloudflare Worker não emula os dispositivos reais.

## Investigação de erros

- **ZIP não abre**: verifique a mensagem de diagnóstico no painel. Arquivos maiores que 32 MB ou tipos ZIP não suportados serão rejeitados. Não use uma imagem ArkOS .img como projeto ZIP.
- **Tela em branco**: veja se o navegador carregou a versão atualizada, e confira a sessão Cloudflare Access.
- **PokeForge reconhecido, mas sem sprites**: o arquivo inclui fonte e catálogo de Kanto, sem sprites proprietários instalados no pacote. O adaptador de interface não tem renderização de sprites GIF/PNG locais.
- **Código-fonte sem HTML**: essa é a estrutura esperada para este PokeForge, pois usa Go + Linux framebuffer, não HTML/React.
