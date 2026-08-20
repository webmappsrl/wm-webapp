> Ticket: oc:8382

# Notes — Fix build --prod per deploy e deploy-to-web (webmapp-app + wm-webapp)

## Deviazioni dal piano

Nessuna. Il piano per questo repo (Task 4: allineamento dello script `surge-camminiditalia` a `--prod`) è stato eseguito esattamente come pianificato in `plan.md` (repo `webmapp-app`).

## Bug trovati

Nessuno. La build `--configuration production` era già pulita prima di questa modifica (0 errori, solo warning non bloccanti su bundle budget e Sass `@import` deprecato) e resta tale dopo.

## Decisioni

Nessuna decisione specifica a questo repo oltre a quanto già documentato nell'overview.

## Follow-up

- Verifica Surge preview sullo shard camminiditalia (prima build `--prod` mai eseguita per questo shard) è un gate manuale da completare dal dev prima del merge, come da Requisiti in `overview.md`.
