> Ticket: oc:8169

# Esperienze utente — note dell'allineamento della webapp

Gemelle: `wm-core/docs/features/8169-esperienze-utente-cammino-foto-descrizione/notes.md` (frontend)
e `camminiditalia/docs/features/8169-…/notes.md` (backend).

## Cosa è stato fatto

- **wm-core** dal commit `0007580` al branch `feature/oc-8169-esperienze-modello-dedicato` (PR
  wm-core #218): porta le esperienze e tutto ciò che è entrato in wm-core nel frattempo, compreso
  il Passaporto. Dopo il merge della #218 il puntatore va portato su `develop`.
- **wm-types** da `99c4a71` a `cc301d2`: le varianti del Passaporto importano `@wm-types/passport`.
  wm-types non ha un branch `develop`, quindi il puntatore è lo stesso dell'app.
- **map-core** invariato: la build non lo richiede.
- **`angular.json`**, configuration camminiditalia: aggiunte layer-box e search-box (varianti del
  Passaporto), track-properties e ugc-track-properties (flag `showExperiences`).

Verifica della build: con lo shard camminiditalia `showExperiences = true` compare 2 volte in
`main.js`, `wm-passport-logo-ring` è presente.

## Deviazioni dal piano

- Il piano indicava il branch di wm-core `feature/oc-8169-esperienze-utente-cammino-foto-descrizione`:
  il lavoro sta invece su `feature/oc-8169-esperienze-modello-dedicato`.
- La riga di ugc-box in `angular.json` non è in questo commit: appartiene a oc:8764 (import da file
  tolto da camminiditalia). Finché non arriva su `develop`, la webapp camminiditalia mostra ancora
  il bottone di import.

## Cosa è emerso provando la webapp

Le correzioni stanno in wm-core (commit `d6a852f` della #218) e valgono anche per l'app:

- **Carosello non trascinabile col mouse.** La riga a scorrimento nascondeva la barra: col mouse non
  si scorreva. Carosello delle esperienze e galleria del dettaglio ora usano `wm-swiper`, già in uso
  nel progetto, che gestisce trascinamento, snap e margini laterali.
- **Popup del Passaporto tagliato.** Nella modale desktop di Ionic (500/600px) la vista 6 «Cammino
  completato» superava l'altezza e il fondo restava nascosto, perché scorreva solo la lista delle
  tappe. Ora scorre tutto il dettaglio; aprendo «Vedi le N tappe» le esperienze restano visibili e
  la lista va sotto.
- **Shard `local` con la barra finale.** Con `origin: 'http://127.0.0.1:8000/'` le chiamate
  diventano `…8000//api/experiences` e Laravel risponde 404, che per l'app vuol dire «esperienze
  spente»: la sezione sparisce senza errori. Configurazione locale del dev, non committata, ma da
  ricordare: l'`origin` va scritto senza barra finale.

## Esito della prova del dev

Provata sul browser col backend locale: sezione sul cammino e nel Passaporto, carosello col mouse,
popup che scorre con le tappe aperte. Esito positivo.
