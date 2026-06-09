> Ticket: oc:7989

# Plan — Fix: configurazione Karma/test non funzionante in wm-webapp

## Repo coinvolto
Solo **wm-webapp** (nessuna modifica ai submodule).

## Branch
```
feature/oc-7989-fix-karma-test-config
```

---

## Step 1 — Crea branch

```bash
git checkout -b feature/oc-7989-fix-karma-test-config
```

---

## Step 2 — Fix `src/test.ts`: aggiorna import zone.js

**File:** `src/test.ts`

**Problema:** `zone.js` v0.15.x ha rimosso la cartella `dist/`. Il percorso `zone.js/dist/zone-testing` non esiste più.

**Fix:**
```diff
- import 'zone.js/dist/zone-testing';
+ import 'zone.js/testing';
```

**Commit:**
```
fix(oc:7989): update zone.js import path for v0.15.x compatibility
```

---

## Step 3 — Fix `tsconfig.spec.json`: esclude spec dei submodule

**File:** `tsconfig.spec.json`

**Problema:** Il tsconfig raccoglie tutti i `*.spec.ts` sotto `src/`, inclusi quelli dei submodule. I submodule usano `baseUrl` propri (es. `src/readonly`, `src/types/model`, `src/utils`) che non sono mappati nel tsconfig di wm-webapp.

**Fix:** aggiungere `exclude` per i submodule. Ogni submodule deve essere testato nel proprio repo con il proprio tsconfig.

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "./out-tsc/spec",
    "types": [
      "jasmine"
    ]
  },
  "files": [
    "src/test.ts",
    "src/polyfills.ts"
  ],
  "include": [
    "src/**/*.spec.ts",
    "src/**/*.d.ts"
  ],
  "exclude": [
    "src/app/shared/**"
  ]
}
```

**Convenzione:** tutti i submodule devono essere montati sotto `src/app/shared/` — documentato in `CLAUDE.md` al termine del workflow.

**Commit:**
```
fix(oc:7989): exclude submodule specs from wm-webapp tsconfig.spec.json
```

---

## Step 4 — Fix `karma.conf.js`: aggiunge supporto headless Chrome per CI

**File:** `karma.conf.js`

**Problema:** `browsers: ['Chrome']` non funziona in ambienti CI (nessun display). Serve un launcher headless con `--no-sandbox` per Ubuntu.

**Fix:** aggiungere `customLaunchers` e selezionare il browser in base alle env var `CI` o `CHROME_HEADLESS`.

```javascript
module.exports = function (config) {
  const isCI = process.env.CI || process.env.CHROME_HEADLESS;

  config.set({
    basePath: '',
    frameworks: ['jasmine', '@angular-devkit/build-angular'],
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-jasmine-html-reporter'),
      require('karma-coverage'),
      require('@angular-devkit/build-angular/plugins/karma')
    ],
    client: {
      jasmine: {},
      clearContext: false
    },
    jasmineHtmlReporter: {
      suppressAll: true
    },
    coverageReporter: {
      dir: require('path').join(__dirname, './coverage/ngv'),
      subdir: '.',
      reporters: [
        { type: 'html' },
        { type: 'text-summary' }
      ]
    },
    reporters: ['progress', 'kjhtml'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: !isCI,
    browsers: isCI ? ['ChromeHeadlessNoSandbox'] : ['Chrome'],
    customLaunchers: {
      ChromeHeadlessNoSandbox: {
        base: 'ChromeHeadless',
        flags: ['--no-sandbox', '--disable-gpu']
      }
    },
    singleRun: !!isCI,
    restartOnFileChange: !isCI
  });
};
```

**Commit:**
```
fix(oc:7989): add ChromeHeadlessNoSandbox launcher for CI environments
```

---

## Step 5 — Fix `src/app/app.component.spec.ts`: fornisce le dipendenze mancanti

**File:** `src/app/app.component.spec.ts`

**Problema:** `AppComponent` inietta `Store<any>` e `ModalController` ma la spec non li fornisce — Angular non trova i provider e il test fallisce.

**Fix:** aggiungere `provideMockStore()` da `@ngrx/store/testing` e un mock vuoto per `ModalController` (non viene chiamato nel costruttore, basta che DI non fallisca).

```typescript
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { TestBed, waitForAsync } from '@angular/core/testing';
import { provideMockStore } from '@ngrx/store/testing';
import { ModalController } from '@ionic/angular';

import { AppComponent } from './app.component';

describe('AppComponent', () => {

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [AppComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        provideMockStore(),
        { provide: ModalController, useValue: {} }
      ]
    }).compileComponents();
  }));

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  });

});
```

**Nota:** `provideMockStore()` intercetta automaticamente tutti i `store.dispatch()` e `store.select()` nel costruttore — non servono mock aggiuntivi per le azioni ngrx.

**Commit:**
```
fix(oc:7989): provide mock store and modal controller in app.component.spec
```

---

## Step 6 — Crea `.github/workflows/test.yml`

**File:** `.github/workflows/test.yml` (nuovo)

**Trigger:** push su `develop`, ogni PR aperta o aggiornata.
**Setup Chrome:** `browser-actions/setup-chrome@v1` per fissare la versione indipendentemente dall'immagine runner.
**Comando:** `ng test --configuration=ci` — usa la configurazione `ci` già presente in `angular.json` (`progress: false`, `watch: false`).

```yaml
name: Test

on:
  push:
    branches:
      - develop
  pull_request:

jobs:
  test:
    runs-on: ubuntu-latest
    name: Unit tests

    steps:
      - uses: actions/checkout@v4
        with:
          submodules: true

      - name: Update submodules
        run: git submodule update --init --recursive

      - uses: actions/setup-node@v4
        with:
          node-version: lts/*
          cache: npm

      - name: Install dependencies
        run: npm ci

      - name: Setup Chrome
        uses: browser-actions/setup-chrome@v1

      - name: Run tests
        run: npx ng test --configuration=ci
        env:
          CI: true
```

**Note:**
- `node-version: lts/*` usa sempre l'LTS corrente — separato e aggiornato rispetto al `deploy_prod.yml` (che usa Node 16 legacy)
- `npm ci` (non `npm install`) per installazioni riproducibili in CI
- `npx ng test` invece di `npm test` per usare direttamente la versione locale di Angular CLI

**Commit:**
```
feat(oc:7989): add GitHub Actions workflow for unit tests
```

---

## Verifica finale

Dopo aver applicato tutti i fix, eseguire localmente:

```bash
# Verifica con Chrome normale
ng test --watch=false

# Verifica con headless (simula CI)
CHROME_HEADLESS=1 ng test --configuration=ci
```

I test devono terminare con almeno 1 spec passante e 0 errori di compilazione.

---

## Ordine dei commit

1. `fix(oc:7989): update zone.js import path for v0.15.x compatibility`
2. `fix(oc:7989): exclude submodule specs from wm-webapp tsconfig.spec.json`
3. `fix(oc:7989): add ChromeHeadlessNoSandbox launcher for CI environments`
4. `fix(oc:7989): provide mock store and modal controller in app.component.spec`
5. `feat(oc:7989): add GitHub Actions workflow for unit tests`
