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

**C'è un secondo gate, e non è sui test: è sui CSS dei clienti** (oc:8613). I nove temi per istanza
vivono in `wm-core` e i due prodotti li pubblicano con una voce di `assets`; siccome nessuna build
li referenzia a compile-time, una cartella assente — tipicamente per un pin del submodule indietro —
darebbe una build **verde** e un deploy senza personalizzazioni. `wm-core/scripts/check-themes.js`
lo impedisce confrontando i temi trovati con l'elenco atteso, e in questo repo è invocato da:

| Dove | Cosa |
|---|---|
| `package.json` | `prebuild`, quindi ogni `npm run build`; più `deploy-cai`, `deploy-webcomponent` e i quattro script `surge-*`, che chiamano `ionic build` e scavalcherebbero il `prebuild` |
| `scripts/deploy-default.js`, `scripts/deploy-camminiditalia.js` | prima di buildare |
| `.github/workflows/preview.yml` | un passo dedicato, che prima verifica l'esistenza dello script e spiega il pin se manca |

`deploy_prod.yml` è coperto di riflesso, perché passa dagli script di deploy. Restano fuori solo
`ng build` e `ionic build` lanciati a mano, ed è coerente: non pubblicano niente.

**I deploy non cancellano sul server.** `deploy-default.js` usa `scp -r ./www/*` e
`deploy-camminiditalia.js` un `rsync` senza `--delete`: entrambi copiano sopra e non tolgono mai
niente. Vale anche per la mobile. La conseguenza pratica riguarda i temi per istanza: **cancellare
il CSS di un cliente dal repo non lo toglie dalla produzione**, il file resta sul server e continua
a essere servito. Disattivare un tema è due operazioni — il repo e il server — e il README dei temi
lo dice ora anche lì. `--delete` è stato valutato e rimandato: su un percorso sbagliato cancella
quello che trova (oc:8613).

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
