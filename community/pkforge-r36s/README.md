# PokeForge R36S

Workspace de desenvolvimento e validação da interface do **PokeForge R36S**, aplicativo nativo para Linux/ArkOS.

## Integração disponível

O R36S Web Lab reconhece a distribuição **PokeForge R36S v1.6** em formato ZIP. O pacote utiliza código Go, executáveis ARM e acesso ao framebuffer do Linux.

Ao importar o ZIP na área **Projetos da Comunidade → PKForge R36S**, o laboratório apresenta um adaptador navegável em 640 × 480 com:

- Seleção de perfil e navegação pelas telas HOME, BOXES, BANK, PARTY, TRAINER, EDITOR, TOOLS e POKEDEX.
- Direcional e botões A/B para navegar; L1/R1 e L2/R2 para alternar itens, boxes, gerações e telas.
- Leitura local do catálogo Pokédex incluído no arquivo selecionado.

O adaptador reproduz o fluxo visual da aplicação. **Ele não executa os binários ARM, não altera saves e não inicializa o ArkOS.**

## Arquivos do repositório

| Arquivo | Função |
| --- | --- |
| [preview.html](preview.html) | Tela web de referência usada quando nenhum ZIP local está carregado |
| [style.css](style.css) | Estilos da tela de referência |
| [Adaptador nativo](../../src/pokeforge-native-preview.js) | Componentes e navegação da prévia do aplicativo Go/ARM |
| [Guia de importação](../../docs/POKEFORGE_NATIVE_ZIP.md) | Procedimento de testes com o pacote v1.6 |

## Desenvolvimento

O pacote original permanece no dispositivo do usuário e **não é publicado no GitHub**. Para testá-lo, importe-o pelo navegador. Alterações feitas no editor web criam rascunhos locais; somente alterações enviadas ao repositório por commit passam a integrar a versão publicada.

A execução completa do aplicativo exige Linux ARM com framebuffer e dispositivos de entrada compatíveis, ou testes no próprio R36S.
