> Ticket: oc:8382

# Fix build --prod per deploy e deploy-to-web (webmapp-app + wm-webapp)

## Cosa cambia

Questo repo (`wm-webapp`) è coinvolto solo marginalmente in questo ticket. `ionic build --configuration production` è già stato verificato pulito (0 errori, solo warning non bloccanti su bundle budget e Sass `@import` deprecato) e il workflow `deploy_prod.yml` già chiama `ionic build --prod` direttamente. L'unica incoerenza trovata: tra gli script `package.json` (`deploy`, `deploy-cai`, `surge-sardegna`, `surge-sardegna-dev`, `surge-carg`), solo `surge-camminiditalia` non usa `--prod`. Questo ticket allinea anche `surge-camminiditalia` a `--prod` per coerenza, dato che è l'unico shard mai stato validato in build ottimizzata tramite lo script preview.

Il grosso del lavoro (17 errori di build, rimozione codice morto, fix tipo) riguarda il repo separato `webmapp-app` — vedi il suo `overview.md` nello stesso percorso.

## Perché

Coerenza tra gli script di build/deploy: tutti gli shard dovrebbero passare per build ottimizzata (`--prod`) prima di essere pubblicati, `surge-camminiditalia` era rimasto l'unico indietro.

## Requisiti

- [ ] Script `surge-camminiditalia` in `package.json` usa `ionic build --prod` (o `--configuration production`)
- [ ] Validazione via Surge preview sullo shard camminiditalia dopo l'allineamento (primo test `--prod` per questo shard)

## Rischi

- Essendo la prima volta che lo shard camminiditalia viene compilato in `--prod`, potrebbero emergere differenze runtime AOT vs JIT mai osservate finora su questo shard specifico. Mitigazione: verifica manuale su Surge preview prima di considerare il task concluso.

## Out of scope

- Qualsiasi modifica di codice applicativo in questo repo (nessun errore di build da risolvere qui)
- Modifiche a `deploy_prod.yml` (già corretto, usa `--prod` direttamente)

## Moduli toccati

- `package.json` — script `surge-camminiditalia` (repo: wm-webapp)
