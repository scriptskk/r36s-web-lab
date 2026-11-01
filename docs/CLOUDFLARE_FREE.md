# Cloudflare Free — deployment guide

This option uses Cloudflare Workers, Access and D1. The source code stays public on GitHub. Only the administrator can access the deployed application after completing configuration.

**Deployment:** The main repository is connected to a Cloudflare Worker. New forks and installations must configure their own account, Access policy, D1 database and secrets. The Worker rejects requests if the required authentication settings are absent.

## Free-tier considerations

- Cloudflare Workers Free: 100,000 Worker requests/day, 10 ms CPU per invocation, 128 MB memory.
- D1 Free: 5 GB total storage; daily row read/write limits.
- Cloudflare Access Zero Trust Free: authorize one specific email identity. Onboarding may require payment details even for the free plan.
- R2 storage: up to 10 GB-month free Standard storage, NOT enabled or needed for this version. A 128 GB microSD image is too large for the allowance.
- None of these services emulates RK3326/ArkOS. Browser-based emulation of selected ROMs is a separate experimental feature.

## 1 — Cloudflare account

Go to https://dash.cloudflare.com/ and create an account with 2FA. Enable Zero Trust Free, choose a team name and verify all billing/onboarding requirements.

## 2 — D1 database

Open Workers & Pages → D1 SQL Database and create a database named r36s-web-lab.

Copy the database UUID and set the corresponding `database_id` in your copy of `wrangler.jsonc`. Use your own D1 database when deploying a fork; an existing repository configuration may point to the original installation. The UUID is an identifier, not a password.

Execute the contents of cloudflare/schema.sql in the Cloudflare D1 SQL console, or from an authenticated local checkout:

~~~bash
npx wrangler d1 execute r36s-web-lab --remote --file=cloudflare/schema.sql
~~~

The existing D1 database must be retained across redeploys so logs remain available.

## 3 — GitHub integration

In Workers & Pages → Create application → GitHub, authorize the repository you intend to deploy and select its `main` branch. Choose a Worker name that matches the `name` setting in your `wrangler.jsonc`.

Build command: npm run build:cloudflare

Deploy command: npx wrangler deploy

Root directory: repository root.

The script copies ONLY the public web app into dist/. It excludes private Python code, databases, backups, firmware, secrets and development files.

The Worker uses run_worker_first=true to verify identity on every request, including static files. Do not remove this setting.

## 4 — Access policy

Select the Worker → Access → Protect this Worker behind Access. Require authentication for ALL traffic (production and preview URLs). Allow ONLY your exact email address, not an entire email domain.

Use Cloudflare login, one-time PIN or an identity provider supported by your Access organization.

After creating the Access application, find its Application Audience (AUD) tag under Zero Trust → Access → Applications. Also note your team domain, in the format https://your-team.cloudflareaccess.com.

## 5 — Runtime configuration

In Worker Settings → Variables and Secrets, add:

| Name | Type | Value |
| --- | --- | --- |
| TEAM_DOMAIN | Text | https://your-team.cloudflareaccess.com |
| POLICY_AUD | Text | Exact Application Audience AUD tag |
| ADMIN_EMAIL | Text | Your own allowed email |
| CSRF_SECRET | Secret | Random 32+ character string |

Enter secrets directly into the Cloudflare dashboard. Never commit credentials to GitHub or paste them into chat. A missing configuration returns HTTP 503. An invalid or missing signed Access JWT returns HTTP 403. This prevents unintentionally publishing the simulator as a public site.

## 6 — Verification

1. Visit the Worker URL from an incognito window. Without login it must not reveal the dashboard or source files.
2. Authenticate as the exact allowed identity. The dashboard should appear.
3. Open Atividade, perform a theme change, refresh and confirm the entry survived.
4. Sign out using the application logout action and try an unauthorized identity. It must be rejected.
5. Trigger a new deployment by pushing a change to main. Verify the D1 log persisted across the deployment.
6. Confirm any old GitHub Pages publication was manually disabled (deleting pages.yml does not unpublish an existing site).

For a new installation, complete every verification step before importing private files. Successful CI tests alone do not prove that Access policies or environment secrets are configured correctly.

## Design and limits

The Access login is provided by Cloudflare and is not the Flask password form. D1 is a managed SQLite-compatible service, not a local SQLite file. The app's existing /api/session and /api/audit frontend calls are implemented by cloudflare/worker.js.

JWT signatures are checked against the rotating keys of your Cloudflare Access team, together with issuer, audience and administrator email. Session event posts also require a signed CSRF token and matching Origin.

The server stores minimal event metadata, not ROMs, BIOS, emails or backups. Logs are not immutable forensic evidence. The ROM Player may fetch EmulatorJS code from an external CDN; the model viewer connects to Sketchfab.

The free Worker is NOT suitable for running an RK3326 virtual machine, processing hundreds of GB of backup images, or providing physical hardware emulation. Those require a different execution environment.

References: https://developers.cloudflare.com/workers/configuration/cloudflare-access/ and https://developers.cloudflare.com/d1/platform/pricing/.
