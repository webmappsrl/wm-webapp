# CI, preview e deploy

## Come funziona oggi

**`test.yml`** gira su ogni PR e su push a `develop`, con quattro job: i test unitari di
`wm-webapp`, `wm-core` e `map-core`, più `e2e` — Cypress in Chrome headless, che avvia
`ionic serve` e attende `localhost:8100`.

**`preview.yml`** pubblica una preview Surge per ogni PR, con dominio
`<appId>.<shardName>.pr-<prNumber>.surge.sh` e link cliccabile nello Step Summary; un job di
teardown la rimuove alla chiusura della PR. Gli override `--id` e `--shard` si passano nel
messaggio di commit.

**`deploy_prod.yml`** parte sul push a `main` ed è **gatato sui test**: senza il verde di tutti e
quattro i job non deploya. Ha anche un `workflow_dispatch` per gli hotfix che devono bypassare il
gate, e un input `target` per scegliere quale deploy lanciare.

## Perché così

- **Il gate esisteva solo nelle intenzioni** (oc:8022): prima il deploy su `main` partiva senza
  alcun controllo sui test, e una regressione poteva andare in produzione senza che nulla la
  fermasse. Gli E2E, per giunta, erano configurati nel repo ma non giravano mai in CI.
- **In CI gira un solo spec Cypress**, `cypress/e2e/home/home-layers-tab.cy.ts` (oc:8022): è
  l'unico CI-safe, perché basato su fixture e senza backend reale. Gli altri dipendono da API vive
  o da credenziali, e in CI fallirebbero per motivi che non riguardano il codice.
- **`preview.yml` usa `pull_request_target`, non `pull_request`** (oc:8022): serve perché i secret
  siano disponibili anche sulle PR che arrivano da un fork.
- **`sshpass -e` avvolge `scp`/`ssh` solo se `SSHPASS` è impostata** (oc:8512): in CI
  l'autenticazione è a password, in locale è a chiave e `~/.ssh/config` fa già tutto. `rsync` non
  ha bisogno dello stesso trattamento: legge nativamente `RSYNC_RSH`, che il workflow imposta.
- **Il deploy su `main` è automatico** (oc:8512), decisione che **inverte** quella presa
  inizialmente («non renderlo automatico») e cambiata dal developer in review-gate, prima dei
  commit.
- **`surge-camminiditalia` usa `--prod` come tutti gli altri** (oc:8382): era l'unico script di
  deploy del repo a non farlo. La build `--prod` di questo repo era già pulita — zero errori, solo
  warning non bloccanti su bundle-budget e `@import` Sass — quindi serviva solo coerenza fra
  script, non un fix di codice.

## Debito noto

- **La preview Surge può usare lo shard sbagliato** (oc:8022): `1.maphub.pr-32.surge.sh` è un
  hostname a cinque parti che non matcha la regex di `EnvironmentService`, quindi l'app ricade su
  `appId=1, shardName='geohub'`. Accettato: la preview serve alla review visiva, non ai test
  funzionali.
