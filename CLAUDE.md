# CLAUDE.md — wm-webapp

## Stack

- **Framework:** Angular 20 + Ionic 8 (app ibrida web/mobile)
- **Store:** NgRx (@ngrx/store, @ngrx/effects)
- **Test:** Karma + Jasmine (`ng test`)
- **Submodule:**
  - `src/app/shared/map-core` — componenti e utils OpenLayers
  - `src/app/shared/wm-core` — store, servizi, localization condivisi
  - `src/app/shared/wm-types` — tipi TypeScript condivisi

## Architettura submoduli

Ordine di dipendenza: `wm-types` → `wm-core` → `wm-webapp`

- `wm-types`: interfacce TypeScript condivise (niente logica)
- `wm-core`: componenti Angular, store NgRx, effetti, selettori
- `wm-webapp`: app shell, environment, routing

## Convenzioni di test

### Aggiungere nuovi spec file

Ogni nuovo file `*.spec.ts` creato in wm-webapp (NON dentro `src/app/shared/`) deve essere registrato in **due posti**:

1. **`tsconfig.spec.json`** — sezione `include`:
   ```json
   "include": [
     "src/app/app.component.spec.ts",
     "src/app/classes/**/*.spec.ts",
     "src/app/<nuova-directory>/**/*.spec.ts",  ← aggiungere qui
     "src/**/*.d.ts"
   ]
   ```

2. **`angular.json`** — `projects.app.architect.test.options.include`:
   ```json
   "include": [
     "src/app/app.component.spec.ts",
     "src/app/classes",
     "src/app/<nuova-directory>"  ← aggiungere qui
   ]
   ```

**Perché due posti:** Angular CLI scopre i spec tramite scanner filesystem proprio (usa `angular.json`), indipendentemente da `tsconfig.spec.json`. Se un file è scoperto da Angular CLI ma non è nel programma TypeScript, si ottiene "missing from TypeScript compilation". Entrambe le configurazioni devono essere allineate.

### Submodule e test

I spec dei submodule (`src/app/shared/**`) **non vengono eseguiti** da wm-webapp — ogni submodule ha il proprio setup di test nel proprio repo. La convenzione `src/app/shared/` è il confine: tutti i submodule montati fuori da questo path sfuggirebbero all'esclusione.

### Eseguire i test

```bash
# Locale (browser visuale)
ng test

# Headless (simula CI)
CHROME_HEADLESS=1 ng test --configuration=ci
```

## CI

I test girano automaticamente su GitHub Actions (`.github/workflows/test.yml`):
- **Trigger:** push su `develop`, ogni PR
- **Browser:** Chrome headless (via `browser-actions/setup-chrome@v1`)
- **Jobs:**
  - `test-webapp`: `ng test --configuration=ci` (wm-webapp, 2 spec)
  - `test-wm-core`: `ng test wm-core --configuration=ci` in `src/app/shared/wm-core` (112 spec)
  - `test-map-core`: `ng test map-core --configuration=ci` in `src/app/shared/map-core` (27 spec utils)

### Test submodule in locale

```bash
# wm-core (da src/app/shared/wm-core/)
nvm use 22 && CI=true npx ng test wm-core --configuration=ci

# map-core — utils (da src/app/shared/map-core/)
nvm use 22 && CI=true npx ng test map-core --configuration=ci

# map-core — TUTTI i test inclusi directive/component (richiede browser con GPU)
nvm use 22 && npx ng test map-core
```

## Test E2E con Cypress

Il pattern completo (intercept, fixture, `visitWithPrivacy`, motivazioni) è documentato in `src/app/shared/wm-core/CLAUDE.md`.

## Feature disponibili

| Feature | Ticket | Moduli toccati | Note |
|---|---|---|---|
| Fix Karma/test config | oc:7989 | `src/test.ts`, `tsconfig.spec.json`, `karma.conf.js`, `angular.json`, `app.component.spec.ts`, `.github/workflows/test.yml`, submodule wm-core e map-core | wm-webapp: 2 spec; wm-core: 112 spec; map-core CI: 27 spec utils |

## Decisioni architetturali

### Fix Karma/test config (oc:7989)

- **`angular.json` come punto di controllo per la discovery dei spec**: Angular CLI ignora `tsconfig exclude` per la scansione dei file spec — usa il proprio scanner. Per controllare quali spec girare bisogna usare `include` in `angular.json` → `test.options.include`.
- **`initialState: { conf: {} }` nel MockStore di AppComponent**: `AppComponent` iscrive `confTHEMEVariables$` nel costruttore, che accede a `state.conf.THEME`. Mock store senza initial state restituisce `undefined` per `state.conf`, causando `TypeError` in afterAll. La soluzione è fornire un initial state minimale.
- **wm-core: pattern `TestBed.resetTestingModule()` difensivo**: Jasmine randomizza i test tra spec file. Qualsiasi test che attiva TestBed senza resettarlo contamina i test successivi. Il fix è `TestBed.resetTestingModule()` all'inizio di ogni `beforeEach` che chiama `configureTestingModule`, e in `afterEach`.
- **map-core CI: solo utils spec**: i directive/component spec richiedono un vero `OlMap` con canvas rendering GPU. In Chrome headless `--disable-gpu`, l'inizializzazione di `OlMap` causa il crash del browser. La configurazione `ci` usa `configurations.ci.include` per limitare il bundle ai soli 5 spec utils (27 test) che non dipendono dal rendering OL.
