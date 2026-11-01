# SLOT36S

Interface experimental de navegação por mídias para o R36S.

## Visão geral

Este diretório reúne uma prévia interativa do catálogo de cartuchos, adaptada para a tela de **640 × 480 (4:3)**. A primeira implementação utiliza um cartucho de Game Boy Advance como referência visual.

A prévia serve para validar composição, dimensões, organização da biblioteca e comportamento dos controles antes da integração com o tema definitivo do aparelho.

## Estrutura

| Arquivo | Descrição |
| --- | --- |
| [preview.html](preview.html) | Composição da tela e itens navegáveis |
| [style.css](style.css) | Estilos do catálogo e do cartucho |
| [assets/cartucho-historico.webp](assets/cartucho-historico.webp) | Arte de referência usada na prévia |

## Como testar

1. Acesse o R36S Web Lab.
2. Abra **Projetos da Comunidade → SLOT36S**.
3. Selecione **Carregar / atualizar prévia do GitHub**.
4. Utilize o direcional, A/B ou o teclado para explorar os itens.
5. Edite HTML e CSS no workspace para comparar alterações na tela do console.

## Compatibilidade

Esta implementação é uma **prévia web**. Não constitui um tema EmulationStation instalado no ArkOS e não inicializa ROMs ou aplicativos do R36S. A integração de recursos nativos dependerá dos arquivos e das especificações correspondentes.

Não inclua ROMs, BIOS, backups pessoais ou credenciais neste repositório.
