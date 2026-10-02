> Ticket: oc:8684

# Notes — POI non visibili nella sezione "Filtri" dell'app

## Divergenze dal piano, task per task

### Task 1 fixture

- `conf-1.json` non ha `MAP.filters`, quindi non si poteva riusare. La fixture nuova
  `cypress/fixtures/conf-1-filters.json` è `conf-1.json` più i `MAP.filters` reali, con in più
  `poi_type_accomodation` e `poi_type_camping` presi da `MAP.pois.taxonomies`: nella configurazione
  reale di camminiditalia mancano (vedi le note di `wm-core`). Il test verifica quindi il frontend
  su una configurazione corretta, non quella di produzione di oggi.
- Le etichette reali sono "Struttura ricettiva" e "Area tende", non Alloggi e Campeggi; le chip non
  espongono l'identifier nel DOM, quindi le asserzioni usano il testo.

### Task 3 puntatore del submodule

- Non ancora fatto: si aggiorna dopo il merge in `wm-core`.

## Bug trovati

- Lo scenario 2 del test (scegliere una tipologia e chiudere con la X) falliva: il click sulla chip
  non la selezionava, anche senza track aperta. La causa era la fixture: `poiFilters`
  (`ec.selector.ts:68-88`) tiene solo gli identifier presenti in `MAP.pois.taxonomies.poi_type`, e
  quella di `conf-1.json` (52 voci) non conteneva accomodation, catering, camping, railway e altre.
  La fixture usa ora la tassonomia della configurazione reale (85 voci); l'app non era coinvolta.
- La sezione `poi_type` dei filtri non arriva al pannello: `confFILTERS` la elimina
  (`conf.selector.ts:60-62`), quindi resta una sola sezione "Punti di interesse", `poi_types`. Il
  test seleziona l'accordion per `value === 'poi_types'`, non per posizione.

## Decisioni

- `baseUrl` di `cypress.config.ts` è 8100, mentre `npm start` serve su 4200: il run locale è stato
  fatto con `--config baseUrl=…`.

## Follow-up

- Nessuno oltre al puntatore del submodule.
