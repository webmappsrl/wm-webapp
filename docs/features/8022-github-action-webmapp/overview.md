> Ticket: oc:8022

# GitHub Actions — wm-webapp CI/CD

## Cosa cambia

Il repository wm-webapp ottiene una pipeline CI/CD completa:

- **PRs e push su `develop`**: test unitari (wm-webapp, wm-core, map-core) + E2E Cypress + Surge preview automatico per review visiva
- **Push su `main`**: test unitari + E2E come prerequisito obbligatorio, poi deploy production solo se tutti i check passano

## Perché

Allo stato attuale:
- I test E2E (Cypress) sono configurati nel repo ma non girano mai in CI
- Il deploy su `main` parte senza alcun gate sui test — una regressione può andare in produzione
- `deploy_prod.yml` usa Node 16.19.1, incompatibile con Angular 20
- Non esiste un Surge preview per le PR, rendendo la review visiva manuale e dipendente dall'ambiente locale del reviewer

## Requisiti

- [ ] `test.yml` — aggiungere job E2E Cypress attivato su PR e push su `develop`
- [ ] E2E: avvia `ionic serve`, attende `http://localhost:8100` (timeout 280s), esegue `cypress run` in Chrome headless
- [ ] E2E: carica screenshot e video come artifact su failure
- [ ] E2E: esegue solo `cypress/e2e/home/home-layers-tab.cy.ts` — l'unico test CI-safe (fixture-based, no backend reale). Gli altri spec dipendono da API live o credenziali.
- [ ] `preview.yml` (nuovo) — job Surge preview con trigger `pull_request_target` (non `pull_request`) per garantire accesso ai secret anche da fork, e `push` su `develop`
- [ ] Surge domain: `<appId>.<shardName>.pr-<prNumber>.surge.sh` con default `appId=1`, `shardName=maphub`
- [ ] Surge domain: parametri `--id <appId>` e `--shard <shardName>` nel messaggio di commit per override
- [ ] Surge preview: link cliccabile nel GitHub Step Summary
- [ ] `preview.yml` — job `teardown` triggered su `pull_request.types: [closed]` che esegue `npx surge teardown <domain>` per eliminare il deployment orfano
- [ ] `deploy_prod.yml` — aggiungere `needs: [test-webapp, test-wm-core, test-map-core, e2e]` prima del deploy
- [ ] `deploy_prod.yml` — aggiornare `node-version` da `16.19.1` a `22`
- [ ] `deploy_prod.yml` — pinnare `nogsantos/scp-deploy` a SHA specifico (invece di `@master`)
- [ ] `deploy_prod.yml` — aggiungere trigger `workflow_dispatch` per hotfix manuali che bypassano il gate
- [ ] Tutti i workflow — pinnare `@ionic/cli` a versione specifica (es. `@ionic/cli@7`) invece di installare `@latest`

## Rischi

- **E2E lenti in CI**: `ionic serve` in ambiente headless può richiedere fino a 3-4 minuti di startup. Mitigazione: `wait-on-timeout: 280` (come PAP) e `cache: npm` per ridurre `npm install`.
- **Surge preview non funzionale a runtime**: `1.maphub.pr-32.surge.sh` è un hostname a 5 parti che non matcha la regex di `EnvironmentService` → l'app userà `appId=1, shardName='geohub'` invece di `maphub`. La preview carica ma potrebbe non usare la shard corretta. Scope: accettato — la preview serve per review visiva, non per test funzionali.
- **Secret mancanti**: `SURGE_EMAIL`, `SURGE_TOKEN`, `CYPRESS_EMAIL`, `CYPRESS_PASSWORD` devono essere aggiunti al repo GitHub prima che la pipeline funzioni completamente. Documentati nella checklist finale come prerequisiti manuali.
- **E2E dipendenti da backend esterno**: alcuni test usano `cy.request()` verso `geohub.webmapp.it` invece di fixture — il gate può risultare verde anche se il backend è irraggiungibile (i test skippano con `cy.log` invece di fallire). Rischio accettato consapevolmente; la migrazione completa a fixture è fuori scope.

## Out of scope

- Correzione della regex di `EnvironmentService` per hostname a 5 parti
- Espansione della copertura dei test E2E (viene solo integrato il runner CI per i test esistenti)
- Surge preview su `main` (solo PRs e `develop`)
- Modifica del meccanismo di deploy SSH in produzione

## Moduli toccati

Tutti nel repo principale `wm-webapp`:

- `.github/workflows/test.yml` — aggiunta job `e2e`
- `.github/workflows/deploy_prod.yml` — gate test + Node 22
- `.github/workflows/preview.yml` — nuovo file per Surge preview
