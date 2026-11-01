# Hospedagem privada na nuvem — Render

O repositório GitHub contém o código aberto. A instância Render recebe a autenticação e o banco de dados. Uma URL pública do Render **não é uma rede privada**: qualquer pessoa pode abrir a página de login, mas as rotas, telas e dados do laboratório exigem autenticação.

## Implantação inicial

1. Entre em [Render](https://dashboard.render.com/) com sua conta.
2. No painel, abra **New → Blueprint** e autorize acesso ao repositório `scriptskk/r36s-web-lab`.
3. Use o arquivo `render.yaml` que já está na raiz do GitHub.
4. Confira a configuração e o preço antes de aprovar:
   - Serviço `r36s-web-lab-private`, Python, região **Virginia**.
   - Plano de computação `0.5c-512mb` (Starter, 512 MB RAM).
   - Disco **1 GB**, montado em `/var/data`, para SQLite e chave de sessão.
   - Branch `main`, deploy depois que a CI for aprovada.
5. Quando o Render solicitar `R36S_INITIAL_PASSWORD`, digite **uma senha nova, exclusiva, de 20 caracteres ou mais**, diretamente no Render. Nunca a coloque no ChatGPT, GitHub, YAML, README ou prints.
6. Depois de finalizar o Blueprint, abra a URL HTTPS gerada para **seu** serviço. No primeiro acesso, informe a mesma senha; o servidor já terá criado um hash scrypt dentro do SQLite.
7. Entre em **Environment** do serviço e remova `R36S_INITIAL_PASSWORD` depois do primeiro login validado. Ela não é mais necessária após o cadastro inicial. Uma mudança no ambiente pode disparar novo deploy; o administrador continua no disco.
8. Em **Settings → Pages** no GitHub, confirme que o site Pages antigo foi despublicado. A exclusão do workflow não remove conteúdo previamente publicado.

Não foi criado um serviço Render automaticamente; a criação requer autorização da sua conta Render e pode gerar cobranças.

## Configuração do Blueprint

~~~yaml
services:
  - type: web
    name: r36s-web-lab-private
    runtime: python
    plan: 0.5c-512mb
    region: virginia
    branch: main
    autoDeployTrigger: checksPass
    buildCommand: pip install -r requirements-private.txt
    startCommand: gunicorn --workers 1 --worker-class gthread --threads 4 --timeout 45 --bind 0.0.0.0:$PORT "private_server.app:create_app()"
    healthCheckPath: /healthz
    disk:
      name: r36s-app-data
      mountPath: /var/data
      sizeGB: 1
    envVars:
      - key: R36S_DATA_DIR
        value: /var/data
      - key: R36S_REQUIRE_ADMIN_ON_START
        value: "1"
      - key: R36S_INITIAL_PASSWORD
        sync: false
~~~

O provedor solicita o segredo na criação do Blueprint. Se o banco não possuir administrador e a senha inicial não tiver sido fornecida corretamente, o servidor **não inicializa**; o código não fornece credenciais padrão.

## Custos estimados

Na tabela pública do Render consultada em novembro de 2026, o serviço **0.5c-512mb** custa aproximadamente **US$ 7/mês**, e discos persistentes custam **US$ 0,25/GB/mês**. Para 1 GB, a base aproximada é **US$ 7,25/mês**, antes de eventuais custos adicionais, taxas, egress ou mudanças de preços. Confirme o resumo no painel antes de aceitar.

**Atenção:** 512 MB são suficientes apenas como ponto de partida para o painel Flask e o banco pequeno, não para emulação de firmware ou armazenamento de backup de 128 GB. O 1 GB do disco também serve **somente** para estado da aplicação, não para uma biblioteca completa de ROMs.

## Segurança, restauração e limites atuais

- URL pública com conteúdo protegido por login único e CSRF. Senha forte e HTTPS são obrigatórios. Um segundo fator/SSO não foi implementado.
- O hash da senha, chave de sessão e logs SQLite ficam em `/var/data` (montagem persistente). Os dados fora dessa pasta serão perdidos em redeploy.
- O processo usa um worker Gunicorn para manter o limitador de login em memória coerente nesta versão. Para múltiplas instâncias, migrar rate limiting para armazenamento compartilhado antes de escalar.
- Os eventos SQLite não são um log inviolável e não cobrem alterações feitas fora da aplicação.
- Configure restauração e cópias externas de dados de forma periódica. Snapshots do provedor não substituem um backup independente.
- A integração 3D Sketchfab e o ROM Player carregam recursos de terceiros quando utilizados. ROMs e BIOS fornecidos pelo usuário não são distribuídos.
- **Ainda não existe upload de imagem de SD para servidor, extração completa de imagem, armazenamento da sua biblioteca, GPU Mali-G31 virtualizada ou boot ArkOS real.** O Firmware Lab só inspeciona o início de uma imagem local. O Backup Lab cataloga arquivos da pasta extraída localmente.
- Em fase posterior, quando houver upload de arquivos, separar armazenamento de objetos (S3 ou compatível), criar quotas, validação de formatos e extração sem privilégios. Não expor diretórios nem aceitar execução de arquivos enviados.

## Problemas conhecidos

**Erro de inicialização sem administrador:** se `R36S_INITIAL_PASSWORD` não estiver presente na **primeira** implantação, inclua o segredo na área Environment do Render e inicie novo deploy. Não insira o segredo no repositório.

**Banco desaparece após reiniciar:** confirme o disco persistente montado em `/var/data` e a variável `R36S_DATA_DIR=/var/data` antes de continuar. Não recrie o banco sobre uma configuração errada.

**Emulação lenta:** o plano inicial não tem GPU nem garantias equivalentes ao R36S. A aplicação web não representa um ambiente RK3326 preciso.

## Próxima etapa

Depois de confirmar o login no domínio Render e a persistência do SQLite após reiniciar, podemos planejar armazenamento externo para o backup e um serviço de emulação separado, com controles de isolamento. Não inclua imagens do seu SD no GitHub.
