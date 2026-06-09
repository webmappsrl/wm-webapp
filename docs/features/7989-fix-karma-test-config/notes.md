> Ticket: oc:7989

# Notes — Fix: configurazione Karma/test non funzionante in wm-webapp

## Deviazioni dal piano

### tsconfig.spec.json: approccio cambiato da `exclude` a `include` esplicito + `angular.json`

Il piano prevedeva di aggiungere `"exclude": ["src/app/shared/**"]` in `tsconfig.spec.json`. In esecuzione si è scoperto che Angular CLI (`@angular-devkit/build-angular:karma`) scopre i file spec tramite **scansione filesystem propria**, indipendente dal tsconfig `include`/`exclude`. Il risultato era un errore `"missing from TypeScript compilation"` per ogni spec dei submodule: webpack li trovava (via scanner), ma `@ngtools/webpack` non li trovava nel programma TypeScript (perché esclusi dal tsconfig).

**Soluzione adottata (due livelli):**
1. `tsconfig.spec.json`: `include` esplicito (`src/app/app.component.spec.ts`, `src/app/classes/**/*.spec.ts`, `src/**/*.d.ts`) invece di glob + exclude
2. `angular.json` → `test.options.include`: lista esplicita di entry point per il karma builder (`src/app/app.component.spec.ts`, `src/app/classes`)

**Effetto collaterale:** i nuovi spec file wm-webapp (non in `shared/`) devono essere aggiunti esplicitamente sia in `tsconfig.spec.json` (nella sezione `include`) sia in `angular.json` (nella lista `include` del test architect). Documentato in `CLAUDE.md`.

### app.component.spec.ts: inizial state del MockStore

Il piano prevedeva solo `provideMockStore()`. In esecuzione, l'`AppComponent` iscriveva `confTHEMEVariables$` nel costruttore — il selector accedeva a `state.conf.THEME` ma `state.conf` era `undefined` (mock store vuoto). Questo causava `TypeError` in `afterAll` e disconnect di Karma dopo 30s.

**Fix:** `provideMockStore({initialState: {conf: {}}})` — `state.conf` è un oggetto vuoto, `state.conf.THEME` restituisce `undefined` senza lanciare, e il test termina correttamente.

### Scope espanso a wm-core e map-core

Il piano originale riguardava solo wm-webapp. Il lavoro è stato esteso ai due submodule:

**wm-core (112 test)**:
- Problema principale: Jasmine randomizza l'ordine dei test tra spec file. Qualsiasi test che attiva il TestBed senza resettarlo in `afterEach` contamina i test successivi con l'errore "Cannot configure the test module when the test module has already been instantiated".
- Fix: pattern difensivo `TestBed.resetTestingModule()` all'inizio di ogni `beforeEach` che chiama `configureTestingModule`.
- Fix aggiuntivi: `WmTransPipe.sub` statico (subscription cross-test), `HttpResponse` per mock HTTP con `observe: 'response'`, eliminazione spec obsoleti (`search-box.component.spec.ts`).
- Risultato: 112/112 SUCCESS.

**map-core (27 test CI)**:
- Problema `require.context`: webpack 4 API non disponibile in webpack 5 (Angular 20). Fix: sostituire `main: "src/test.ts"` con `polyfills: ["zone.js", "zone.js/testing"]` in `angular.json`.
- Problema `standalone: true`: Angular 17+ default. Fix: `standalone: false` in `TestComponent` di `base.directive.spec.ts`.
- **Limitazione fondamentale**: tutti i test directive/component richiedono un vero `OlMap` con canvas rendering. In Chrome headless senza GPU, la creazione di `OlMap` (tramite `WmMapComponent` nei `beforeEach`) causa il crash del browser. I test utils (27) non hanno questo problema.
- Soluzione: `configurations.ci.include` in `angular.json` limita il CI ai soli spec utils: `styles.spec.ts`, `popover.spec.ts`, `httpRequest.spec.ts`, `img.spec.ts`, `performance.spec.ts`.
- Fix test obsoleti: z-index `TRACK_DIRECTIVE_ZINDEX` cambiato da 50→500 (test aspettava 51/52, ora 501/502); `buildRefStyle` aveva firma cambiata (`Feature`→`LineString` + `opt.map` richiesto).
- Risultato: 27/27 SUCCESS in CI. I directive/component spec (85+) richiedono browser con GPU per girare.

### tsconfig.json: paths per @ionic/* (fix post-rebase)

Dopo il rebase su develop, `wm-core/node_modules/@ionic/core` era alla versione 8.8.9 mentre il root aveva 8.7.17. Il `package-lock.json` di wm-core è stale (mostra ancora 6.7.5 di ionic 6), ma `npm install` installa 8.8.9. La versione 8.8.9 ha cambiato la struttura interna di `@ionic/core/components` (i file `./animation.js`, `./index2.js` ecc. non esistono più in quel percorso).

Quando webpack compila `app.component.ts` → `@wm-core/inner-html/...` → file in `src/app/shared/wm-core/`, la Node module resolution trova `wm-core/node_modules/@ionic/angular` (8.8.9) prima del root. Quello importa `@ionic/core/components` che nella versione 8.8.9 ha struttura incompatibile → errore `Can't resolve './animation.js'`.

**Fix:** aggiungere paths in `tsconfig.json` per `@ionic/core` e `@ionic/angular` → root `node_modules`. `TsconfigPathsPlugin` (usato da Angular CLI nel webpack config) intercetta queste risoluzioni e reindirizza al root.

**Perché non si vedeva prima**: prima del nostro fix, `src/test.ts` aveva `require.context(...)` (API webpack 4) che crashava webpack immediatamente. Con il fix (rimosso `require.context`), webpack arriva al punto di risolvere `@ionic` ed espone questo conflitto latente.

## Bug trovati

- `zone.js/dist/zone-testing` rimosso in zone.js v0.15.x — preesistente, risolto come pianificato
- Angular CLI karma builder ignora tsconfig `exclude` per la discovery dei spec — comportamento non documentato chiaramente nelle Angular docs
- `WmTransPipe.sub` statico causa cross-test contamination in Jasmine con randomizzazione ordine
- `ec.service.ts` usa `observe: 'response'` ma i test spy restituivano il body grezzo invece di `HttpResponse`
- `buildRefStyle` signature cambiata senza aggiornare i test: passava `Feature` invece di `LineString`, e senza `opt.map`
- `TRACK_DIRECTIVE_ZINDEX` cambiato da 50 a 500 senza aggiornare i test

## Decisioni

- **`angular.json` come punto di controllo principale** per la lista dei spec: più affidabile di tsconfig per controllare cosa Angular CLI compila e scopre. Il tsconfig `include` esplicito serve come doppia protezione per la compilazione TypeScript.
- **`teardown: { destroyAfterEach: false }`** lasciato invariato in `src/test.ts` per non rompere eventuali test futuri che dipendono dallo stato globale tra test.
- **map-core: CI solo utils** — i directive/component spec richiedono OL Map con rendering GPU, incompatibile con Chrome headless. Scelta pragmatica: CI gira i 27 test utils, i developer testano localmente i directive spec con `ng test`.

## Follow-up

- Aggiungere nuovi spec file wm-webapp in `angular.json` → `test.options.include` E in `tsconfig.spec.json` → `include` ogni volta che vengono creati al di fuori di `src/app/classes/`
- Verificare che il workflow GitHub Actions funzioni correttamente su Ubuntu (richiede merge + push su develop per il trigger)
- Considerare in futuro di aggiungere un threshold di coverage minimo
- map-core: per eseguire i directive/component spec in CI serve un mock globale di `OlMap` — task separato
