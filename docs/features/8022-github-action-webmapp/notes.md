> Ticket: oc:8022

# Notes — GitHub Actions wm-webapp CI/CD

## Deviazioni dal piano

### E2E: spec ristretto a un solo file
Il piano prevedeva di escludere solo `cypress/e2e/32/` con `excludeSpecPattern`. Durante l'analisi è emerso che quasi tutti gli altri spec usano `cy.request()` verso backend reali (`geohub.webmapp.it`, elastic). Solo `home-layers-tab.cy.ts` è scritto con fixture + intercept ed è quindi CI-safe. Il job E2E usa `spec: cypress/e2e/home/home-layers-tab.cy.ts` invece di un pattern di esclusione.

### Fixture basate su camminiditalia app 1
Le fixture Cypress (`conf-1.json`, `elastic-*.json`) sono state generate dall'API di `camminiditalia` con `appId=1` invece che da `geohub` con `appId=52`. Il motivo: l'elastic di geohub/52 non aveva dati indicizzati per le query usate nei test (`bolo`, `camm`, ecc.). Le fixture di camminiditalia hanno prodotto dati reali e consistenti, incluso `elastic-camm` con esattamente 72 layer bucket (valore atteso dal test Scenario 1b).

### environment.ts aggiornato a camminiditalia
Per allineare l'app locale (usata da `ionic serve` in CI) con le fixture, `environment.ts` è stato aggiornato a `appId: 1, shardName: 'camminiditalia'`. Il precedente `appId: 52, shardName: 'geohub'` causava il fallimento dello Scenario 4 (layer 55 non corrispondeva).

### Deploy via npm run deploy + sshpass
Il piano iniziale usava `nogsantos/scp-deploy` action. Sostituita con `sshpass + scp` che richiama direttamente `npm run deploy` (split in build + scp per poter wrappare solo il scp con sshpass). Il server non accetta chiavi SSH, solo password.

### CYPRESS_EMAIL/PASSWORD rimossi dal job e2e
Il piano includeva `CYPRESS_EMAIL` e `CYPRESS_PASSWORD` come env per il job E2E. Rimossi: `home-layers-tab.cy.ts` non usa `e2eLogin()`.

## Decisioni

- `pull_request_target` per il preview Surge: garantisce accesso ai secret anche da fork. Checkout dell'HEAD della PR per build del codice corretto.
- Surge teardown automatico su PR close: job separato nello stesso `preview.yml`, triggered su `types: [closed]`.
- Node 22 fisso nel deploy, `lts/*` nei test: i test possono tollerare aggiornamenti automatici di Node, il deploy deve essere stabile.

## Follow-up

- Gli altri Cypress spec (`home.spec.cy.ts`, `home-layerSelected.spec.cy.ts`, ecc.) andrebbero migrati a fixture + intercept per poter girare in CI. Ora eseguibili solo in locale con backend live.
- Scenario 4 di `home-layers-tab.cy.ts` (`deve mostrare il tab TRACKS attivo`) passa solo con `appId=1/camminiditalia`. Se `environment.ts` venisse reimpostato a `geohub/52`, il test tornerebbe a fallire per mancanza di layer 55 nel conf.
- Valutare se aggiungere `SURGE_EMAIL/TOKEN/SSH_PASSWORD/SSH_HOST/SSH_USER/SSH_PORT` come secret GitHub prima di fare merge su `main`.
