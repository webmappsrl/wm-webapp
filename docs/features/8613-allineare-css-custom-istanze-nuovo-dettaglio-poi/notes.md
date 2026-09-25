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
| "Ottieni indicazioni" visibile ma inerte, webapp | manca il GPS continuo | `global.scss`, regola di prodotto |
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
- **L'app 32 resta com'è**, allineata ai tre gemelli di Forestas. Giuseppe aveva detto che non serviva
  lavorarci, ma tenerla identica costa meno che farla divergere per una riga.

## Aperto

- Il **push dei repo padre** resta in locale per indicazione del dev; `wm-core` va spinto.
- La **description di oc:8613 su Orchestrator** descrive ancora il ticket come un audit e elenca app
  sbagliate: va riscritta su quello che il ticket è diventato.
- `wm-config-detail` non ha un `order`: con un tema che riordina finirebbe in cima, come è successo al
  pulsante "Modifica". Oggi non si nota perché ha altezza zero quasi ovunque, ma è lo stesso difetto
  latente. Non toccato su indicazione del dev.
