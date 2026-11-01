# Projetos da Comunidade

Workspaces de interface e experimentação mantidos no **R36S Web Lab**.

| Projeto | Estado | Abrir |
| --- | --- | --- |
| **SLOT36S** | Catálogo de cartuchos com prévia web navegável | [Documentação](slot36s/README.md) |
| **PokeForge R36S** | Adaptador para pacote nativo Go/ARM v1.6 importado por ZIP | [Documentação](pkforge-r36s/README.md) |

## Fluxo de desenvolvimento

1. Abra o laboratório privado e selecione **Projetos da Comunidade**.
2. Escolha o workspace desejado.
3. Para o SLOT36S, carregue a prévia do repositório ou importe sua própria interface HTML/CSS.
4. Para o PokeForge v1.6, selecione o ZIP original no importador. O aplicativo será reconhecido e a interface de referência poderá ser navegada.
5. Teste a disposição na tela 640 × 480 e os comandos do console. Exporte a prévia HTML quando necessário.

Alterações locais feitas no navegador não criam commits automaticamente. As versões disponíveis no GitHub são atualizadas por commits normais e republicadas pela Cloudflare.

## Organização

- [Catálogo de projetos](catalog.json): identificadores, arquivos de prévia e tipos de importação.
- [SLOT36S](slot36s/): layout e recursos visuais do catálogo de cartuchos.
- [PokeForge R36S](pkforge-r36s/): prévia web padrão e documentação do adaptador nativo.

## Escopo

O código deste repositório é público; o laboratório implantado utiliza autenticação Cloudflare Access. **Não publique** ROMs, BIOS, imagens ArkOS, dados de save, segredos ou os arquivos privados originais dos projetos.

As prévias servem para testes de interface. Elas não equivalem à execução integral do ArkOS nem substituem a validação em hardware real.
