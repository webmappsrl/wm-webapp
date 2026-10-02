> Ticket: oc:8684

# POI non visibili nella sezione "Filtri" dell'app

## Cosa cambia

Niente nel codice di questo repo. La correzione sta in `wm-core`, ed è descritta in
`src/app/shared/wm-core/docs/features/8684-poi-non-visibili-nella-sezione-filtri-dellapp/overview.md`.
Qui si aggiunge il test E2E che riproduce lo screenshot del cliente e verifica la correzione, e si
aggiorna il puntatore del submodule.

## Perché

Il bug si vede nella webapp camminiditalia (`?track=183&search=rotta dei due mari`), e i test
Cypress di `wm-core` vivono nei prodotti che lo montano, non nel submodule.

## Requisiti

- [ ] Test Cypress basato su fixture e `cy.intercept()`, senza API reali, con
      `privacy-accepted` impostato in `onBeforeLoad`.
- [ ] Scenario: si cerca «rotta dei due mari», si apre la track 183, il pannello "Filtri" →
      "Punti di interesse" mostra le tipologie dei POI della track e l'URL non contiene più
      `search`.
- [ ] Scenario: si sceglie una tipologia e si chiude la track con la X. Torna la ricerca, e la
      tipologia resta selezionata.
- [ ] Scenario: si apre direttamente l'URL dello screenshot del cliente
      (`?track=183&search=rotta dei due mari`). `search` sparisce dall'URL e il pannello mostra le
      tipologie dei POI della track.
- [ ] Fixture della track 183 con i suoi `related_pois`, catturata dalle API reali secondo la
      procedura di `wm-core/docs/howto/test-e2e-cypress.md`.
- [ ] Puntatore del submodule `wm-core` aggiornato al commit della correzione.

## Rischi

- **In CI gira un solo spec** (`cypress/e2e/home/home-layers-tab.cy.ts`). Il test nuovo protegge
  dalle regressioni solo se lo si registra in CI. La regola sta in `.claude/rules/cypress-e2e.md`.

## Out of scope

- Qualsiasi modifica al codice della webapp fuori da `cypress/`.

## Moduli toccati

- `cypress/e2e/…`: test nuovo sul pannello filtri con una track aperta
- `cypress/fixtures/…`: fixture della track 183 e della configurazione camminiditalia
- `src/app/shared/wm-core`: puntatore del submodule
