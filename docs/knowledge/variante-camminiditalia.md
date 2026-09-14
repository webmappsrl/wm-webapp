# La variante `camminiditalia` di questa webapp

> Il meccanismo dei file gemelli e il criterio per estrarre una classe base sono dominio della
> libreria: `src/app/shared/wm-core/docs/knowledge/varianti-per-shard.md`. Qui c'è come lo usa
> questo prodotto.

## Come funziona oggi

`angular.json` ha una configuration `camminiditalia`, dichiarata **sia** sotto
`architect.build.configurations` **sia** sotto `architect.serve.configurations`. I suoi
`fileReplacements` coprono due soli componenti del submodule `wm-core`,
`home-layer.component.ts` e `search-bar.component.ts`, di cui esistono già le varianti
`.camminiditalia.ts`.

`npm start` passa da `scripts/serve.js`, che legge `shardName` da `environment.ts` e lancia
`ng serve --configuration=<shardName>` se esiste una configuration di serve con quel nome — match
esatto, poi per prefisso per le varianti `dev`. Dato che `environment.ts` dichiara già
`shardName: 'camminiditalia'`, `npm start` builda con i componenti custom senza flag manuali.

Il deploy è tre script: `deploy-default.js` (generico, `scp`), `deploy-camminiditalia.js`
(`fileReplacements`, `rsync` più creazione della cartella remota via `ssh mkdir -p`) e `deploy.js`
che li orchestra.

## Perché così

- **Niente equivalente di `profile.page.camminiditalia.ts`** (oc:8512): esiste in `webmapp-app`,
  ma questa webapp non ha una pagina «profile» — verificato, non applicabile. Nessuna modifica al
  submodule `wm-core` è stata necessaria.

## Il gemello in `webmapp-app`

`scripts/lib/run.js` e `scripts/serve.js` sono **lo stesso identico file** di
`webmapp-app/core/scripts/`. Non c'è alcuna astrazione condivisa fra i due repo: è una
duplicazione consapevole, e il rischio di drift è stato segnalato e accettato. Chi tocca uno dei
due controlli l'altro, perché niente lo segnalerà.

## Debito noto

- **Nessuna copertura CI o E2E sulla configuration `camminiditalia`** (oc:8512): un refactor in
  `wm-core` che rinomini o sposti i file `.camminiditalia.ts` la rompe in silenzio, senza che
  nessuna pipeline se ne accorga. Rischio accettato esplicitamente.
- **Fuori scope e a carico del developer** (oc:8512): il redirect server-side di
  `1.camminiditalia.webmapp.it` verso la cartella nuova, la verifica visiva della resa dei
  componenti, e il tema `src/theme/camminiditalia/`, che è una cartella vuota.
