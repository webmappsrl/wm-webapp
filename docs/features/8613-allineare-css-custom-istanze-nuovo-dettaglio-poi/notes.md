> Ticket: oc:8613

# Note

Deviazioni, errori e decisioni prese strada facendo. Il **perché** delle scelte che restano valide
sta in [docs/knowledge/css-custom-per-istanza.md](../../knowledge/css-custom-per-istanza.md); qui
c'è com'è andata.

## Correzioni emerse dal controllo visivo

Nessuna prevista dal piano: sono uscite tutte guardando le app una per una.

| Cosa si vedeva | Causa | Dove è stato corretto |
|---|---|---|
| Frecce assenti sulle schede dei layer, webapp | l'icon font si chiama `wm` qui e `webmapp` sull'app | alias `@font-face` in `src/assets/icons/webmapp-icons/style.css` |
| "Modifica" sopra l'intestazione del percorso, webapp | slot `[bottom]` senza `order` in un contenitore riordinato dal tema | `order: 100` in `track-properties.component.scss` (wm-core) |
| "Ottieni indicazioni" visibile sulla webapp | **decisione del dev**, non un difetto: il pulsante avvia la navigazione assistita e va mostrato solo dove c'è il GPS dell'app | `global.scss`, regola di prodotto |
| Zoom in basso a destra, webapp | `geohub/75.css` li sposta per la tab bar dell'app | `global.scss`, regola di prodotto |
| Riquadro bianco attorno a "Torna alla home", app | `background: white` che funzionava solo su fondo bianco | `transparent` nei quattro temi della famiglia 32/forestas |
| Titolo del POI in Roboto invece del font dell'istanza, webapp | `--wm-font-family-content` si applicava solo a `webmapp-app-root`, e `ion-content` reimposta il proprio font: tutto il dettaglio ci sta dentro | `--ion-font-family` sull'host in `app.component.scss` (`b0315da`) |

## Errori fatti, e cosa li ha resi visibili

- **`git diff develop...HEAD` usato come misura di «cosa ha cambiato oc:8406»**: sbagliato, il branch
  porta dentro il lavoro di una ventina di altri ticket. Rifatto sui soli commit con quello scope.
- **Conteggio delle regole `order` con `grep -c "order:"`**, che conta anche `border:`. Quattro file
  risultavano avere sette `order` quando non ne hanno nessuno.
- **`querySelectorAll` su uno pseudo-elemento** restituisce sempre 0: quattordici regole del tema 75
  sembravano morte, dodici erano vive. Misurare sull'host.
- **Layer dedotti dalla configurazione invece che aperti**: l'app 75 è stata data per «senza layer»
  quando ne ha cinque, e nove selettori classificati morti erano solo irraggiungibili da lì.
- **Una regola inerte riagganciata**: l'avrebbe attivata per la prima volta invece di ripristinarla.
  Annullata prima di committare. Da qui il criterio: si riscrive solo ciò che già agganciava.
- **Un `--wm-poi-popup-width: 521px` proposto come "ripristino"** per le app la cui home è larga
  così: prima di oc:8406 quel popup era `width: 20%`, quindi non ripristinava niente. Annullato.
- **Due sessioni che misuravano su porte diverse credendole lo stesso prodotto**, e un server avviato
  con una configuration e usato con un'altra app. Costato un giro d'indagine; ora è una trappola
  documentata in `.claude/rules/angular-config.md`.

## Decisioni

- **La baseline è lo stato attuale**, non «com'era prima di oc:8406». Le due letture divergevano su
  Ville, dove il codice di `develop` e la produzione dicevano cose opposte, e la produzione è più
  vecchia. Decisione del dev, presa per chiudere una discussione che si stava allungando.
- **Le distinzioni fra prodotti restano dove servono**: la riscrittura è additiva, e una regola senza
  senso sull'altro prodotto non si traduce.
- **L'app 32 è stata modificata come i tre gemelli di Forestas**, non lasciata indietro: il chip
  trasparente e la correzione del suo commento sono andati in tutti e quattro. Giuseppe aveva detto
  che sulla 32 non serviva lavorare — «non viene usata più, diventa la uno» — ma tenerla identica ai
  gemelli costa meno che farla divergere per una riga, e i quattro file hanno tuttora lo stesso md5.

## Aperto

- La **description di oc:8613 su Orchestrator** descrive ancora il ticket come un audit e elenca app
  sbagliate: va riscritta su quello che il ticket è diventato.
- **Tre figli di `wm-track-properties` non hanno un `order`** — l'excerpt (`wm-inner-component-html`),
  `wm-txn-where` e `wm-config-detail` — quindi valgono 0 e con un tema che numera le sezioni
  risalgono **sopra l'intestazione**, che il tema 75 mette a 1. È lo stesso difetto del pulsante
  "Modifica", ma lì la cura era ovvia perché lo slot si chiama `[bottom]`: qui non esiste un valore
  giusto da inventare, perché la numerazione è del cliente. Un default su tutti i figli toglierebbe
  il difetto ma sposterebbe l'excerpt di Ville dove non è mai stato. Rimasto aperto di proposito.
- **La knowledge sui temi esiste in tre repo**, e la più lunga è in `wm-webapp`, che i file non li
  possiede più. Da ridurre a una sola, in `wm-core`, con le altre due che rimandano.

## Rettifiche — 28/09/2026

Trovate dalla review interna di fine ciclo. `docs/features/` è immutabile, quindi il testo sopra
resta com'era e le correzioni stanno qui.

| Dove | Diceva | È |
|---|---|---|
| `notes.md:19` | «Riquadro bianco attorno a "Torna alla home", **app**» | vero, ma incompleto: si vedeva **nella home**, non nel pannello della mappa. `wm-status-filter` monta in due punti e il tema non ne tocca nessuno, quindi il fondo è di prodotto — bianco nel pannello, grigio nella home (`#f2f2f2` sull'app, `#f4f5f8` sulla webapp). Lo stesso testo, con gli stessi riferimenti, sta nel commento dei quattro temi e nei notes della mobile |
| `plan.md:16` | «Nove file per **otto** app» | **sei** app: i tre shard di Forestas e i due di Cammini d'Italia portano lo stesso `appId` su domini diversi. Otto non esce da nessun modo di contare — né le coppie shard/appId (nove), né le app (sei), né i contenuti distinti (cinque) |
| `notes.md:27` | «**quattordici** regole del tema 75 sembravano morte, dodici erano vive» | gli pseudo-elementi del tema 75 sono **sedici**: quattordici `::after` e due `::before`. Il quattordici contava i soli `::after` |
| `docs/knowledge/css-custom-per-istanza.md` | «delle 20 regole `order`, **12** sono inerti» | **14 su 20** — 8 in FIE, 6 in CAI Parma. `.wm-alert` era contata fra le vive e non ha nessun bersaglio: il template monta `<wm-track-alert>`, quella classe non esiste. Corretto sul posto, perché è una pagina viva; `overview.md:45` il numero giusto lo dava già |

E due cose che il cantiere non registra affatto, aggiunte qui perché chi rilegge non le troverebbe
altrove:

- **La cancellazione di `src/app/meta.component.ts`**: era un `MetaComponent` locale doppione, e per
  giunta costruiva `theme/<appId>.css`, un percorso piatto mai esistito. `app.module.ts` importava
  già quello di `wm-core`. Rimuoverlo non ha cambiato niente se non dove si cerca.
- **Il gate sulla build**: `wm-core/scripts/check-themes.js` è invocato da `prebuild`, dai due
  script di deploy, dai quattro script Surge, da `deploy-cai`, da `deploy-webcomponent` e da un
  passo di `preview.yml`. Il cantiere non ne parla, e chi vedesse una build fermarsi lì non
  troverebbe la spiegazione in nessuno dei tre file. Ora sta in `docs/knowledge/ci-e-deploy.md`.
