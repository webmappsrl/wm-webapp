> Ticket: oc:8684

# POI non visibili nella sezione "Filtri": piano per `wm-webapp`

> **Nessun commit, `git add` o branch in autonomia.** I commit indicati sono istruzioni testuali per
> il dev.

**Obiettivo:** un test Cypress che riproduca lo screenshot del cliente e verifichi la correzione in
`wm-core`, più l'aggiornamento del puntatore del submodule.

**Spec:** [overview.md](overview.md). Il codice sta nel piano di `wm-core`:
`src/app/shared/wm-core/docs/features/8684-poi-non-visibili-nella-sezione-filtri-dellapp/plan.md`.

## Vincoli globali

- Fixture e `cy.intercept()`, nessuna API reale; `privacy-accepted` va impostato in `onBeforeLoad`
  (`.claude/rules/cypress-e2e.md`).
- Modello: `cypress/e2e/home/home-layers-tab.cy.ts` (`setupIntercepts`, `visitWithPrivacy`,
  `waitForApp`, `clearTestState`). In CI girano tutti gli spec non marcati `describe.skip`.

---

### Task 1: Fixture

> ⚠️ L'implementazione ha deviato da questo task: [notes.md](notes.md#task-1-fixture)

**File:**
- Crea: `cypress/fixtures/track-183.json`, da
  `https://wmfe.s3.eu-central-1.amazonaws.com/camminiditalia/tracks/183.json`
- Crea: `cypress/fixtures/pois-1.json`, da
  `https://wmfe.s3.eu-central-1.amazonaws.com/camminiditalia/1/pois.geojson`, ridotto a pochi POI
- Crea: `cypress/fixtures/elastic-rotta.json`, risposta Elastic per `rotta dei due mari`
- Riusa: `cypress/fixtures/conf-1.json`

- [ ] **Step 1: catturare le fixture** secondo `wm-core/docs/howto/test-e2e-cypress.md`.
  Verificare che la fixture della track abbia i 39 `related_pois` con `taxonomy.poi_type` e che
  `conf-1.json` contenga in `MAP.filters.poi_types` le opzioni `poi_type_accomodation`,
  `poi_type_catering` e `poi_type_camping`.

### Task 2: Test `cypress/e2e/filters/filters-track-pois.cy.ts`

- [ ] **Step 1: scrivere i tre scenari**
  - `'apre la track dalla ricerca e il pannello mostra le tipologie dei suoi POI'`:
    `visitWithPrivacy('/?search=rotta%20dei%20due%20mari')`, click sulla track 183 nei risultati.
    L'URL non contiene `search`. Aperto "Filtri" → "Punti di interesse", ci sono chip per
    Alloggi, Ristoranti e Campeggi, e quella di Alloggi mostra `24`.
  - `'sceglie una tipologia, chiude con la X e ritrova ricerca e filtro'`: click sulla chip
    Alloggi, X della track. L'URL contiene di nuovo `search=rotta`, la lista dei risultati è
    visibile e la chip Alloggi è ancora selezionata.
  - `'apre direttamente il link del cliente'`:
    `visitWithPrivacy('/?track=183&search=rotta%20dei%20due%20mari')`. L'URL perde `search`, e il
    pannello mostra le tipologie dei POI della track.
- [ ] **Step 2: eseguire `npm run cy:run -- --spec cypress/e2e/filters/filters-track-pois.cy.ts`**
  con l'app avviata sul branch di `wm-core`, e verificare che passi.

### Task 3: Puntatore del submodule

> ⚠️ L'implementazione ha deviato da questo task: [notes.md](notes.md#task-3-puntatore-del-submodule)

- [ ] **Step 1: aggiornare `src/app/shared/wm-core`** al commit con la correzione, dopo il merge in
  `wm-core`.
- [ ] **Step 2: commit**, solo dopo l'approvazione del dev

  `fix(oc:8684): test E2E del pannello filtri con una track aperta`
