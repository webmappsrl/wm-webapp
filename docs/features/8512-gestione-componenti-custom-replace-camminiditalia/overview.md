> Ticket: oc:8512

# Gestione componenti custom con replace per camminiditalia (webapp)

## Cosa cambia

- Aggiunta di una configurazione Angular `camminiditalia` in `angular.json` di wm-webapp, con `fileReplacements` che instradano `home-layer.component.ts` e `search-bar.component.ts` (submodule condiviso `wm-core`) verso le rispettive varianti `.camminiditalia.ts` — **già esistenti** nel submodule (introdotte da oc:8391 e oc:8414 per webmapp-app, mai collegate lato webapp).
- Nuovo script di deploy dedicato (Node, mirror 1:1 del pattern già usato in `webmapp-app/core/scripts/deploy-camminiditalia.js` + `scripts/lib/run.js`) che builda con `--configuration=production,camminiditalia --output-path=www-camminiditalia` e invia il risultato via `rsync`/`scp` a `server:/var/www/html/camminiditalia.webmapp.it/`. Esposto come script npm dedicato in `package.json`, **non** automatizzato in CI.
- Lo script `surge-camminiditalia` esistente in `package.json` viene allineato per buildare con la configurazione `camminiditalia` (fileReplacements), mantenendo invariata la destinazione di preview su surge.sh.

## Perché

Oggi wm-webapp builda sempre con i componenti generici (`home-layer`, `search-bar`), anche quando servito sull'hostname `1.camminiditalia.webmapp.it` — perché il meccanismo di sostituzione a compile-time (`fileReplacements`) esiste già nel submodule condiviso `wm-core` ed è già attivo in `webmapp-app` (mobile), ma non è mai stato collegato nel repo webapp. Risultato: i clienti camminiditalia su web non vedono i componenti custom (home-layer con logo/heart preferiti in stile dedicato, search-bar con pannello filtri) che già vedono su mobile.

## Requisiti

- [ ] Configurazione `camminiditalia` in `angular.json` (wm-webapp) con `fileReplacements` per `home-layer.component.ts` e `search-bar.component.ts` (nessun equivalente di `profile.page.camminiditalia.ts` di webmapp-app: wm-webapp non ha una pagina "profile", verificato — non applicabile)
- [ ] Script Node dedicato per build+invio al server (mirror del pattern `webmapp-app/core/scripts/deploy-camminiditalia.js` + `scripts/lib/run.js`), esposto come script npm, **non** eseguito automaticamente in CI
- [ ] Path di output locale (`www-camminiditalia`) e destinazione remota (`server:/var/www/html/camminiditalia.webmapp.it/`) hardcoded ed espliciti nello script, per evitare che una build camminiditalia finisca nella cartella condivisa `app.geohub.webmapp.it/` (o viceversa) e rompa il sito per tutti gli shard
- [ ] Script `surge-camminiditalia` esistente allineato per buildare con la configurazione `camminiditalia` (fileReplacements), destinazione surge.sh invariata
- [ ] Build reale verificata in locale (`ng build --configuration=production,camminiditalia` o equivalente `ionic build`) prima di considerare il ticket concluso
- [ ] Nessun invio reale al server di produzione in questo ciclo — lo esegue manualmente il developer a valle del merge
- [ ] La cartella `/var/www/html/camminiditalia.webmapp.it/` **non esiste ancora** sul server — lo script/comando di deploy deve gestirne la creazione (es. `mkdir -p` remoto o rsync con creazione automatica della destinazione)

## Rischi

Emersi in Fase: challenge (revisore adversariale), con relativa mitigazione/decisione:

- **Ambiguità hostname/cartella di destinazione**: il dominio pubblico attuale (`1.camminiditalia.webmapp.it`) e la nuova cartella server (`/var/www/html/camminiditalia.webmapp.it/`) non coincidono testualmente — chiarito dal developer: la cartella è nuova (non esiste ancora), il redirect di `1.camminiditalia.webmapp.it` verso di essa verrà fatto separatamente dal developer, fuori da questo ciclo. Nessuna azione aggiuntiva richiesta in questo ticket oltre a creare la cartella nello script di deploy.
- **Nessuna build CI valida la configurazione `camminiditalia`**: `angular.json` referenzierà path interni del submodule `wm-core` (dettaglio implementativo, non un'API pubblica); un refactor futuro in wm-core potrebbe rompere silenziosamente questa configurazione senza che nessuna pipeline se ne accorga. Rischio accettato esplicitamente dal developer — nessun job CI aggiuntivo in questo ciclo; verificare manualmente con una build reale prima di ogni deploy camminiditalia.
- **Rischio di contaminazione incrociata**: un errore nei path dello script (output locale o destinazione remota) potrebbe far finire una build camminiditalia nella cartella condivisa generica (o viceversa), rompendo il sito per tutti gli shard. Mitigato tenendo i path hardcoded ed espliciti nello script (mai una destinazione generica riutilizzata).
- **`search-bar.component.camminiditalia.ts` ha un profilo di rischio più alto di `home-layer`**: componente complesso (Store, FormBuilder, PostHog, misure `scrollHeight` a runtime), con una storia di bug visuali che compilavano correttamente ma si rompevano solo a schermo (oc:8414, bug WebKit). La build reale non intercetta questo tipo di regressione. Mitigato: il developer eseguirà personalmente una verifica visiva manuale (avvio locale con configurazione `camminiditalia`, ispezione su browser desktop) prima di considerare il ticket concluso — non è richiesta una copertura cross-browser automatizzata in questo ciclo.
- **Tema CSS dedicato `src/theme/camminiditalia/` vuoto**: le SCSS delle varianti camminiditalia sono state scritte nel contesto del tema di webmapp-app; senza un tema equivalente lato webapp il rendering potrebbe risultare incoerente (variabili SCSS globali diverse). Resta esplicitamente out of scope — il developer verificherà visivamente e, se necessario, aprirà un intervento successivo dedicato al tema.
- **Difficoltà di rollback del deploy reale in produzione**: nessun versionamento lato server (nessuna cartella con timestamp/sha, nessuno script di rollback) — un problema in produzione richiederebbe ricostruire a mano la combinazione di commit precedente e rilanciare lo script. Rischio accettato esplicitamente dal developer senza mitigazione in questo ciclo, da registrare in `notes.md`.

## Out of scope

- Redirect server-side (nginx/altro) di `1.camminiditalia.webmapp.it` verso la nuova cartella dedicata — se ne occupa il developer separatamente, fuori da questo ciclo
- Ambiente dev/staging camminiditalia (`camminiditaliadev`) — solo produzione in questo ciclo
- Esecuzione reale dell'invio al server (`scp`/`rsync` verso `server:/var/www/html/camminiditalia.webmapp.it/`) — lo script viene creato e verificato in locale, non lanciato contro il server reale
- Popolamento del tema CSS dedicato `src/theme/camminiditalia/` (cartella attualmente vuota in wm-webapp) — non richiesto da questo ticket, il redirect/tema resta a carico del developer

## Moduli toccati

- `angular.json` (wm-webapp, repo principale) — nuova configurazione `camminiditalia`
- `package.json` (wm-webapp, repo principale) — nuovo script `deploy-camminiditalia`; script `surge-camminiditalia` esistente modificato
- `scripts/deploy-camminiditalia.js` (nuovo, wm-webapp)
- `scripts/lib/run.js` (nuovo, wm-webapp)

Nessuna modifica al submodule `wm-core`: le varianti `.camminiditalia.ts` di `home-layer.component` e `search-bar.component` esistono già (oc:8391, oc:8414).
