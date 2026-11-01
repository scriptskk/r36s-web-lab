# R36S Web Lab

Simulador visual do R36S e laboratório de personalização do EmulationStation, desenvolvido para funcionar diretamente no navegador.

> **Escopo:** este projeto é uma reprodução interativa de interface. **Não é uma máquina virtual do ArkOS, um emulador de hardware RK3326 ou um executador de ROMs.** Os indicadores de bateria e status são ilustrativos.

![Prévia do R36S Web Lab](docs/preview.png)

## Recursos

- Console R36S construído com HTML e CSS, com tela simulada na proporção 4:3.
- Navegação por teclado, botões virtuais e Gamepad API (mapeamento padrão).
- Listas demonstrativas de sistemas e jogos sem distribuir ROMs ou BIOS.
- Editor de cores, fundos, escala tipográfica e efeito LCD, com prévia em tempo real.
- Exportação de um `theme.xml` inicial para testes em builds compatíveis do EmulationStation.
- Importação local de `gamelist.xml` com validação e limites de tamanho.
- Exportação em JSON da sessão atual.
- Preferências de aparência salvas localmente no navegador.
- Sem servidores próprios, rastreamento ou dependências JavaScript externas.

## Executar localmente

O site é estático: nenhuma instalação de dependências é necessária. Abra `index.html` em um navegador moderno, ou sirva os arquivos por HTTP para evitar limitações de módulos ES locais.

Com Python:

```bash
python3 -m http.server 4173
```

No Windows:

```powershell
py -m http.server 4173
```

Acesse `http://localhost:4173`.

Para os testes automatizados, instale Node.js 20 ou superior e execute:

```bash
npm test
```

## Teclas

| Ação | Teclado |
| --- | --- |
| Navegar | Setas |
| Confirmar | Enter |
| Voltar | Esc / Backspace |
| Menu | M |

Os controles USB/Bluetooth que usam o mapeamento padrão de Gamepad API também são suportados. A compatibilidade depende do navegador e do controle.

## Tema experimental

O botão **Exportar theme.xml** cria um arquivo XML com controles de paleta e lista de jogos do EmulationStation. Esta exportação é um **ponto de partida**: a prévia web não interpreta o motor real de temas, e forks do EmulationStation diferem em propriedades, pastas e compatibilidade.

Fluxo seguro para validação:

1. Faça backup do cartão microSD do R36S.
2. Verifique a variante do console e a versão do firmware.
3. Compare o XML com um tema funcional instalado no dispositivo.
4. Em uma cópia de teste do tema, aplique as alterações e valide o XML.
5. Teste no console antes de considerar o tema compatível.

**Não sobrescreva arquivos do sistema, bootloader, DTB ou firmware com arquivos exportados por este projeto.** O XML gerado não é uma imagem de sistema e não modifica o dispositivo.

## Privacidade e segurança

- Todos os arquivos importados são lidos pelo navegador localmente.
- O parser rejeita declarações `DOCTYPE` e `ENTITY`, limita arquivos XML a 2 MB e aceita até 2.000 nomes por biblioteca.
- Conteúdo importado é tratado como texto e escapado ao renderizar.
- Os dados da biblioteca ficam em memória durante a sessão. Somente as preferências visuais são persistidas no armazenamento local.
- Nenhuma ROM, BIOS, arquivo de firmware ou arte de terceiros é redistribuída.

## Estrutura

```text
r36s-web-lab/
├── index.html
├── styles.css
├── assets/
│   └── icon.svg
├── src/
│   ├── app.js
│   ├── model.js
│   └── export.js
├── tests/
│   └── model.test.js
└── .github/workflows/
    ├── ci.yml
    └── pages.yml
```

## GitHub Pages

1. Crie um repositório no GitHub e envie os arquivos para a branch `main`.
2. Abra **Settings → Pages** e escolha **GitHub Actions** como fonte de publicação.
3. O workflow `pages.yml` publica os arquivos estáticos a cada push em `main`.
4. O endereço padrão será `https://SEU-USUARIO.github.io/NOME-DO-REPOSITORIO/`.

Para atualizar o projeto depois:

```bash
git add .
git commit -m "feat: improve theme preview"
git push origin main
```

## Próximos passos

- Importar pastas completas de temas (incluindo `theme.xml`, `include` e assets).
- Prévia fiel de múltiplos layouts de EmulationStation e modos de lista.
- Analisador de `theme.xml`, com warnings e comparação de propriedades.
- Importação/exportação de projetos JSON no navegador.
- Testes de compatibilidade documentados com modelos reais de R36S.

## Referências e compatibilidade

- [Handhelds Wiki — R36S](https://handhelds.wiki/R36S)
- [Handhelds Wiki — Clones e variantes](https://handhelds.wiki/R36S_Clones)
- [EmulationStation — Especificação de temas](https://github.com/Aloshi/EmulationStation/blob/master/THEMES.md)
- [ArkOS — documentação da comunidade](https://github.com/Bassett88/arkosR36S)

R36S, ArkOS, EmulationStation e as plataformas citadas pertencem aos seus respectivos titulares. Este projeto é independente e não possui vínculo ou endosso dos desenvolvedores e fabricantes.

## Licença

MIT. Consulte [LICENSE](LICENSE). A licença abrange apenas os arquivos originais deste repositório, não softwares, marcas ou materiais de terceiros.
