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
