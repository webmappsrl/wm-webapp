# La pagina mappa a tre fasce

Come sono divisi orizzontalmente pannello della home, mappa e dettaglio del POI, e perché i
controlli della mappa stanno dove stanno.

## Come funziona oggi

La pagina si legge in tre fasce affiancate:

| Fascia | Elemento | Larghezza |
|---|---|---|
| sinistra | `.details-container`, il pannello della home | 400px quando aperto, 0 quando chiuso |
| centro | `wm-geobox-map` | lo spazio che resta |
| destra | `webmapp-poi-popup`, il dettaglio del POI | `--wm-poi-popup-width`, staccato dal bordo di `--wm-poi-popup-right` |

Le tre misure del dettaglio vivono in `map.page.scss`, sul tag della pagina, e il popup le legge:

```scss
webmapp-map-page {
  --wm-poi-popup-width: 400px;              // quanto il pannello della home
  --wm-poi-popup-top: calc(72px + env(safe-area-inset-top));
  --wm-poi-popup-right: 76px;
  @media (max-width: 1024px) { --wm-poi-popup-width: 320px; }
}
```

**Né i 72px né i 76px sono scelti a occhio**: escono tutti e due dai controlli della mappa.

I **72px** dall'alto: profilo, lingua, filtri e disegno stanno a `top: 16px` e sono alti 40px su una
riga sola, perché `map-core` li dichiara `flex-wrap: nowrap`. Finiscono quindi a 56px, e il
dettaglio comincia 16px sotto, lo stesso distacco che quei controlli hanno dal bordo.

I **76px** da destra: `.ol-zoom` sta a `right: 20px` ed è largo 40px, quindi occupa i primi 60px dal
bordo, più i soliti 16px. Quei tasti hanno `z-index: 10000` in `global.scss`, quindi non sparivano
sotto al dettaglio: si disegnavano **sopra** il contenuto del pannello, che è peggio. Ora hanno una
colonna loro.

## Perché così

- **Il dettaglio è largo quanto la home, non una percentuale** (oc:8406): lo chiedeva lo scrum del
  04/09/2026 — «lo farei largo quanto la home, in maniera che ti si creano tre fasce». Prima era
  `width: 20%`, che a 1024px di viewport valeva ~205px: metà, e abbastanza stretto da far andare a
  capo la catena regione → provincia → comune nell'intestazione del POI.

- **Il dettaglio sta sullo stesso piano delle fasce alte, non sopra** (oc:8406): in `map-core`
  (`map.component.scss`) i piani sono tre — `top-left`, `top-right`, `bottom` e `bottom-center` a
  `z-index: 2`; `bottom-right`, la scala e l'attribuzione a 1; il canvas senza z-index, quindi
  ancora sotto. Il popup era a 3 e le scavalcava tutte:
  i controlli restavano visibili, ma i **menu** che aprono finivano sotto al dettaglio. A parità di
  z-index decide l'ordine nel DOM di `map.page.html`, che è già quello giusto: `.details-container`
  viene prima del popup, `wm-geobox-map` dopo. Nessun override su `map-core`.

- **Il dettaglio scende sotto i controlli, invece di spostarli** (oc:8406): aprendo un POI i
  controlli finivano sotto al popup e sparivano — «quando apri il pop-up non vedi più filtri e
  lingua», stessa call. La prima soluzione li spostava a sinistra con una regola in
  `map.page.scss`, ed è stata scartata per due motivi: per
  vincere sulla specificità di `map-core` doveva ricalcarne il selettore interno
  (`wm-map .map-container > .top-right`), quindi una rinomina in libreria l'avrebbe silenziosamente
  disattivata; e i controlli scivolavano di 400px a ogni apertura, con l'occhio che li perdeva.
  Abbassare il dettaglio costa 37px di altezza e non tocca niente di `map-core`.

- **Il gradino a 320px sotto i 1024px** (oc:8406): con la home aperta, tre fasce da 400px
  lascerebbero ~200px di mappa. Si stringe il dettaglio, perché la mappa è il motivo per cui la
  pagina esiste.

- **Le tre misure stanno sulla pagina, non sul popup** (oc:8406): è il confronto con i 400px di
  `.details-container` a dare senso alla larghezza del dettaglio, e le altre due nascono dalla
  posizione dei controlli della mappa, che sulla pagina si vedono tutti insieme. Il popup le legge
  con un fallback, così resta montabile anche fuori da questa pagina.
