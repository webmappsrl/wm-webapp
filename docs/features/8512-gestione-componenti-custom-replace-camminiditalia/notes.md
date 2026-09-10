> Ticket: oc:8512

# Notes — Gestione componenti custom con replace per camminiditalia (webapp)

## Deviazioni dal piano

- **Verifica exit-code di `scripts/lib/run.js` (Task 2) non riproducibile come da piano**: lo step `node -e "require('./scripts/lib/run').run('sh', ['-c', 'exit 3'])"` non ha propagato l'exit code 3 come atteso — non per un bug nell'helper, ma perché `spawnSync(..., {shell: true})` unisce comando+argomenti con un semplice join per spazi prima di passarli alla shell esterna, "spezzando" l'argomento multi-parola `-c 'exit 3'` in token separati. La shell esterna ha quindi eseguito `sh -c exit 3` (comando `exit` senza argomento, `3` diventato un parametro posizionale ignorato), risultando in exit 0. Verificato invece correttamente il comportamento reale della propagazione exit-code con un comando a singolo token (`run('false', [])` → `exit code: 1`, messaggio di errore corretto su stderr). Il piano andrebbe corretto per test futuri simili: comandi con argomenti multi-parola destinati a un flag come `-c` non sono affidabili come case di test con questo helper.

## Bug trovati

- **Configurazione `camminiditalia` mancante sotto `architect.serve` in `angular.json`**: il piano/l'implementazione iniziale aggiungeva la configurazione solo sotto `architect.build.configurations`. `ng serve --configuration=camminiditalia` falliva con `Configuration 'camminiditalia' for target 'serve' in project 'app' is not set in the workspace`. Corretto aggiungendo la stessa configurazione (`{"buildTarget": "app:build:camminiditalia"}`) anche sotto `architect.serve.configurations`, mirror del pattern già usato per `production`. Riverificato con `ng serve --configuration=camminiditalia` (build reale, compilazione riuscita) e con `npm start` (via il nuovo `scripts/serve.js`, vedi sotto).

## Decisioni

- **Scope esteso oltre l'overview/plan originali, su richiesta esplicita del developer durante la review-gate**, prima dei commit:
  1. Aggiunti `scripts/deploy-default.js` (mirror del vecchio comando inline `deploy`) e `scripts/deploy.js` (orchestratore che lancia in sequenza default + camminiditalia), replicando 1:1 il pattern a 3 script già usato in `webmapp-app` (`deploy-default.js` / `deploy-camminiditalia.js` / `deploy.js`). `package.json`: `deploy` ora è l'orchestratore, `deploy-default` il generico da solo, `deploy-camminiditalia` invariato.
  2. **Automazione CI del deploy invertita rispetto alla decisione presa in reverse-interaction** ("non renderlo automatico"): il developer ha esplicitamente richiesto, durante la review-gate, che il deploy camminiditalia diventasse automatico in CI insieme al generico. Confermato via domanda esplicita (rischio: modifica pipeline CI/CD, azione difficile da invertire). `deploy_prod.yml` ora esegue `npm run deploy` (entrambi) di default su push su `main`, con due modi per scegliere un target singolo: input `workflow_dispatch.target` (manuale) o flag `--target (default|camminiditalia|all)` nel messaggio di commit (stesso pattern già esistente in `preview.yml` per `--id`/`--shard`).
  3. Per supportare l'autenticazione SSH a password in CI (pattern esistente: `sshpass`/`SSHPASS`) mantenendo al contempo l'uso diretto senza `sshpass` in locale (autenticazione a chiave), `deploy-default.js` e `deploy-camminiditalia.js` avvolgono condizionalmente le chiamate `scp`/`ssh` con `sshpass -e` solo se `process.env.SSHPASS` è impostata. `rsync` non richiede questo wrapping esplicito: rispetta nativamente la variabile `RSYNC_RSH` impostata dal workflow CI (stesso approccio già in uso in `webmapp-app/.github/workflows/deploy_prod.yml`).
  4. Aggiunto `scripts/serve.js` (mirror 1:1 di `webmapp-app/core/scripts/serve.js`): legge `shardName` da `src/environments/environment.ts` e, se esiste una configuration `serve` con lo stesso nome (o un prefisso, per coprire varianti `dev`), lancia `ng serve --configuration=<shardName>` automaticamente. `package.json`: `"start"` ora punta a questo script invece di `ng serve` diretto. Dato che `environment.ts` ha già `shardName: 'camminiditalia'`, `npm start` builda oggi automaticamente con i componenti custom camminiditalia senza bisogno di specificare `--configuration` a mano.
- **Ri-stima post-implementazione**: il developer ha accettato una revisione della stima da 2.0h a **2.7h** per coprire lo scope aggiuntivo dei punti 1-4 sopra (script deploy default+orchestratore ~0.2h, `serve.js` ~0.15h, modifiche CI ~0.3h, fix configurazione `serve` ~0.05h). Aggiornato su Orchestrator (`estimated_hours: 2.7`).

## Follow-up

- Nessuna copertura CI/E2E per la configurazione `camminiditalia` (build o test) — rischio già documentato in `overview.md`, accettato dal developer senza mitigazione in questo ciclo.
- Redirect server-side (nginx) di `1.camminiditalia.webmapp.it` verso la nuova cartella `/var/www/html/camminiditalia.webmapp.it/`: resta a carico del developer, fuori da questo ciclo.
- Verifica visiva della resa di `search-bar.component.camminiditalia.ts`/`home-layer.component.camminiditalia.ts` (browser reale): a carico del developer dopo il merge, non eseguita in questo ciclo.
- Tema CSS dedicato `src/theme/camminiditalia/` (cartella vuota): da valutare solo se la verifica visiva del developer rivela un rendering incoerente.
