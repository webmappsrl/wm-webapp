---
paths:
  - "angular.json"
  - "scripts/**"
---

# Trappole: configuration Angular e script di deploy

Il perché sta in [docs/knowledge/variante-camminiditalia.md](../../docs/knowledge/variante-camminiditalia.md).

- **Una nuova configuration va dichiarata due volte**: sotto `architect.build.configurations` e
  sotto `architect.serve.configurations`. Dimenticare la seconda fa fallire
  `ng serve --configuration=<nome>` con «Configuration '<nome>' for target 'serve' … is not set in
  the workspace» — errore già commesso e corretto una volta (oc:8512).

- **`scripts/lib/run.js` e `scripts/serve.js` sono copie identiche** di
  `webmapp-app/core/scripts/`. Non c'è astrazione condivisa fra i due repo: se tocchi uno,
  controlla l'altro, perché nessuno strumento segnalerà il drift.

- **Cambiare `environment.ts` a server acceso non cambia la configuration.** `serve.js` legge
  `shardName` **una volta sola, all'avvio**, e da lì decide se passare `--configuration=<shard>`; i
  `fileReplacements` sono quindi congelati al lancio. L'`appId` invece viene ricompilato al volo,
  perché sta nel bundle. Il risultato è un server che serve la build di uno shard con l'`appId` di
  un altro, senza che niente lo segnali: è già successo, un server avviato su `camminiditalia` e poi
  usato per provare l'app 75 mostrava la searchbar della variante e sembrava un difetto. **Per
  cambiare shard si riavvia il server**; per cambiare solo app basta salvare il file.

  Come accorgersene senza indovinare: cerca nel bundle servito un marcatore della variante, per
  esempio `curl -s http://localhost:<porta>/main.js | grep -c wm-searchbar-camminiditalia-panel`.
  Zero significa build generica, diverso da zero significa variante.

- **`sshpass -e` si applica solo se `SSHPASS` è impostata.** In locale l'autenticazione è a chiave
  e avvolgere i comandi li farebbe fallire; `rsync` non va avvolto affatto, legge `RSYNC_RSH`.
