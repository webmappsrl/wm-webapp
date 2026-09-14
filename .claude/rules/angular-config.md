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

- **`sshpass -e` si applica solo se `SSHPASS` è impostata.** In locale l'autenticazione è a chiave
  e avvolgere i comandi li farebbe fallire; `rsync` non va avvolto affatto, legge `RSYNC_RSH`.
