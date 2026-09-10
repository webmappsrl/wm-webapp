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
| Allineamento script surge-camminiditalia a --prod | oc:8382 | `package.json` | Era l'unico script deploy/surge del repo a non usare `--prod`; build `--prod` già verificata pulita in questo repo (fix principale in webmapp-app) |
| Gestione componenti custom con replace per camminiditalia (webapp) | oc:8512 | `angular.json`, `package.json`, `scripts/lib/run.js`, `scripts/serve.js`, `scripts/deploy.js`, `scripts/deploy-default.js`, `scripts/deploy-camminiditalia.js`, `.github/workflows/deploy_prod.yml` | Configurazione Angular `camminiditalia` (`fileReplacements` su `home-layer`/`search-bar`, submodule `wm-core`), deploy CI automatico con target selezionabile, `npm start` auto-detect shard |

## Decisioni architetturali

### Gestione componenti custom con replace per camminiditalia (oc:8512)
- **Configurazione Angular `camminiditalia` aggiunta sia sotto `architect.build.configurations` sia sotto `architect.serve.configurations`**: dimenticare la seconda fa fallire `ng serve --configuration=camminiditalia` con `Configuration 'camminiditalia' for target 'serve' ... is not set in the workspace` — bug trovato e corretto in questo stesso ciclo, mirror del pattern già usato per `production`.
- **`fileReplacements` limitato a `home-layer.component.ts` e `search-bar.component.ts`** (submodule condiviso `wm-core`, varianti `.camminiditalia.ts` già esistenti da oc:8391/oc:8414): nessun equivalente di `profile.page.camminiditalia.ts` (webmapp-app) perché wm-webapp non ha una pagina "profile" — verificato, non applicabile. Nessuna modifica al submodule `wm-core` richiesta.
- **Pattern di deploy a 3 script mirror 1:1 di `webmapp-app`**: `scripts/deploy-default.js` (generico, `scp`), `scripts/deploy-camminiditalia.js` (fileReplacements, `rsync` + creazione cartella remota via `ssh mkdir -p`), `scripts/deploy.js` (orchestratore che lancia entrambi in sequenza). `scripts/lib/run.js` è l'helper condiviso (`spawnSync` con propagazione exit code) — **stesso identico file** di `webmapp-app/core/scripts/lib/run.js`, nessuna astrazione condivisa tra i due repo (duplicazione consapevole, rischio di drift segnalato in Fase: challenge).
- **`scp`/`ssh` avvolti condizionalmente con `sshpass -e` solo se `process.env.SSHPASS` è impostata** (CI, autenticazione a password), altrimenti lanciati direttamente (locale, autenticazione a chiave già in `~/.ssh/config`). `rsync` non necessita di questo wrapping esplicito: legge nativamente `RSYNC_RSH` (impostata dal workflow CI), stesso approccio già in uso in `webmapp-app`.
- **Deploy CI reso automatico su push a `main`** (`npm run deploy`, entrambi i target) — decisione che **inverte** quella presa inizialmente in reverse-interaction ("non renderlo automatico"), cambiata esplicitamente dal developer durante la review-gate, prima dei commit. Target singolo selezionabile via input `workflow_dispatch.target` (manuale) o flag `--target (default|camminiditalia|all)` nel messaggio di commit — stesso pattern di estrazione già usato in `preview.yml` per `--id`/`--shard`.
- **`scripts/serve.js` (mirror 1:1 di `webmapp-app/core/scripts/serve.js`)**: legge `shardName` da `environment.ts` e lancia `ng serve --configuration=<shardName>` automaticamente se esiste una configuration `serve` con lo stesso nome (match esatto, poi prefisso per varianti `dev`). `"start"` in `package.json` ora punta a questo script — dato che `environment.ts` ha già `shardName: 'camminiditalia'`, `npm start` builda oggi automaticamente con i componenti custom senza flag manuali.
- **Nessuna copertura CI/E2E sulla configurazione `camminiditalia`**: un refactor futuro in `wm-core` (rinomina/spostamento dei file `.camminiditalia.ts`) può rompere silenziosamente questa configurazione senza che nessuna pipeline se ne accorga — rischio accettato esplicitamente dal developer in Fase: challenge, nessuna mitigazione CI in questo ciclo.
- **Redirect server-side di `1.camminiditalia.webmapp.it` verso `/var/www/html/camminiditalia.webmapp.it/` (cartella nuova, non esistente al momento di questo ticket) resta a carico del developer**, fuori scope — così come la verifica visiva reale della resa dei componenti camminiditalia e il tema CSS dedicato `src/theme/camminiditalia/` (cartella vuota).

### Allineamento script surge-camminiditalia a --prod (oc:8382)
- `wm-webapp` non aveva errori di build `--prod` (verificato: 0 errori, solo warning bundle-budget/Sass @import non bloccanti) — l'unico intervento necessario era coerenza tra script, non un fix di codice

### Fix Karma/test config (oc:7989)

- **`angular.json` come punto di controllo per la discovery dei spec**: Angular CLI ignora `tsconfig exclude` per la scansione dei file spec — usa il proprio scanner. Per controllare quali spec girare bisogna usare `include` in `angular.json` → `test.options.include`.
- **`initialState: { conf: {} }` nel MockStore di AppComponent**: `AppComponent` iscrive `confTHEMEVariables$` nel costruttore, che accede a `state.conf.THEME`. Mock store senza initial state restituisce `undefined` per `state.conf`, causando `TypeError` in afterAll. La soluzione è fornire un initial state minimale.
- **wm-core: pattern `TestBed.resetTestingModule()` difensivo**: Jasmine randomizza i test tra spec file. Qualsiasi test che attiva TestBed senza resettarlo contamina i test successivi. Il fix è `TestBed.resetTestingModule()` all'inizio di ogni `beforeEach` che chiama `configureTestingModule`, e in `afterEach`.
- **map-core CI: solo utils spec**: i directive/component spec richiedono un vero `OlMap` con canvas rendering GPU. In Chrome headless `--disable-gpu`, l'inizializzazione di `OlMap` causa il crash del browser. La configurazione `ci` usa `configurations.ci.include` per limitare il bundle ai soli 5 spec utils (27 test) che non dipendono dal rendering OL.
