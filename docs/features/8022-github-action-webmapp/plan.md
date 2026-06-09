> Ticket: oc:8022

# Plan — GitHub Actions wm-webapp CI/CD

## Prerequisiti manuali (prima di qualsiasi test della pipeline)

Aggiungere i seguenti secret nel repo GitHub (Settings → Secrets → Actions):

| Secret | Descrizione |
|---|---|
| `SURGE_EMAIL` | Email account Surge (ottieni con `surge whoami`) |
| `SURGE_TOKEN` | Token Surge (ottieni con `surge token`) |
| `CYPRESS_EMAIL` | Email per login nei test E2E con `e2eLogin()` |
| `CYPRESS_PASSWORD` | Password per login nei test E2E con `e2eLogin()` |

---

## Step 1 — Crea branch

```bash
git checkout -b feature/oc-8022-github-action-webmapp
```

---

## Step 2 — Aggiorna `.github/workflows/test.yml`

**Obiettivo:** aggiungere trigger `workflow_call` (rende il workflow riusabile da `deploy_prod.yml`) e job `e2e` con Cypress.

### 2a — Aggiungi `workflow_call` al blocco `on:`

```yaml
on:
  push:
    branches:
      - develop
  pull_request:
  workflow_call:          # ← nuovo: rende test.yml chiamabile come reusable workflow
```

### 2b — Aggiungi job `e2e` in coda ai job esistenti

```yaml
  e2e:
    runs-on: ubuntu-latest
    name: E2E tests (Cypress)

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

      - name: Install Ionic CLI
        run: npm install -g @ionic/cli@7.2.1

      - name: Setup Chrome
        uses: browser-actions/setup-chrome@v1

      - name: Run Cypress E2E
        uses: cypress-io/github-action@v6
        with:
          browser: chrome
          headed: false
          start: ionic serve
          wait-on: 'http://localhost:8100'
          wait-on-timeout: 280
          config: >
            defaultCommandTimeout=5000,
            pageLoadTimeout=10000,
            viewportWidth=412,
            viewportHeight=832,
            testIsolation=false,
            excludeSpecPattern=cypress/e2e/32/**
        env:
          CI: true
          CYPRESS_email: ${{ secrets.CYPRESS_EMAIL }}
          CYPRESS_password: ${{ secrets.CYPRESS_PASSWORD }}

      - name: Upload screenshots
        if: failure()
        uses: actions/upload-artifact@v4
        with:
          name: cypress-screenshots
          path: cypress/screenshots

      - name: Upload videos
        if: failure()
        uses: actions/upload-artifact@v4
        with:
          name: cypress-videos
          path: cypress/videos
```

**Commit:** `feat(oc:8022): add E2E Cypress job to test workflow`

---

## Step 3 — Crea `.github/workflows/preview.yml`

**Obiettivo:** deploy Surge preview su ogni PR e push su `develop`, teardown automatico alla chiusura della PR.

**Struttura del dominio:**
- PR: `<appId>.<shardName>.pr-<prNumber>.surge.sh`
- develop: `<appId>.<shardName>.develop.surge.sh`
- Default: `appId=1`, `shardName=maphub`
- Override via commit message: `--id <appId>` e/o `--shard <shardName>`

**Nota sicurezza `pull_request_target`:** questo trigger esegue il workflow nel contesto del branch base con accesso ai secret, ma fa il checkout dell'HEAD della PR (che può contenere codice di fork). Il rischio è accettabile per team interni; per repo pubblici con contributor esterni, aggiungere environment protection o approvazione manuale.

```yaml
name: Surge Preview

on:
  pull_request_target:
    types: [opened, synchronize, reopened, closed]
  push:
    branches:
      - develop

jobs:
  preview:
    if: >
      github.event_name == 'push' ||
      (github.event_name == 'pull_request_target' && github.event.action != 'closed')
    runs-on: ubuntu-latest
    name: Deploy Surge preview

    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          submodules: true
          ref: ${{ github.event.pull_request.head.sha || github.sha }}

      - name: Update submodules
        run: git submodule update --init --recursive

      - name: Extract --id and --shard from commit message
        id: params
        run: |
          if [ "${{ github.event_name }}" == "pull_request_target" ]; then
            COMMIT_MSG=$(git show -s --format=%B ${{ github.event.pull_request.head.sha }})
          else
            COMMIT_MSG=$(git show -s --format=%B ${{ github.sha }})
          fi

          ID=$(echo "$COMMIT_MSG" | grep -oP '(?<=--id )\d+' | head -1)
          SHARD=$(echo "$COMMIT_MSG" | grep -oP '(?<=--shard )[a-zA-Z0-9-]+' | head -1)

          ID=${ID:-1}
          SHARD=${SHARD:-maphub}

          if [ "${{ github.event_name }}" == "pull_request_target" ]; then
            PR_NUM="${{ github.event.pull_request.number }}"
            DOMAIN="${ID}.${SHARD}.pr-${PR_NUM}.surge.sh"
          else
            DOMAIN="${ID}.${SHARD}.develop.surge.sh"
          fi

          echo "SURGE_DOMAIN=$DOMAIN" >> $GITHUB_ENV

      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm

      - name: Install dependencies
        run: npm ci

      - name: Install Ionic CLI
        run: npm install -g @ionic/cli@7.2.1

      - name: Build
        run: ionic build

      - name: Deploy to Surge
        uses: dswistowski/surge-sh-action@v1
        with:
          domain: ${{ env.SURGE_DOMAIN }}
          project: ./www
          login: ${{ secrets.SURGE_EMAIL }}
          token: ${{ secrets.SURGE_TOKEN }}

      - name: Add preview link to summary
        run: |
          echo "## Surge Preview" >> $GITHUB_STEP_SUMMARY
          echo "" >> $GITHUB_STEP_SUMMARY
          echo "[${{ env.SURGE_DOMAIN }}](http://${{ env.SURGE_DOMAIN }})" >> $GITHUB_STEP_SUMMARY

  teardown:
    if: github.event_name == 'pull_request_target' && github.event.action == 'closed'
    runs-on: ubuntu-latest
    name: Teardown Surge preview

    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          ref: ${{ github.event.pull_request.head.sha }}

      - name: Compute domain to teardown
        run: |
          COMMIT_MSG=$(git show -s --format=%B ${{ github.event.pull_request.head.sha }})
          ID=$(echo "$COMMIT_MSG" | grep -oP '(?<=--id )\d+' | head -1)
          SHARD=$(echo "$COMMIT_MSG" | grep -oP '(?<=--shard )[a-zA-Z0-9-]+' | head -1)
          ID=${ID:-1}
          SHARD=${SHARD:-maphub}
          echo "SURGE_DOMAIN=${ID}.${SHARD}.pr-${{ github.event.pull_request.number }}.surge.sh" >> $GITHUB_ENV

      - uses: actions/setup-node@v4
        with:
          node-version: 22

      - name: Install Surge CLI
        run: npm install -g surge

      - name: Teardown
        run: npx surge teardown ${{ env.SURGE_DOMAIN }}
        env:
          SURGE_LOGIN: ${{ secrets.SURGE_EMAIL }}
          SURGE_TOKEN: ${{ secrets.SURGE_TOKEN }}
```

**Commit:** `feat(oc:8022): add Surge preview workflow with teardown on PR close`

---

## Step 4 — Aggiorna `.github/workflows/deploy_prod.yml`

**Obiettivo:** gate test obbligatorio prima del deploy, Node 22, `workflow_dispatch` per hotfix, pin action a SHA.

Sostituire l'intero file con:

```yaml
name: Deploy

on:
  push:
    branches:
      - main
  workflow_dispatch:        # permette deploy manuale da GitHub UI in caso di gate rotto

permissions:
  contents: write
  pull-requests: write

jobs:
  # Richiama test.yml come reusable workflow — tutti i job (unit + e2e) devono passare
  run-tests:
    uses: ./.github/workflows/test.yml
    secrets: inherit

  build:
    needs: run-tests
    runs-on: ubuntu-latest
    name: Build and Deploy

    steps:
      - uses: actions/checkout@v4
        with:
          submodules: true

      - name: Update submodules
        run: git submodule update --init --recursive

      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm

      - name: Install Ionic CLI
        run: npm install -g @ionic/cli@7.2.1

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: ionic build --prod

      - name: Publish
        uses: nogsantos/scp-deploy@48b9ca0b1adcb229b1568eebda8e16e06436495a
        with:
          src: ./www/*
          host: ${{ secrets.SSH_HOST }}
          remote: ${{ secrets.SSH_DIR }}
          port: ${{ secrets.SSH_PORT }}
          user: ${{ secrets.SSH_USER }}
          key: ${{ secrets.SSH_KEY }}
```

**Commit:** `feat(oc:8022): gate deploy behind tests, Node 22, workflow_dispatch, pin scp-deploy SHA`

---

## Step 5 — Verifica locale YAML

Prima di aprire la PR, validare la sintassi dei workflow:

```bash
# Richiede actionlint (brew install actionlint)
actionlint .github/workflows/test.yml
actionlint .github/workflows/preview.yml
actionlint .github/workflows/deploy_prod.yml
```

In alternativa (senza actionlint):

```bash
# Verifica sintassi YAML base
python3 -c "import yaml; yaml.safe_load(open('.github/workflows/test.yml'))"
python3 -c "import yaml; yaml.safe_load(open('.github/workflows/preview.yml'))"
python3 -c "import yaml; yaml.safe_load(open('.github/workflows/deploy_prod.yml'))"
```

---

## Riepilogo file toccati

| File | Operazione |
|---|---|
| `.github/workflows/test.yml` | Modifica: aggiunto `workflow_call` + job `e2e` |
| `.github/workflows/preview.yml` | Nuovo |
| `.github/workflows/deploy_prod.yml` | Modifica: gate + Node 22 + workflow_dispatch + SHA pin |

## Riepilogo commit

```
feat(oc:8022): add E2E Cypress job to test workflow
feat(oc:8022): add Surge preview workflow with teardown on PR close
feat(oc:8022): gate deploy behind tests, Node 22, workflow_dispatch, pin scp-deploy SHA
```
