> Ticket: oc:9042

# Deploy completo per camminiditalia — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** aggiungere `npm run deploy-camminiditalia-full`, che pubblica `www-camminiditalia/`
senza escludere nessuna cartella `assets`, lasciando invariato il deploy veloce.

**Architecture:** un solo script, `scripts/deploy-camminiditalia.js`, legge l'argomento `--full`
da `process.argv`: con `--full` rsync riceve solo `-av`, senza `-av --exclude assets` come oggi.
Il nuovo comando npm è lo stesso script con `--full`. Nessun file nuovo.

**Tech Stack:** Node (script CommonJS in `scripts/`), rsync, npm scripts.

**Spec:** [overview.md](overview.md). Il gemello in `webmapp-app` ha il suo plan nello stesso slug.

## Global Constraints

- `npm run deploy-camminiditalia`, `npm run deploy` (`scripts/deploy.js`) e
  `.github/workflows/deploy_prod.yml` non cambiano comportamento.
- Nessuna esecuzione contro il server durante il plan: niente `npm run deploy-*`, niente `ssh`/`rsync`
  verso `server:`.
- Commenti e documentazione in italiano, identificatori in inglese.
- Nessun controllo aggiuntivo nello script (albero pulito, branch, validazione argomenti): deciso
  dal dev in challenge.
- Commit: `fix(oc:9042): …`, solo dopo approvazione esplicita del dev.

## Review Focus

- Lanciato senza argomenti, lo script deve comporre esattamente `['-av', '--exclude', 'assets']`
  come oggi → coperto dal Task 1, Step 3.
- Con `--full` devono arrivare sia `assets/` sia `map-core/assets/` → coperto dal Task 1, Step 1
  (semantica rsync) e Step 3.
- Il ramo CI con `SSHPASS` (`sshpass -e ssh … mkdir -p`) resta intatto → lettura del diff,
  Task 1, Step 4.

---

### Task 1: argomento `--full` e comando npm

**Files:**
- Modify: `scripts/deploy-camminiditalia.js` (commento di testa e `RSYNC_ARGS`, oggi alla riga 32)
- Modify: `package.json:17` (riga nuova dopo `deploy-camminiditalia`)

**Interfaces:**
- Produces: comando `npm run deploy-camminiditalia-full` =
  `node scripts/deploy-camminiditalia.js --full`; costante `const FULL = process.argv.includes('--full')`.

- [ ] **Step 1: Provare in locale la semantica del pattern rsync**

```bash
T=$(mktemp -d) && mkdir -p $T/src/assets $T/src/map-core/assets $T/dst \
  && touch $T/src/assets/a.svg $T/src/map-core/assets/line-icon-arrow.png $T/src/index.html
rsync -av --dry-run --exclude assets $T/src/ $T/dst/   # atteso: solo index.html e map-core/
rsync -av --dry-run $T/src/ $T/dst/                     # atteso: anche assets/a.svg e map-core/assets/line-icon-arrow.png
```

È la prova della trappola: il primo comando non elenca `map-core/assets/line-icon-arrow.png`.

- [ ] **Step 2: Implementare `FULL` e `RSYNC_ARGS` in `scripts/deploy-camminiditalia.js`**

`RSYNC_ARGS = FULL ? ['-av'] : ['-av', '--exclude', 'assets']`, e una riga di log prima dell'rsync
che dice quale modalità è partita (`[deploy-camminiditalia] deploy completo, assets compresi` /
`deploy veloce, cartelle assets escluse`). Nel commento di testa, un paragrafo che dice:
`--exclude assets` senza `/` esclude **ogni** cartella `assets` a qualunque profondità, compresa
`map-core/assets/` (icone delle frecce delle track, oc:9042); il deploy veloce è quello di
`npm run deploy` e della CI; quando cambia un asset o si prepara un server nuovo si lancia
`npm run deploy-camminiditalia-full`, a mano.

Aggiungere in `package.json` dopo la riga 17:
`"deploy-camminiditalia-full": "node scripts/deploy-camminiditalia.js --full",`

- [ ] **Step 3: Verificare sintassi e argomenti composti, senza lanciare nulla**

```bash
node --check scripts/deploy-camminiditalia.js
node -e "console.log(require('./package.json').scripts['deploy-camminiditalia-full'])"
grep -n "RSYNC_ARGS\|FULL" scripts/deploy-camminiditalia.js
```

Atteso: nessun errore; `node scripts/deploy-camminiditalia.js --full`; `RSYNC_ARGS` con i due rami.

- [ ] **Step 4: Rileggere il diff**

`git diff scripts/deploy-camminiditalia.js package.json`: il ramo `SSHPASS`, il `mkdir -p` e
l'`ionic build` sono invariati; `scripts/deploy.js` non è toccato.

- [ ] **Step 5: Commit (solo dopo approvazione del dev)**

```bash
git add scripts/deploy-camminiditalia.js package.json
git commit -m "fix(oc:9042): deploy completo di camminiditalia con gli assets"
```

### Task 2: documentazione

**Files:**
- Modify: `CLAUDE.md:31` (tabella Comandi)
- Modify: `docs/knowledge/variante-camminiditalia.md` (paragrafo sul deploy, riga ~22) — il testo
  passa da `wm-context-guard` in `update-context`
- Eventuale trappola in `.claude/rules/`: si decide in `update-context`

- [ ] **Step 1: Riga nella tabella Comandi del `CLAUDE.md`**

Dopo la riga «Deploy di un target solo»:
`| Deploy completo di camminiditalia, assets compresi | npm run deploy-camminiditalia-full — a mano, quando cambia un asset o su un server nuovo |`

- [ ] **Step 2: Pagina di conoscenza**

In `## Come funziona oggi`: i due deploy di camminiditalia e quale usa la CI; in `## Perché così`:
la causa del bug (pattern rsync non ancorato, copiato da `webmapp-app` in oc:8512), la scelta del
dev di tenere veloce il deploy automatico, i due interventi manuali sul server del 25/11.

- [ ] **Step 3: Commit (solo dopo approvazione del dev)**

```bash
git add CLAUDE.md docs/knowledge/variante-camminiditalia.md docs/features/9042-webapp-desktop-punti-bianchi-non-cliccabili-sulle-track/
git commit -m "docs(oc:9042): deploy completo di camminiditalia e trappola del pattern rsync"
```
