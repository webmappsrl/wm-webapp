# wm-webapp — CLAUDE.md

## Cos'è questo repo

La **webapp**, uno dei due prodotti Webmapp. L'altro è l'**app**, `webmapp-app`, che è un repo
diverso: entrambi montano gli stessi tre submodule condivisi — `wm-core`, `map-core`, `wm-types` —
ma sotto percorsi diversi (qui `src/app/shared/`, nell'app `core/src/app/shared/`).

Qui vivono app shell, environment, routing, configurazioni di build e deploy. Il dominio
condiviso — componenti, store, mappa, tipi — vive nei submodule, che hanno ciascuno il proprio
`CLAUDE.md`, la conoscenza per argomento in `docs/knowledge/` e le trappole in `.claude/rules/`.

Stack: Angular 20, Ionic 8, NgRx, Karma + Jasmine per gli unit test, Cypress per gli E2E.
Ordine di dipendenza: `wm-types` → `wm-core` → `wm-webapp`.

## Regole del repo

- **Ciò che riguarda un submodule si documenta nel submodule**, non qui. Questo file dice come
  usiamo il dominio condiviso in questo prodotto; come funziona lo dicono i loro.
- **`scripts/lib/run.js` e `scripts/serve.js` sono copie identiche di `webmapp-app`.** Non esiste
  un'astrazione condivisa: chi tocca uno dei due deve controllare l'altro, perché nessuno strumento
  segnalerà il drift.

## Comandi

| Cosa | Comando |
|---|---|
| Avviare in locale | `npm start` — legge `shardName` da `environment.ts` e sceglie da sé la configuration |
| Build | `npm run build` (`ng build`) |
| Deploy, entrambi i target | `npm run deploy` — orchestra `deploy-default` e `deploy-camminiditalia` |
| Deploy di un target solo | `npm run deploy-default` oppure `npm run deploy-camminiditalia` |
| Preview Surge di uno shard | `npm run surge-<shard>` (`sardegna`, `camminiditalia`, `carg`, …) |
| Test E2E | `npm run e2e` (avvia l'app e lancia Cypress) o `npm run e2e-gui` per la GUI |
| Cypress su un'app già avviata | `npm run cy:run`, oppure `npm run cy:open` |
| Test unitari | `ng test` (browser visuale) |
| Test unitari headless, come in CI | `CHROME_HEADLESS=1 ng test --configuration=ci` |
| Test di `wm-core` | da `src/app/shared/wm-core/`: `nvm use 22 && CI=true npx ng test wm-core --configuration=ci` |
| Test di `map-core` in CI | da `src/app/shared/map-core/`: `nvm use 22 && CI=true npx ng test map-core --configuration=ci` |
| Test di `map-core` completi | da `src/app/shared/map-core/`: `nvm use 22 && npx ng test map-core` — richiede una GPU |

Gli spec dei submodule **non girano da qui**: ognuno ha il proprio setup nel proprio repo.

## Convenzioni

- **Gli ID dei ticket hanno la forma `oc:<numero>`** e vengono da Orchestrator. Ogni documento
  sotto `docs/features/` inizia con `> Ticket: oc:<ID>`, e lo slug della cartella è
  `<ID>-<titolo-in-kebab-case>`. Lo scope dei commit porta il ticket: `feat(oc:<ID>): …`.
- **`docs/` ha tre destinazioni**: `features/` è il cantiere di un lavoro (com'è andato,
  immutabile), `knowledge/` la conoscenza per argomento (perché funziona così), `howto/` le
  procedure. Le trappole non stanno in nessuna delle tre: stanno in `.claude/rules/`.
- **Gli identificatori sono in inglese**, anche quando il testo che mostrano è in italiano:
  `hasContacts$`, non `hasInformazioni$`; `.wm-poi-properties-contacts`, non
  `.wm-poi-informazioni`. Vale per classi CSS, variabili CSS, membri e variabili TypeScript. La
  prosa — commenti, documentazione, descrizioni dei test — resta in italiano.
- **I nuovi selettori e le nuove classi CSS usano il prefisso `wm-`**, non `webmapp-`. Qui la
  transizione è più indietro che nei submodule — i componenti storici del repo sono
  `webmapp-poi-popup`, `webmapp-layer-box`, `webmapp-search-box` — ma i nuovi seguono `wm-`, e un
  selettore che deve combaciare con un componente di `wm-core` usa il nome che ha lì.
  Attenzione: `.eslintrc.json` dichiara ancora `prefix: "webmapp"` come `error`, ma è configurazione
  morta — `ng lint` non parte, perché estende `plugin:@angular-eslint/ng-cli-compat`, che non esiste
  più nella versione installata di `@angular-eslint`.
- **Documentazione, commenti e messaggi di commit sono in italiano**, i termini tecnici in inglese.

## Conoscenza

| Argomento | Cosa copre | Ticket | Pagina |
|---|---|---|---|
| CI, preview e deploy | I quattro job di `test.yml`, la preview Surge per PR, il gate sui test prima del deploy | oc:8022, oc:8382, oc:8512 | [docs/knowledge/ci-e-deploy.md](docs/knowledge/ci-e-deploy.md) |
| Test di questo repo | Cosa gira e cosa no, il confine `src/app/shared/`, il `MockStore` di `AppComponent` | oc:7989 | [docs/knowledge/test-di-questo-repo.md](docs/knowledge/test-di-questo-repo.md) |
| Mappa a tre fasce | Larghezze di home, mappa e dettaglio POI, e perché il dettaglio comincia sotto i controlli | oc:8406 | [docs/knowledge/mappa-a-tre-fasce.md](docs/knowledge/mappa-a-tre-fasce.md) |
| Tema e colori | Come il primary dell'istanza arriva ai componenti Ionic, e perché `variables.scss` è importato due volte | oc:8406 | [docs/knowledge/tema-e-colori.md](docs/knowledge/tema-e-colori.md) |
| Variante `camminiditalia` | La configuration Angular, `npm start` che la sceglie da sé, i tre script di deploy | oc:8512 | [docs/knowledge/variante-camminiditalia.md](docs/knowledge/variante-camminiditalia.md) |
| CSS custom per istanza | I nove file condivisi da `wm-core`, il `<link>` costruito a runtime, e perché una rinomina li scollega in silenzio | oc:8613 | [docs/knowledge/css-custom-per-istanza.md](docs/knowledge/css-custom-per-istanza.md) |

## Test E2E con Cypress

I test vivono in `cypress/e2e/`, le fixture in `cypress/fixtures/`. La regola è fixture e
`cy.intercept()` per i test di logica UI, API reali solo negli smoke test; la procedura completa —
cattura delle fixture, template, `visitWithPrivacy` — sta nel submodule che quei test esercitano:
[src/app/shared/wm-core/docs/howto/test-e2e-cypress.md](src/app/shared/wm-core/docs/howto/test-e2e-cypress.md).

## Trappole

Stanno in `.claude/rules/`, un file per soggetto, con il frontmatter `paths:` che le carica quando
si toccano i file corrispondenti: `test-e-spec` (la doppia registrazione di un nuovo spec),
`angular-config` (una configuration va dichiarata sia in `build` sia in `serve`, e i due script
gemelli di `webmapp-app`), `cypress-e2e` (`privacy-accepted` in `onBeforeLoad`, quale spec gira
in CI) e `css-per-istanza` (rinominare un selettore scollega il CSS di un cliente senza che nulla
lo segnali, e un figlio flex senza `order` risale in cima).
