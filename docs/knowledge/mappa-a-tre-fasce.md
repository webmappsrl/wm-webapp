# La pagina mappa a tre fasce

Come sono divisi orizzontalmente pannello della home, mappa e dettaglio del POI, e perché i
controlli della mappa stanno dove stanno.

## Come funziona oggi

La pagina si legge in tre fasce affiancate:

| Fascia | Elemento | Larghezza |
|---|---|---|
| sinistra | `.details-container`, il pannello della home | 400px quando aperto, 0 quando chiuso |
| centro | `wm-geobox-map` | lo spazio che resta |
| destra | `webmapp-poi-popup`, il dettaglio del POI | `--wm-poi-popup-width` |

Le due misure del dettaglio vivono in `map.page.scss`, sul tag della pagina, e il popup le legge:

```scss
webmapp-map-page {
  --wm-poi-popup-width: 400px;              // quanto il pannello della home
  --wm-poi-popup-top: calc(72px + env(safe-area-inset-top));
  @media (max-width: 1024px) { --wm-poi-popup-width: 320px; }
}
```

**I 72px non sono un numero tondo scelto a occhio**: i controlli in alto a destra della mappa —
profilo, lingua, filtri, disegno — stanno a `top: 16px` e sono alti 40px su una riga sola, perché
`map-core` li dichiara `flex-wrap: nowrap`. Finiscono quindi a 56px, e il dettaglio comincia 16px
sotto, lo stesso distacco che quei controlli hanno dal bordo destro.

## Perché così

- **Il dettaglio è largo quanto la home, non una percentuale** (oc:8406): lo chiedeva lo scrum del
  04/09/2026 — «lo farei largo quanto la home, in maniera che ti si creano tre fasce». Prima era
  `width: 20%`, che a 1024px di viewport valeva ~205px: metà, e abbastanza stretto da far andare a
  capo la catena regione → provincia → comune nell'intestazione del POI.

- **Il dettaglio scende sotto i controlli, invece di spostarli** (oc:8406): il popup sta a
  `z-index: 3` contro il 2 dei controlli, quindi aprendo un POI ci finivano sotto e sparivano —
  «quando apri il pop-up non vedi più filtri e lingua», stessa call. La prima soluzione li
  spostava a sinistra con una regola in `map.page.scss`, ed è stata scartata per due motivi: per
  vincere sulla specificità di `map-core` doveva ricalcarne il selettore interno
  (`wm-map .map-container > .top-right`), quindi una rinomina in libreria l'avrebbe silenziosamente
  disattivata; e i controlli scivolavano di 400px a ogni apertura, con l'occhio che li perdeva.
  Abbassare il dettaglio costa 37px di altezza e non tocca niente di `map-core`.

- **Il gradino a 320px sotto i 1024px** (oc:8406): con la home aperta, tre fasce da 400px
  lascerebbero ~200px di mappa. Si stringe il dettaglio, perché la mappa è il motivo per cui la
  pagina esiste.

- **Le due misure stanno sulla pagina, non sul popup** (oc:8406): è il confronto con i 400px di
  `.details-container` a dare senso alla larghezza del dettaglio, e il valore serve anche a chi
  dovrà posizionare altro accanto. Il popup la legge con un fallback, così resta montabile anche
  fuori da questa pagina.
