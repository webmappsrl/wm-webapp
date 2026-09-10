> Ticket: oc:8512

# Gestione componenti custom con replace per camminiditalia (webapp) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Portare in wm-webapp il meccanismo di sostituzione a compile-time (`fileReplacements`) dei componenti custom camminiditalia (`home-layer`, `search-bar`), già attivo in `webmapp-app`, e predisporre lo script di build+invio al server dedicato — senza eseguire alcun invio reale né toccare CI/redirect.

**Architettura:** Nuova configurazione Angular `camminiditalia` in `angular.json` che sostituisce due file del submodule condiviso `wm-core` con le loro varianti `.camminiditalia.ts` già esistenti. Nuovo script Node (`scripts/deploy-to-web-camminiditalia.js` + `scripts/lib/run.js`), mirror 1:1 del pattern già in produzione su `webmapp-app/core/scripts/`, esposto come script npm manuale (mai eseguito in CI). Lo script `surge-camminiditalia` esistente viene allineato per buildare con la stessa configurazione.

**Tech Stack:** Angular 20, Ionic CLI 7, Node.js (script di deploy, `child_process.spawnSync`), npm scripts.

**Spec:** `docs/features/8512-gestione-componenti-custom-replace-camminiditalia/overview.md`

## Global Constraints

- Nessuna modifica al submodule `wm-core` — le varianti `.camminiditalia.ts` di `home-layer.component` e `search-bar.component` esistono già.
- Nessun job CI aggiuntivo, né di build né di deploy — lo script resta manuale.
- **Nessuna esecuzione reale di `scp`/`rsync` contro il server di produzione durante questo piano** — la cartella remota `/var/www/html/camminiditalia.webmapp.it/` non esiste ancora e il primo invio reale lo esegue il developer manualmente, a valle del merge.
- Nessuna esecuzione reale del comando `surge` (pubblica su un dominio pubblico condiviso) durante questo piano.
- Path di output locale (`www-camminiditalia`) e destinazione remota (`server:/var/www/html/camminiditalia.webmapp.it/`) devono restare hardcoded ed espliciti nello script — mai la cartella condivisa generica (`www/`, `app.geohub.webmapp.it/`).
- Nessuna modifica al redirect server-side, al tema CSS `src/theme/camminiditalia/`, né a un ambiente dev/staging camminiditalia — tutti esplicitamente out of scope.
- Nessun commit va eseguito autonomamente: ogni step "Commit" di questo piano è un'istruzione testuale per lo sviluppatore.

---

## File Structure

- `angular.json` (modifica) — nuova configurazione `camminiditalia` sotto `projects.app.architect.build.configurations`, accanto a `production`/`ci` esistenti.
- `scripts/lib/run.js` (nuovo) — helper `run(command, args)` che esegue un comando ereditando stdio e propaga l'exit code in caso di fallimento. Mirror esatto di `webmapp-app/core/scripts/lib/run.js`.
- `scripts/deploy-to-web-camminiditalia.js` (nuovo) — builda con `ionic build --configuration=production,camminiditalia -- --output-path=www-camminiditalia`, crea la cartella remota se assente, poi `rsync` verso `server:/var/www/html/camminiditalia.webmapp.it/`.
- `package.json` (modifica) — nuovo script `"deploy-camminiditalia": "node scripts/deploy-to-web-camminiditalia.js"`; script `surge-camminiditalia` esistente allineato per usare la configurazione `camminiditalia`.

---

### Task 1: Configurazione Angular `camminiditalia` con `fileReplacements`

**Files:**
- Modify: `angular.json` (sezione `projects.app.architect.build.configurations`)

**Interfaces:**
- Consumes: nessuna (task indipendente)
- Produces: configurazione Angular `camminiditalia`, invocabile con `--configuration=camminiditalia` (da sola) o `--configuration=production,camminiditalia` (combinata). Usata da Task 3 (script deploy) e Task 4 (script surge).

- [ ] **Step 1: Leggere la configurazione attuale**

Apri `angular.json` e individua `projects.app.architect.build.configurations`. Oggi contiene solo `production` (con `fileReplacements` verso `environment.prod.ts`) e `ci` (`{"progress": false}`).

- [ ] **Step 2: Aggiungere la configurazione `camminiditalia`**

Nel file `angular.json`, dentro `projects.app.architect.build.configurations`, aggiungi una nuova chiave `camminiditalia` allo stesso livello di `production` e `ci`:

```json
"camminiditalia": {
  "fileReplacements": [
    {
      "replace": "src/app/shared/wm-core/projects/wm-core/src/home/home-layer/home-layer.component.ts",
      "with": "src/app/shared/wm-core/projects/wm-core/src/home/home-layer/home-layer.component.camminiditalia.ts"
    },
    {
      "replace": "src/app/shared/wm-core/projects/wm-core/src/search-bar/search-bar.component.ts",
      "with": "src/app/shared/wm-core/projects/wm-core/src/search-bar/search-bar.component.camminiditalia.ts"
    }
  ]
}
```

Non toccare le configurazioni `production` e `ci` esistenti: la nuova chiave va aggiunta come voce sorella, non in sostituzione.

- [ ] **Step 3: Verificare che i file replacement esistano davvero**

Run: `ls src/app/shared/wm-core/projects/wm-core/src/home/home-layer/home-layer.component.camminiditalia.ts src/app/shared/wm-core/projects/wm-core/src/search-bar/search-bar.component.camminiditalia.ts`

Expected: entrambi i path vengono stampati senza errore "No such file or directory" (sono già presenti nel submodule, nessuna modifica a `wm-core` richiesta da questo task).

- [ ] **Step 4: Validare il JSON e buildare con la nuova configurazione**

Run: `npx ng build --configuration=production,camminiditalia`

Expected: la build termina con exit code 0, senza errori TypeScript relativi a `home-layer.component.camminiditalia.ts` o `search-bar.component.camminiditalia.ts`, e crea una cartella `www/` (o l'output path di default) con i bundle compilati. Se la build fallisce con un errore di risoluzione file, verifica che i due path in `fileReplacements` corrispondano esattamente a quelli dello Step 3 (path relativi alla root del progetto, non a `src/`).

Questo soddisfa il requisito "Build reale verificata in locale" dell'overview (parziale: la verifica completa con l'output path dedicato avviene nel Task 3).

- [ ] **Step 5: Commit**

```bash
git add angular.json
git commit -m "feat(oc:8512): add camminiditalia build configuration with fileReplacements"
```

---

### Task 2: Helper `scripts/lib/run.js`

**Files:**
- Create: `scripts/lib/run.js`

**Interfaces:**
- Consumes: nessuna
- Produces: `run(command: string, args: string[]): void` — esporta `{run}`. Usato da Task 3 (`scripts/deploy-to-web-camminiditalia.js`).

- [ ] **Step 1: Creare la cartella e il file**

Crea il file `scripts/lib/run.js` con questo contenuto esatto (mirror di `webmapp-app/core/scripts/lib/run.js`):

```javascript
const {spawnSync} = require('child_process');

/**
 * Esegue un comando ereditando stdio, esce con lo stesso exit code in caso
 * di fallimento — stesso comportamento di `&&` in shell, ma con un
 * messaggio esplicito su quale comando è fallito.
 */
function run(command, args) {
  console.log(`\n$ ${command} ${args.join(' ')}`);
  const result = spawnSync(command, args, {stdio: 'inherit', shell: true});
  if (result.status !== 0) {
    console.error(`Comando fallito (exit ${result.status}): ${command} ${args.join(' ')}`);
    process.exit(result.status ?? 1);
  }
}

module.exports = {run};
```

- [ ] **Step 2: Verificare la sintassi**

Run: `node --check scripts/lib/run.js`

Expected: nessun output, exit code 0 (il flag `--check` valida solo la sintassi, non esegue il file — nessun comando reale viene lanciato).

- [ ] **Step 3: Verificare il comportamento con un comando innocuo**

Run: `node -e "require('./scripts/lib/run').run('echo', ['test-run-helper'])"`

Expected: viene stampato `$ echo test-run-helper` seguito da `test-run-helper`, poi lo script termina senza errori (exit code 0). Questo verifica che l'helper esegua correttamente un comando e ne erediti lo stdout, senza toccare rete o server.

- [ ] **Step 4: Verificare la propagazione dell'exit code in caso di fallimento**

Run: `node -e "require('./scripts/lib/run').run('sh', ['-c', 'exit 3'])"; echo "exit code: $?"`

Expected: viene stampato `Comando fallito (exit 3): sh -c exit 3` su stderr, e `exit code: 3` — conferma che `run()` propaga correttamente l'exit code del comando fallito invece di continuare silenziosamente.

- [ ] **Step 5: Commit**

```bash
git add scripts/lib/run.js
git commit -m "feat(oc:8512): add run() helper for deploy scripts"
```

---

### Task 3: Script `scripts/deploy-to-web-camminiditalia.js`

**Files:**
- Create: `scripts/deploy-to-web-camminiditalia.js`

**Interfaces:**
- Consumes: `run(command, args)` da `./lib/run` (Task 2)
- Produces: script eseguibile via `node scripts/deploy-to-web-camminiditalia.js`. Usato da Task 4 (script npm `deploy-camminiditalia`).

- [ ] **Step 1: Creare lo script**

Crea il file `scripts/deploy-to-web-camminiditalia.js` con questo contenuto:

```javascript
#!/usr/bin/env node
/**
 * Deploy web dedicato a camminiditalia: camminiditalia.webmapp.it/
 * riceve un bundle separato dal deploy condiviso (app.geohub.webmapp.it/),
 * necessario perché fileReplacements/--configuration di Angular agiscono
 * a compile-time — un bundle con home-layer.component.camminiditalia.ts e
 * search-bar.component.camminiditalia.ts "baked in" non può essere servito
 * dal deploy condiviso, altrimenti lo vedrebbero anche gli altri clienti
 * (vedi angular.json, configuration "camminiditalia").
 *
 * --output-path=www-camminiditalia: cartella separata da www/ per non
 * sovrascrivere l'output della build generica quando i due script girano
 * in sequenza.
 *
 * La cartella remota non esiste ancora sul server al momento in cui questo
 * script è stato scritto (oc:8512) — il comando `ssh ... mkdir -p` la crea
 * se assente, senza fallire se è già presente.
 */
const {run} = require('./lib/run');

const REMOTE_HOST = 'server';
const REMOTE_PATH = '/var/www/html/camminiditalia.webmapp.it/';
const RSYNC_ARGS = ['-av', '--exclude', 'assets'];

run('ionic', [
  'build',
  '--configuration=production,camminiditalia',
  '--',
  '--output-path=www-camminiditalia',
]);
run('ssh', [REMOTE_HOST, `mkdir -p ${REMOTE_PATH}`]);
run('rsync', [...RSYNC_ARGS, './www-camminiditalia/*', `${REMOTE_HOST}:${REMOTE_PATH}`]);
```

- [ ] **Step 2: Verificare la sintassi**

Run: `node --check scripts/deploy-to-web-camminiditalia.js`

Expected: nessun output, exit code 0. Questo valida solo la sintassi JavaScript — non esegue lo script, quindi non builda né contatta alcun server.

- [ ] **Step 3: Verificare che il modulo si carichi senza errori di require**

Run: `node -e "require('./scripts/deploy-to-web-camminiditalia.js')"`

Expected: **questo comando esegue realmente lo script** (build + tentativo di connessione SSH). **Non eseguire questo step in questo ciclo** — è escluso esplicitamente dai Global Constraints (nessun invio reale al server, nessuna build eseguita fuori da Task 1/Step 4). Salta questo step e passa direttamente al successivo.

- [ ] **Step 4: Verifica statica del contenuto (senza esecuzione)**

Apri il file appena creato e conferma a occhio, confrontando con `angular.json` (Task 1) e con il contenuto sopra:
- `REMOTE_PATH` è `/var/www/html/camminiditalia.webmapp.it/` (non `app.geohub.webmapp.it/`, non `mobile.camminiditalia.webmapp.it/`)
- `--output-path=www-camminiditalia` (non `www`)
- La build usa `--configuration=production,camminiditalia` (stessa stringa validata in Task 1, Step 4)

- [ ] **Step 5: Commit**

```bash
git add scripts/deploy-to-web-camminiditalia.js
git commit -m "feat(oc:8512): add dedicated deploy script for camminiditalia build"
```

---

### Task 4: Script npm `deploy-camminiditalia` e allineamento `surge-camminiditalia`

**Files:**
- Modify: `package.json:13-19` (sezione `scripts`)

**Interfaces:**
- Consumes: `scripts/deploy-to-web-camminiditalia.js` (Task 3)
- Produces: script npm `deploy-camminiditalia` (invocabile manualmente dal developer, mai da CI); script `surge-camminiditalia` allineato alla configurazione `camminiditalia`.

- [ ] **Step 1: Aggiungere lo script `deploy-camminiditalia`**

In `package.json`, dentro `"scripts"`, aggiungi una nuova voce subito dopo `"deploy-cai"` (riga 14 attuale):

```json
"deploy-camminiditalia": "node scripts/deploy-to-web-camminiditalia.js",
```

- [ ] **Step 2: Allineare `surge-camminiditalia` alla configurazione `camminiditalia`**

Sostituisci la riga esistente:

```json
"surge-camminiditalia": "ionic build --prod && surge --project ./www --domain http://1.camminiditalia.surge.sh/",
```

con:

```json
"surge-camminiditalia": "ionic build --configuration=production,camminiditalia && surge --project ./www --domain http://1.camminiditalia.surge.sh/",
```

Nota: `--prod` è sostituito da `--configuration=production,camminiditalia` perché il flag breve `--prod` non permette di combinare più configurazioni — stessa sintassi già validata in Task 1/Step 4 e usata nello script di Task 3.

- [ ] **Step 3: Validare il JSON**

Run: `node -e "JSON.parse(require('fs').readFileSync('package.json', 'utf8')); console.log('package.json valido')"`

Expected: stampa `package.json valido`, nessun errore di parsing (conferma che le virgole/graffe aggiunte non hanno rotto la sintassi JSON).

- [ ] **Step 4: Verificare che npm veda il nuovo script**

Run: `npm run | grep -A1 "deploy-camminiditalia\|surge-camminiditalia"`

Expected: `npm run` (senza argomenti) elenca gli script disponibili; l'output include sia `deploy-camminiditalia` sia `surge-camminiditalia` con i comandi aggiornati. **Non eseguire** `npm run deploy-camminiditalia` né `npm run surge-camminiditalia` in questo step — lancerebbero rispettivamente un invio reale al server e una pubblicazione reale su surge.sh, entrambi esclusi dai Global Constraints.

- [ ] **Step 5: Commit**

```bash
git add package.json
git commit -m "feat(oc:8512): add deploy-camminiditalia npm script and align surge-camminiditalia to fileReplacements config"
```

---

## Note finali per lo sviluppatore

- Al termine di questi 4 task, la build `production,camminiditalia` è verificata localmente (Task 1/Step 4) ma **nessun invio reale è mai stato effettuato** né verso il server (`deploy-camminiditalia`) né verso surge.sh (`surge-camminiditalia` aggiornato). Il primo run reale di entrambi resta a tuo carico, come deciso in Fase: reverse-interaction.
- La cartella remota `/var/www/html/camminiditalia.webmapp.it/` viene creata dallo script stesso (`ssh server mkdir -p ...`) al primo run — non serve crearla a mano prima, ma verifica di avere i permessi di scrittura in `/var/www/html/` sull'host `server` prima del primo lancio.
- La verifica visiva del rendering (home-layer, pannello filtri search-bar) sul browser resta a tuo carico, come deciso in Fase: challenge — non è coperta da nessun task di questo piano.
