> Ticket: oc:7989

# Fix: configurazione Karma/test non funzionante in wm-webapp

## Cosa cambia

Il sistema di test Karma diventa eseguibile sia in locale che in CI. Vengono risolti i tre blocchi che impedivano l'avvio del test runner, e viene aggiunto un workflow GitHub Actions separato che esegue i test su ogni PR e push su `develop`.

## Perché

I test non erano avviabili a causa di tre problemi distinti emersi durante lo sviluppo di `oc:7988`:
1. `zone.js` v0.15.x ha rimosso la cartella `dist/` — l'import `zone.js/dist/zone-testing` in `src/test.ts` non esiste più
2. `tsconfig.spec.json` raccoglieva tutti i `*.spec.ts` sotto `src/` inclusi quelli dei submodule (`map-core`, `wm-core`), i cui path alias (`src/readonly`, `src/types/model`, `src/utils`, `src/components`, `src/const.spec`) non sono mappati nel `tsconfig.json` di wm-webapp
3. `karma.conf.js` non supporta Chrome headless, rendendo i test non eseguibili in ambienti CI (Ubuntu, no display)

## Requisiti

- [ ] `src/test.ts`: aggiornare l'import di zone.js da `zone.js/dist/zone-testing` a `zone.js/testing`
- [ ] `tsconfig.spec.json`: escludere i path dei submodule (`src/app/shared/**`) per limitare il test scope al solo codice di wm-webapp
- [ ] `karma.conf.js`: aggiungere il launcher `ChromeHeadlessNoSandbox` e selezionarlo automaticamente quando `process.env.CI` o `process.env.CHROME_HEADLESS` è impostato (per supportare anche ambienti non-GitHub-Actions)
- [ ] `src/app/app.component.spec.ts`: verificare lo stato e fixare eventuali errori — almeno un test deve passare perché la CI abbia senso
- [ ] `.github/workflows/test.yml`: creare un workflow GitHub Actions separato che gira su push a `develop` e su ogni PR; usare `ng test --configuration=ci` (config già presente in `angular.json`) e `browser-actions/setup-chrome@v1` per fissare la versione di Chrome

## Rischi

- **Riduzione della coverage rilevata**: escludendo i spec dei submodule, i test visibili da wm-webapp diminuiscono. Rischio mitigato: i submodule hanno i propri setup di test nei rispettivi repo, quindi non si perde copertura reale.
- **Esclusione per path fragile**: `src/app/shared/**` funziona finché tutti i submodule sono montati lì. Se un futuro submodule venisse montato altrove, sfuggirebbe all'esclusione. Rischio mitigato: documentare in `CLAUDE.md` la convenzione che tutti i submodule devono stare sotto `src/app/shared/`.
- **Chrome non disponibile nel runner CI**: la versione di Chrome varia con l'immagine `ubuntu-latest`. Rischio mitigato: `browser-actions/setup-chrome@v1` installa una versione stabile garantita dall'action, indipendente dall'immagine runner.
- **`process.env.CI` non impostato in ambienti non-GitHub-Actions**: Rischio mitigato: condizione `CI || CHROME_HEADLESS` permette di forzare headless anche in ambienti custom.

## Out of scope

- Fix di `ec.service.spec.ts` (costruttore `EcService` con argomenti mancanti) — problema nel submodule `wm-core`, rimandato al suo repo
- Fix dei test nei submodule `map-core` e `wm-core` nei rispettivi contesti
- Report di code coverage
- Test e2e (Cypress)
- Aggiornamento del workflow di deploy (`deploy_prod.yml`) che usa `node-version: 16.19.1` incompatibile con Angular 20

## Moduli toccati

Tutti i file sono nel repo **wm-webapp** (nessuna modifica ai submodule):

| File | Operazione |
|---|---|
| `src/test.ts` | Modifica — fix import zone.js |
| `tsconfig.spec.json` | Modifica — aggiunge `exclude` per submodule |
| `karma.conf.js` | Modifica — aggiunge ChromeHeadlessNoSandbox con doppia condizione env |
| `src/app/app.component.spec.ts` | Verifica e fix — almeno un test deve passare |
| `.github/workflows/test.yml` | Creazione — nuovo workflow CI con setup-chrome |
