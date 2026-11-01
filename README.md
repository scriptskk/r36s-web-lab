# R36S Web Lab

Ambiente de desenvolvimento e testes de interfaces para o console portátil **R36S**. O projeto reúne um console navegável, ferramentas de inspeção de arquivos e workspaces para aplicações da comunidade.

A aplicação web pode ser hospedada no Cloudflare Workers, com autenticação Cloudflare Access e registros de atividade em D1.

## Funcionalidades

| Área | Recursos |
| --- | --- |
| Simulador | Console interativo em 640 × 480, navegação por teclado/gamepad e controles L1, L2, R1 e R2 |
| Theme Studio | Ajustes visuais, prévia em tempo real e exportação inicial de configurações |
| Projetos da Comunidade | Importação de pastas/ZIPs, seleção de arquivos HTML, editor e prévia isolada |
| Firmware Lab | Inspeção de assinaturas e cabeçalhos de imagens locais, sem inicialização de firmware |
| Backup | Inventário local de arquivos, sem envio automático à nuvem |
| ROM Player | Experimento separado com EmulatorJS para alguns formatos, utilizando arquivos fornecidos pelo usuário |
| Atividade | Eventos de auditoria registrados no banco D1 na implantação privada |

O site usa um design monocromático com modos claro e escuro. A representação frontal do aparelho utiliza um recurso gráfico local; o modelo 3D externo fica em uma área independente.

## Projetos integrados

### [SLOT36S](community/slot36s/)

Catálogo visual de cartuchos com prévia HTML/CSS navegável. Permite validar layout, seleção de mídias e ajustes na tela virtual.

### [PokeForge R36S](community/pkforge-r36s/)

O importador reconhece o **PokeForge R36S v1.6**, distribuído como aplicação Go/ARM para ArkOS. Um adaptador web permite visualizar as telas de perfil, HOME, BOXES, BANK, PARTY, TRAINER, EDITOR, TOOLS e POKEDEX, utilizando o catálogo local do ZIP.

O adaptador não executa os binários ARM nem lê ou modifica saves de jogos. Os pacotes originais são carregados somente no navegador e não fazem parte deste repositório.

Mais informações: [Projetos da Comunidade](community/README.md) · [Compatibilidade do PokeForge](docs/POKEFORGE_NATIVE_ZIP.md).

## Desenvolvimento local

Requisitos: Node.js 22 ou superior para testes e Python 3 para servir a interface estática.

```bash
npm test
python3 -m http.server 4173
```

Abra `http://localhost:4173`. O servidor estático não oferece login nem banco de auditoria; utilize-o apenas para desenvolvimento e testes locais com arquivos não sensíveis.

Para gerar os arquivos publicados na Cloudflare:

```bash
npm install
npm run build:cloudflare
```

O build cria a pasta `dist/`. O deploy exige a configuração do Worker, bindings D1 e ASSETS e os segredos do Cloudflare Access. Consulte [a documentação de implantação](docs/CLOUDFLARE_FREE.md).

## Estrutura do repositório

```text
community/             Projetos e arquivos de prévia versionados
src/                   Interface, importadores e adaptadores
cloudflare/            Worker, autenticação e esquema D1
scripts/               Build de recursos estáticos
tests/                 Testes automatizados
docs/                  Guias de implantação e compatibilidade
private_server/        Backend Flask opcional
```

## Segurança e privacidade

A hospedagem do laboratório é privada, mas **o código no GitHub é público**.

- O Cloudflare Access controla a entrada. O Worker também valida os tokens e o administrador autorizado.
- Arquivos importados para prévia são processados localmente pelo navegador. Eventos de atividade podem ser enviados ao D1, mas o conteúdo dos projetos não é publicado automaticamente.
- A execução opcional de JavaScript web ocorre em iframe isolado, com restrições de origem e rede. Utilize somente projetos confiáveis.
- Não envie ROMs, BIOS, imagens completas de cartão, dados de save, senhas ou tokens para este repositório.

O R36S utiliza o Rockchip RK3326 e uma tela de 640 × 480. **O navegador não emula integralmente esse hardware ou o ArkOS**. A execução real de aplicativos nativos requer um executor Linux/ARM apropriado ou validação no aparelho físico.

## Contribuições

Issues e pull requests são bem-vindos para melhorias de interface, testes, compatibilidade, acessibilidade e documentação. Consulte [CONTRIBUTING.md](CONTRIBUTING.md) e [CHANGELOG.md](CHANGELOG.md).

## Licença e referências

O código original deste repositório está sob a licença [MIT](LICENSE). Recursos e projetos de terceiros mantêm suas respectivas licenças.

- [Modelo 3D do R36S por Moh1993 (Sketchfab)](https://sketchfab.com/3d-models/r36s-console-c6ecbfabf473479a8ffd73149090c5bb) — incorporado por iframe; não redistribuído.
- [ArkOS](https://github.com/christianhaitian/arkos/wiki) — projeto independente.
- [EmulatorJS](https://github.com/EmulatorJS/EmulatorJS) — componente opcional para emulação no navegador.
