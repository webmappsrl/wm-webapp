> Ticket: oc:8169

# Esperienze utente su cammino con foto e descrizione — allineamento della webapp

> Overview gemella (frontend): `src/app/shared/wm-core/docs/features/8169-esperienze-utente-cammino-foto-descrizione/overview.md`.

## Cosa cambia

La webapp punta oggi a un wm-core senza Passaporto (`0007580`, oc:8684). Viene aggiornata al
**nuovo** branch delle esperienze di wm-core, nato da `develop` e quindi con il Passaporto
(`e8fe1866`). Non al vecchio `feature/oc-8169-…` del 24/08, che è 22 commit indietro e senza
Passaporto. Dopo l'aggiornamento, sulla webapp camminiditalia l'utente può scrivere, leggere,
modificare ed eliminare le proprie esperienze come nell'app.

## Perché

Le esperienze si scrivono soprattutto a cammino finito, spesso da casa: la webapp deve
permetterlo. L'aggiornamento di wm-core porta con sé il Passaporto, che sulla webapp non è mai
stato montato e va reso funzionante perché la webapp sia provabile.

## Requisiti

- [ ] Dipendenza: si fa dopo che il branch delle esperienze di wm-core ha il codice.
- [ ] Puntatore del submodule wm-core aggiornato al branch delle esperienze; dopo il merge di
  wm-core, aggiornato a `develop`, così la webapp non punta a un commit che sparisce con lo squash.
- [ ] Puntatore di **wm-types** aggiornato almeno a `cc301d2`: le varianti del Passaporto importano
  `@wm-types/passport`, che la webapp (`99c4a71`) non ha. map-core aggiornato se il nuovo wm-core lo
  richiede.
- [ ] `fileReplacements` per camminiditalia in `angular.json`: si aggiungono **layer-box** e
  **search-box** (le varianti del Passaporto) e **track-properties** e **ugc-track-properties** (le
  esperienze della tappa e le esperienze collegate a una registrazione, accese dal flag
  `showExperiences`), accanto a home-layer e search-bar già presenti. Le sostituzioni di pagine
  dell'app (`profile`, `map`, `tabs`) non si copiano.
- [ ] Build della webapp senza errori; avvio in locale con lo shard camminiditalia e conteggio della
  variante compilata nel bundle per verificare che le sostituzioni siano attive.
- [ ] Esperienze funzionanti sulla webapp, con le foto scelte da file.
- [ ] Il dev prova la webapp prima della PR.
- [ ] `scripts/lib/run.js` e `scripts/serve.js`: se si toccano, si allineano agli omonimi
  dell'app (regola del `CLAUDE.md`).

## Rischi

- **Varianti mancanti senza errore.** Senza le nuove voci in `angular.json` la build passa e la
  webapp mostra layer-box e search-box di default, e le esperienze compaiono sul cammino e nel
  Passaporto ma non sulla tappa né nel dettaglio di una registrazione. Mitigazione: il conteggio
  delle varianti nel bundle (`showExperiences = true` deve comparire 2 volte).
- **Il bump porta tutto ciò che è entrato in wm-core da `0007580`**, non solo il Passaporto (fra gli
  altri oc:8764 e fogli tema per app di altri clienti). Arriva su `develop` e nella preview; la
  produzione parte solo da `main`, quindi resta fuori da questo ticket.
- **Il tab Passaporto non esiste nella webapp**: è una pagina dell'app (`core/src/app/pages/passport/`).
  Badge, anello, chip e modale del dettaglio stanno in wm-core e funzionano; manca solo il tab nella
  tab bar, che resta un limite noto.

## Out of scope

- Collaudo completo del Passaporto sulla webapp e tab Passaporto: si verifica che funzioni, non lo
  si riprogetta.
- Un controllo automatico che le `fileReplacements` di app e webapp coprano le stesse varianti.
- Rilascio: PR su `develop`.

## Moduli toccati

- `src/app/shared/wm-core`, `src/app/shared/wm-types` (puntatori dei submodule), eventualmente `map-core`
- `angular.json` — `fileReplacements` di camminiditalia
