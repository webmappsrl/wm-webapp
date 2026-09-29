> Ticket: oc:8406

# Unificare i componenti di dettaglio EcPoi tra webmapp-app (mobile) e wm-webapp (web)

> **Lo stato finale non è qui.** Questo documento fotografa la **pianificazione**, e per convenzione
> del repo resta com'era: `docs/features/` è il cantiere di come è andata, non la descrizione di
> come funziona. Diverse scelte sono cambiate in corso d'opera — le etichette, l'intestazione, il
> perimetro su wm-core — e ognuna è registrata con il suo perché in `notes.md`, che è il documento
> da leggere per sapere dove si è arrivati. Le caselle qui sotto non vengono spuntate: lo stato di
> avanzamento sta anch'esso in `notes.md`.

> **Ambito:** solo la **fase C**, la parte che vive in `wm-webapp`, e limitata ai **POI EC**.
> Le fasi A (promozione di `PoiPropertiesComponent` in wm-core) e B (ri-consumo da parte di
> webmapp-app) sono già completate e documentate in
> `wm-core/docs/features/8406-unificare-componenti-dettaglio-ecpoi/`.
>
> **Il ramo UGC resta invariato** — decisione presa dopo la fase di challenge, motivata sotto in
> "Perché il ramo UGC è fuori scope".
>
> Ogni affermazione su codice in questo documento è stata verificata contro il commit `5190949` di
> wm-core e contro il working tree di wm-webapp sul branch
> `feature/oc-8406-unificare-componenti-dettaglio-ecpoi`. Dove un comportamento è **assunto e non
> verificato**, è marcato `[da verificare]`.

## Cosa cambia

Il corpo del dettaglio dei POI **EC** in `wm-webapp` smette di essere un template proprio e passa a
`<wm-poi-properties>` (wm-core). `poi-popup` resta il **contenitore**: mantiene il proprio chrome
(titolo, categoria, chiusura, scorciatoie da tastiera, "edit geohub") e instrada.

Il `TODO` in `poi-popup.component.html:1` viene chiuso per il caso EC.

| Cosa | Oggi sul web (EC) | Dopo |
|---|---|---|
| `wm-config-detail` (oc:8181 → 8427 → 8458) | assente | presente — **è il gap che ha originato il ticket** |
| `wm-tab-detail` (quota) | riga `ele` reimplementata a mano | componente condiviso |
| `wm-poi-types-badges` | reimplementato inline | componente condiviso |
| `wm-tab-description` | `innerHTML` senza troncamento | con "Mostra altro"/"Mostra meno" |
| Indirizzo | link Maps con **bug** (vedi sotto) | `wm-address`, con `encodeURIComponent` |
| Telefoni multipli | etichette del backend mostrate grezze | ripuliti da `splitPhones` |
| `properties.info`, `properties.embedded_html` | mai renderizzati | renderizzati |
| Distanza dall'utente | assente | presente **solo con geolocalizzazione attiva** |
| Navigazione POI correlati | **due pulsanti inerti** | `wm-related-pois-navigator`, **solo sui POI correlati a un track** |

## Perché

Il dettaglio POI era implementato due volte, e la duplicazione ha già prodotto un difetto
misurabile: `wm-config-detail` è collegato a Layer ed EcTrack (che passano dai componenti
condivisi) e a EcPoi su mobile, ma **non** su wm-webapp. Ogni feature successiva sul dettaglio POI
avrebbe avuto lo stesso destino.

Esiste un precedente diretto: `wm-track-properties` vive in wm-core ed è consumato da entrambe le
piattaforme. La fase A ha applicato lo stesso pattern a EcPoi, l'ultimo dei quattro aggregati di
dettaglio rimasto fuori dalla libreria.

### Difetti preesistenti che questa fase corregge

Verificati sul DOM renderizzato in locale (app 29) e sul codice:

1. **Una graffa in più nell'URL di Google Maps.** `poi-popup.component.html:82` contiene `{{...}}}`:
   due graffe per l'interpolazione e una letterale. Nel DOM risulta
   `daddr=,,}&navigate=yes` — **tutti** i link Maps del popup portano una `}` spuria.
2. **Indirizzo spazzatura mostrato e cliccabile.** Sul POI 42535 il popup mostra `,,` come
   indirizzo, con link a Maps; su 42533 `,37013 Caprino Veronese VR,`; su 42417 virgola finale.
   `derivePoiAddress` scarta i segmenti vuoti.
3. **Navigazione POI correlati inerte.** `map.page.ts:65` è `next(): void {}` e `map.page.ts:81` è
   `prev(): void {}` — corpi vuoti.
4. **Telefoni multipli con `tel:` non funzionante su mobile** (`wm-phone` riceveva l'intera stringa
   CSV). Già risolto in fase A.
5. **Indirizzo mai visibile su mobile**: `properties.address` non è un campo del backend e nessuno
   lo popolava. Già risolto in fase A.

### Perché il ramo UGC è fuori scope

La challenge ha fatto emergere quattro problemi che stanno **tutti** sul ramo UGC, due dei quali
irreversibili lato dati:

- `wm-ugc-poi-properties` porta un **proprio `ion-header`** con nome del POI e pulsante di chiusura
  (`ugc-poi-properties.component.html:3-12`), più edit/delete/save e un proprio `isEditing$`:
  instradarvi mentre il contenitore conserva il suo chrome darebbe **titolo doppio, X doppia,
  edit/delete doppi**. Le due chiusure hanno inoltre semantica diversa — `triggerDismiss()` azzera
  solo `ugc_poi`, `unselectPOI()` azzera `poi`, `ugc_poi` **e** `ec_related_poi`.
- `ugc-poi-properties.component.scss:1-12` dichiara globalmente (`ViewEncapsulation.None`)
  `display:flex; align-items:flex-start; overflow:scroll` e
  `#wm-ugc-poi-details-content { height: calc(100% - 56px) }` — un **selettore di id globale** che
  assume un header alto 56px, scritto per un contenitore diverso dal popup.
- `image-picker.component.ts:88-91`: `remove()` dispatcha `deleteUgcMedia` **immediatamente** per le
  media già salvate, **senza alcuna conferma**. In un pannello da ~205px un click cancella una foto
  in modo irreversibile.
- `UgcPoiPropertiesComponent.updatePoi()` **non** dispatcha `stopDrawUgcPoi`, che sul web è
  necessario (`poi-popup.component.ts:177`): senza di esso, dopo un salvataggio il POI resta
  agganciato al draw e l'utente può alterarne la geometria inviandola al backend.

Nessun revert del codice ripristina una foto cancellata o una geometria spostata. Poiché il gap che
ha originato il ticket (`wm-config-detail`) riguarda **solo i POI EC**, limitare la fase C agli EC
lo chiude interamente con rischio dati nullo e **senza alcuna dipendenza da wm-core**. Lo split UGC
resta valido come ticket successivo, con un QA proprio — che richiede anche un POI UGC, assente
dal set attuale.

## Requisiti

- [ ] `poi-popup` instrada su `<wm-poi-properties>` **solo** per i POI EC; per i POI UGC il markup
      attuale resta invariato, incluso il ramo `isEditing$` con i dispatch `startDrawUgcPoi` /
      `stopDrawUgcPoi` (`poi-popup.component.ts:108`, `:113`, `:177`) e `wm-ugc-medias`
- [ ] Il discriminante EC/UGC nel contenitore è `poiProperties.uuid` (già usato dal template
      attuale alle righe 135 e 152), **non** il selettore `poi`
- [ ] Il chrome del popup resta nel contenitore: titolo, categoria, chiusura, "edit geohub" gated da
      `confShowEditingInline`, scorciatoie da tastiera (`poi-popup.component.ts:141-154`)
- [ ] La classe `.webmapp-poi-popup-title` è **conservata**:
      `cypress/e2e/url-with-parameters.cy.ts` (righe 21 e 39) vi asserisce, e va riattivata da
      oc:8022
- [ ] I due pulsanti `prevEVT`/`nextEVT` sono sostituiti da `<wm-related-pois-navigator>`, e
      `next()`/`prev()` vuoti sono rimossi da `map.page.ts`
- [ ] Le scorciatoie `ArrowLeft`/`ArrowRight` restano funzionanti dopo la rimozione di
      `next()`/`prev()`, **senza** duplicare la logica di `nextRelatedPoiId`/`prevRelatedPoiId`
      (vedi rischio 4)
- [ ] Gli stili di posizionamento di `wm-poi-properties` sono neutralizzati con un override nel
      **solo** repo wm-webapp (vedi rischio 1)
- [ ] Il blocco "Link utili" non compare vuoto sui POI con `related_url` privo di link usabili —
      **richiede il fix in wm-core** (`showUsefulUrls$`, Task 8): da wm-webapp non è risolvibile,
      perché il titolo in `feature-useful-urls.component.html:1` non ha `*ngIf` e `ion-list`
      contiene i nodi commento di Angular, quindi `:empty` non matcherebbe. La forma vuota reale è
      `[]` (2.572 POI), non `{}` (0 record)
- [ ] Uno spec Karma copre l'instradamento EC/UGC, registrato **sia** in `angular.json` →
      `test.options.include` **sia** in `tsconfig.spec.json` → `include` (vedi `CLAUDE.md`), e
      **senza** `NO_ERRORS_SCHEMA` sull'assert di instradamento (vedi rischio 8)
- [ ] `webmapp-track-audio` non è più usato dal ramo EC del popup
- [ ] I pin dei submodule sono bumpati nel superprogetto `wm-webapp`
- [ ] `src/environments/environment.ts` è ripristinato a `appId: 1` + `shardName: 'camminiditalia'`
      (i valori del branch corrente) prima del commit
- [ ] `[UX]` Nessuno scroll orizzontale alla larghezza minima del popup (~205px a 1024px di
      viewport), né a 256/384/512px
- [ ] `[UX]` Il troncamento "Mostra altro" di `wm-tab-description` funziona e **si resetta** al
      cambio POI — **richiede il fix in wm-core** (Task 9): l'istanza è riusata, non ricreata,
      quando cambia solo il binding, e lo stato non veniva azzerato. Include la cancellazione del
      `setInterval` orfano
- [ ] `[UX]` I target interattivi introdotti (accordion `wm-config-detail`, galleria, contatti)
      restano navigabili da tastiera e di dimensione adeguata al touch

## Rischi

**1. Il componente condiviso porta con sé il posizionamento del pannello mobile.**
`poi-properties.component.scss:1-10` dichiara su `wm-poi-properties`:
`position:absolute; bottom:0; height:100%; width:100%; z-index:2; background:white;
border-radius:15px`. Con `ViewEncapsulation.None` la regola è **globale**: dentro
`webmapp-poi-popup` (già `position:absolute`, quindi containing block valido) il figlio si
stenderebbe su tutta l'area del popup a `z-index:2`, coprendo titolo e categoria — nel chrome solo i
pulsanti hanno `z-index:9999`.

*Mitigazione (decisa):* override nel **solo** repo wm-webapp. È il pattern **già adottato dal
consumer mobile**, che in `map-details.component.scss:127-129` fa
`wm-poi-properties { position: relative; }` e gestisce lo scroll col contenitore
(`overflow-y:auto`, riga 94). Ne segue che il `position:absolute` in libreria è già residuo: il suo
unico consumer lo sovrascrive.
L'override del web deve coprire più proprietà di quello mobile: nel popup (`display:flex;
flex-direction:column`) un figlio con `height:100%` impedisce lo scroll interno, e vanno
neutralizzati anche `bottom`, `width`, `border-radius` e `background` — quest'ultimo **hardcoded
`white`**, quindi ignora il theming `--wm-color-*`.
*Attenzione al blast radius:* la regola entra nel foglio globale della webapp al primo POI aperto e
non ne esce. Un errore nell'override non degrada il popup, degrada la pagina (pannello bianco a
tutta area sopra la mappa). La specificità (0,0,2) vs (0,0,1) garantisce la correttezza di *quella*
regola, non il contenimento.
*Alternativa per il futuro:* un modificatore esplicito in libreria (`wm-poi-properties--embedded`)
chiuderebbe il debito invece di duplicare la correzione in due repo consumer. Vale come ticket di
pulizia, non come prerequisito.

**2. `wm-get-directions` può essere un pulsante che non fa nulla, senza errore.**
`startGetDirections$` (`user-activity.effects.ts:351-358`) usa `withLatestFrom(..., 
onLocationChange$)`, e `onLocationChange$` è un `ReplaySubject<Location>(1)` **senza valore
iniziale** (`geolocation.service.ts:44`). `withLatestFrom` non emette se una sorgente non ha mai
emesso, quindi l'effect si blocca **prima** di raggiungere il ramo `if (poiFirstCoords)` che per i
POI non avrebbe bisogno della posizione. Sul web `startNavigation()` è chiamata solo da
`geobox-map.component.ts:486`, cioè quando l'utente clicca il pulsante di geolocalizzazione: fino a
quel momento il click su "Ottieni indicazioni" è inerte.
*Mitigazione:* il link indirizzo→Maps **non si perde**, perché `wm-address` lo riproduce con
`[href]` reale e `encodeURIComponent` (`address.component.ts:41-45`) — meglio dell'attuale, che ha
il bug della graffa. Il difetto riguarda quindi il solo pulsante "Ottieni indicazioni". Da
verificare in QA e, se confermato, da trattare come bug a sé in wm-core: non è introdotto da questa
fase, è preesistente e diventa solo raggiungibile dal web.

**3. Larghezza del popup sotto il minimo per cui il corpo è progettato.**
Il popup è `width:20%` (`poi-popup.component.scss:7`): 205px a 1024px di viewport, 256px a 1280px,
384px a 1920px. Il corpo condiviso è pensato per la larghezza piena di un telefono, e il breakpoint
testing di riferimento parte da 320px — alle risoluzioni desktop comuni il popup è **più stretto di
qualsiasi telefono**. Esposti: le righe di `wm-tab-detail` (`ion-item` con label a sinistra e
`ion-note` a destra) e la galleria (`slidesPerView: 1.3`). "Horizontal Scroll" ha severità alta.
*Mitigazione:* verifica ai quattro valori; se le righe label+valore non tengono, si impilano nel
contesto webapp senza toccare il condiviso.

**4. Conflitto tra scorciatoie da tastiera e navigator.**
`wm-related-pois-navigator` non espone un'API imperativa raggiungibile dal contenitore
(`poiNext()`/`poiPrev()` sono pubblici ma solo via `@ViewChild` su un componente di libreria). Le
opzioni sono: duplicare la logica di `nextRelatedPoiId` nel contenitore (la duplicazione che il
ticket elimina), un `@ViewChild` da wm-webapp su un componente wm-core (accoppiamento nuovo), o
lasciare le frecce collegate a handler che — rimossi `next()`/`prev()` — diventano codice morto,
reintroducendo il difetto che il ticket cita come motivazione.
*Mitigazione:* da risolvere nel piano scegliendo esplicitamente una delle tre, non lasciandola
implicita. La via meno peggiore è probabilmente il dispatch diretto delle stesse azioni che il
navigator dispatcha, riusando i selettori esistenti senza reimplementarne la logica. `[da
verificare]` che `nextRelatedPoiId`/`prevRelatedPoiId` (`ec.selector.ts:267,278`) siano usabili
dall'esterno: fanno `relatedPois.findIndex(...)` mentre `currentEcRelatedPois` può restituire
`null`, quindi manca una guardia proprio nel percorso che questa fase rende raggiungibile.

**5. Il cleanup di `related_url` scompare.**
`poi-popup.component.ts:89-94` cancella la chiave `''` e forza `null` quando l'oggetto resta vuoto.
Il condiviso usa `showUsefulUrls$ = !!properties?.related_url`, e `!!{}` è `true`: comparirà il
blocco "Link utili" vuoto o con label vuota sui POI che il codice locale nascondeva. Nota
aggravante: la riga 91 fa `delete` **su un oggetto dello store**, quindi oggi quella
normalizzazione si propaga a tutti gli altri consumer; rimuovendola nessuno la fa più.
*Mitigazione:* requisito esplicito sopra. La correzione pulita è in wm-core
(`showUsefulUrls$` deve controllare le chiavi, non la sola presenza dell'oggetto), quindi va
coordinata; in alternativa il contenitore può normalizzare prima, ma su un oggetto dello store va
fatto senza mutarlo.

**6. `wm-tab-description`: timer orfano e stato di troncamento che non si resetta.**
`tab-description.component.ts` dichiara `implements AfterViewInit` e **non ha `ngOnDestroy`**.
`_checkIfContentIsTruncated()` (riga 97) avvia un `setInterval(..., 50)` che si azzera **solo** se
`scrollHeight > 0`. Nel popup web — dentro un `*ngIf`, con `transition: all 500ms` — è facile
distruggere il componente prima della misura: si ottiene un timer a 20 Hz che chiama
`getComputedStyle` (reflow forzato) **per ogni POI aperto**, in una sessione browser che non si
riavvia mai — a differenza dell'app mobile, e proprio nello scenario tablet/kiosk. Nessun errore in
console: il sintomo è "dopo un po' la mappa va a scatti".
Secondo problema indipendente: `showExpandButton$` e `isExpanded$` non vengono resettati dal setter
`description`, quindi cambiando POI sulla stessa istanza il POI B eredita il troncamento di A.
*Mitigazione:* è codice wm-core e il difetto esiste già su mobile, ma il web lo espone in modo
nuovo. Da segnalare come bug a sé; nel frattempo verificare in QA il cambio POI consecutivo.

**7. `sanitize()` non è cacheato.**
`poi-properties` chiama `sanitize(info|wmtrans)` direttamente in template: nuovo `SafeHtml` a ogni
change detection → `[innerHTML]` riscritto → eventuali iframe/embed nel blocco `info` si ricaricano.
Con `distanceFromCurrentPoi$` che emette durante gli spostamenti, il blocco può lampeggiare. Il
pattern corretto esiste nella stessa libreria (`ConfigDetailComponent._safeContentCache`).
*Mitigazione:* rilevante solo sui POI con `info` valorizzato — **zero nell'app 29**, quindi non
osservabile in questo QA. Da segnalare, non da risolvere qui.

**8. Il requisito di test è soddisfacibile in modo vacuo.**
Uno spec di wm-webapp che istanzia `<wm-poi-properties>` trascina `conf`, `GeolocationService`,
`DomSanitizer` e altro. Le uscite realistiche sono uno spec fragile accoppiato agli interni di
wm-core, oppure `NO_ERRORS_SCHEMA` — che rende l'assert su `<wm-poi-properties>` un assert su una
stringa, verde anche se il componente non è dichiarato da nessuna parte.
*Mitigazione:* requisito esplicito di non usare `NO_ERRORS_SCHEMA` per l'assert di instradamento;
usare uno stub dichiarato con lo stesso selettore, così l'assert verifica il ramo scelto senza
dipendere dagli interni di wm-core.

**9. Perimetro dei repo — aggiornato: quattro file di wm-core sono in scope.**
Il dev ha autorizzato le modifiche a wm-core sul branch condiviso, e l'agente su webmapp-app è
stato avvisato senza obiezioni. Sono quindi **in scope** quattro file, scelti perché sbloccano
requisiti di questo overview o stanno nel file che va comunque modificato:
`related-urls.component.ts` (rischio 10 + tre forme del campo), `feature-useful-urls.component.html`
e `poi-properties.component.ts` (rischio 5 → requisito 8), `tab-description.component.ts`
(rischio 6 → requisito 14), `ec.selector.ts` (guardia null sui selettori dei POI correlati).

**wm-types e map-core restano invariati.** In particolare `related_url` **non** viene tipizzato
come union (`string | string[] | Record<string, string>`): sarebbe corretto, ma tocca un tipo
condiviso col mobile per un beneficio che questo ticket non richiede — le tre forme sono gestite
nel componente, dove il fix serve comunque.

Restano fuori, come follow-up: F1 (split UGC), F3 (`startGetDirections$`, l'effect serve anche i
track), F5 (`sanitize()` non cacheato, zero POI con `info` sull'app 29), F6 (regole di
posizionamento in libreria, sovrascritte da entrambi i consumer), F7 (hack `JSON.stringify`).

**Vincolo operativo scoperto:** wm-core ha **due checkout indipendenti** dello stesso branch — uno
per repo consumer. I working tree non si vedono tra loro, quindi il coordinamento serve su **push e
pull**, non sui file locali.

**10. `wm-related-urls` forza `http://` a `https://` e impedisce di aprire in nuova scheda.**
Usa `href="#"` + `window.open()` e applica `url.replace(/^https?:\/\//,'')` riprefissando `https://`.
Misurato su `db_prod`: **1.013 POI su 12.644 con `related_url`** (8% della base, 3,7% dei 27.486
totali) e **1.127 EcTrack su 29.226** (3,9%) hanno almeno un URL `http://` puro.
*Mitigazione:* per decisione del dev il fix entra in oc:8406 lato wm-core, ma **come ultimo task**.
Attenzione: il merge di wm-webapp e il bump del pin di wm-core sono **due atti separati**, quindi la
garanzia "stesso ticket" non basta — si può mergiare la fase C con un pin che non contiene il fix.
Il ramo UGC del popup continua a usare `webmapp-related-urls`, quindi il componente locale **resta
nel repo**: se il fix slitta, il ramo EC può usarlo come ponte a costo zero.

**11. Due fonti di verità tra contenitore e corpo.**
Il contenitore riceve `[poi]` dal selettore `poi` (`features.selector.ts:61`); il corpo legge
`currentPoiProperties` (`ec.selector.ts:221`), che contiene l'hack
`if (JSON.stringify(props) === JSON.stringify({related: false})) props = null`. Nello stato in cui
i properties valgono esattamente `{related: false}`, il figlio riceve `null` e il contenitore no:
chrome renderizzato e **corpo vuoto**, senza stato di caricamento. L'hack è inoltre sensibile
all'ordine delle chiavi, quindi è fragile a prescindere.
*Mitigazione:* `[da verificare]` in QA quanto sia raggiungibile quello stato — da dati misurati
`related` è `false` su **tutti** i 3.721 POI dell'app 29, quindi il ramo va esercitato
deliberatamente. La correzione dell'hack è in wm-core (follow-up F7).

## Out of scope

- **Il ramo UGC** e tutto ciò che ne dipende (`wm-ugc-poi-properties`, `wm-image-picker`, la
  conferma su `deleteUgcMedia`, l'`@Output` per `stopDrawUgcPoi`, il suo scss globale). Ticket
  successivo.
- **Migrazione dell'e2e Cypress a fixture + `cy.intercept()`** — è oc:8022. Qui si conserva solo
  `.webmapp-poi-popup-title` per non romperla.
- **Fallback `taxonomy.poi_type` singolare**: rimosso consapevolmente. Il backend lo espone
  marcandolo deprecato (`geohub/app/Models/EcPoi.php:304`) — `[da verificare]` di persona, questa
  informazione arriva dall'agente su webmapp-app e non l'ho controllata sul repo geohub.
- **`feature_image` nella galleria**: la condizione attuale del web è già inefficace
  (`wm-tab-image-gallery` ha una guardia interna su `imageGallery?.length`).
- **Etichette di `related_url` che coincidono con l'URL** (su alcuni POI la chiave è l'URL stesso).
- **Pulizia del codice morto** in `poi-popup.component.ts` (`defaultPhotoPath`, `slideOptions`,
  `@ViewChild('gallery')`, `medias$`, `isEnd$`): conseguenza della riscrittura, non obiettivo.
- **Correzione dell'hack `JSON.stringify({related: false})`** in `ec.selector.ts:221` (vedi
  rischio 11): è in wm-core, tracciato come follow-up F7.

## Limiti noti del QA

Verificato sul geojson servito dell'app 29 (3.721 POI): **`config_detail` è assente su tutti**, così
come `taxonomy_where`, `osm_url`, `audio`, `info`, `embedded_html`, `form`. `config_detail` non è
nemmeno una colonna del db — è risolto dal backend — e non compare nell'API del POI né nelle config
delle app 11/15/5/33 provate.

**Conseguenza da dichiarare, non da nascondere:** il requisito "il web acquisisce
`wm-config-detail`" **non è dimostrabile con dati reali** in questo QA. La verifica resta
strutturale (binding presente) più dati mock nello spec. Chiudere il ticket dichiarando risolto il
gap di oc:8181 senza averlo visto funzionare una volta è un rischio da mettere a verbale.

Set di QA (app 29, shard `geohub`):

| POI | Copre |
|---|---|
| 42535 Rifugio Telegrafo | 3 telefoni veri + etichette, `addr_complete` = `,,` (non deve comparire), 8 immagini |
| 42533 Madonna della Corona | 1 numero + 2 etichette vuote, virgole ai bordi, 13 immagini, descrizione lunga |
| 42417 Pizzighettone | 2 `related_url` con etichette leggibili, virgola finale nell'indirizzo |
| 53037 Pro Loco Cassano | `related_url` in `http://` puro (rischio 10) |
| 97598 Municipio di Lecco | il caso originale delle etichette telefono |
| **12842 / 16570 / 5314** | **`ele` valorizzato** (524 / 124 / 1395) — necessari per `wm-tab-detail`, che **nessuno dei 5 POI sopra attiva** |
| **un track con `related_pois`** | **necessario per `wm-related-pois-navigator`**: i POI aperti diretti hanno `related: false` |

## Moduli toccati

Tutti in **`wm-webapp`**. Nessuna scrittura su wm-core o wm-types.

| File | Modifica |
|---|---|
| `src/app/components/poi-popup/poi-popup.component.html` | Ramo EC sostituito da `<wm-poi-properties>`; ramo UGC invariato; chrome conservato |
| `src/app/components/poi-popup/poi-popup.component.ts` | Rimozione della normalizzazione indirizzo e del codice morto; conservazione di `startDraw`/`stopDraw`, scorciatoie, `openGeohub` |
| `src/app/components/poi-popup/poi-popup.component.scss` | Rimozione delle regole per il markup eliminato; override degli stili di posizionamento del condiviso |
| `src/app/components/poi-popup/poi-popup.component.spec.ts` | **Nuovo**: instradamento EC/UGC |
| `src/app/pages/map/map.page.ts` | Rimozione di `next()`/`prev()` vuoti |
| `src/app/pages/map/map.page.html` | Aggiornamento dei binding del popup |
| `angular.json` | Registrazione di `src/app/components` in `test.options.include` |
| `tsconfig.spec.json` | Registrazione di `src/app/components/**/*.spec.ts` in `include` |
| `src/app/shared/{wm-core,wm-types,map-core}` (gitlink) | Bump dei pin |
| `src/environments/environment.ts` | Modifica **temporanea** per il QA, da ripristinare a `appId: 1` + `camminiditalia` |

Restano nel repo, perché il ramo UGC li usa ancora: `webmapp-related-urls`,
`src/app/pipes/webmapp-to-array.pipe.ts` `[da verificare]` se ha altri consumer.

## Aggiunto dopo il test manuale (15 settembre)

Emerso provando il risultato nel browser, non previsto nel piano iniziale:

| Cosa | Dove |
|---|---|
| `wm-image-detail` non si apriva sulla webapp da telefono: la condizione era su `isMobile` (user agent) invece che su `isAppMobile` (app nativa) | wm-core, `image-gallery.component.ts` |
| Le foto verticali venivano ritagliate nel modale: `object-fit: cover` di `wm-img` in un contenitore quadrato (700×700 sopra i 768px) | wm-core, `image-detail.component.scss` |
| La label della categoria era stata rimossa per errore dal ramo EC — è un elemento distinto da `wm-poi-types-badges`, e il pannello mobile ha entrambi | wm-webapp, template del popup |

**Il fallback su `taxonomy.poi_type` singolare è stato mantenuto**, contrariamente a quanto
deciso in fase di piano: il backend lo marca deprecato ma continua a popolarlo, ed è di fatto
l'unico ramo che il mobile raggiunge, per via di un typo nel suo template (`taxonom` senza `y`).

## Deciso di rinviare

- **Verifica di `wm-config-detail`**: si farà **per ultima**, collegando l'app a uno shard che
  serva davvero `config_detail` dal backend. Sull'app usata finora il campo è assente su tutti i
  POI, quindi la feature che ha originato il ticket non è osservabile lì.
- **Label con la taxonomy `where` sopra il titolo**, al posto del `poi_type`, dentro il componente
  condiviso. Restano tre decisioni aperte: quale livello mostrare (`taxonomyWheres` vale ad es.
  `["Veneto", "Verona", "Brenzone sul Garda"]`), se spostare in wm-core anche il **titolo** — cosa
  che toccherebbe l'header del pannello mobile, dove convive con `wm-related-pois-navigator` — e
  se tipizzare `taxonomyWheres` in wm-types, oggi coperto solo dall'index signature.

## Risolti in questo ticket (erano follow-up)

| # | Cosa | Task |
|---|---|---|
| F2 | `wm-tab-description`: `setInterval` senza `ngOnDestroy`, stato di troncamento non resettato al cambio POI (si vede **anche sul mobile**) | 9 |
| F4 | "Link utili" compariva col solo titolo: `!!related_url` è `true` anche per `[]` — **2.572 POI e 2.796 track** | 8 |
| F8 | `nextRelatedPoiId`/`prevRelatedPoiId` senza guardia su `currentEcRelatedPois` null, mentre i selettori vicini alle righe 197 e 253 ce l'hanno | 7 |
| F9 | `related_url` in tre forme: `\|keyvalue` su una stringa itera i caratteri (76 POI sull'app 29) | 10 |
| — | `wm-related-urls` forzava `http://` a `https://` e impediva di aprire in nuova scheda (**1.013 POI, 1.127 track**) | 10 |

## Follow-up da aprire (bug reali, non risolti qui)

| # | Cosa | Dove | Perché non ora |
|---|---|---|---|
| F1 | Split del ramo UGC: header condizionale, conferma su `deleteUgcMedia`, `@Output` per `stopDrawUgcPoi`, scss globale con selettore di id | wm-core + wm-webapp | Fuori scope per decisione del dev; due dei quattro difetti sono irreversibili lato dati |
| F3 | `startGetDirections$`: `withLatestFrom` su `onLocationChange$` blocca l'effect senza GPS | wm-core | L'effect serve anche i track: blast radius oltre il ticket, nessun requisito lo richiede |
| F5 | `sanitize()` non cacheato in `poi-properties` | wm-core | Rilevante solo sui POI con `info`: **zero** sull'app 29 |
| F6 | Regole di posizionamento dentro i componenti di libreria, sovrascritte da entrambi i consumer (include `height: 50%` morto alla riga 5) | wm-core | Toccarle impatta il consumer mobile; l'override locale è a rischio zero |
| F7 | Hack `JSON.stringify({related: false})` sensibile all'ordine delle chiavi | wm-core | Fragile, ma non blocca nulla adesso |
| F10 | Tipizzare `related_url` come union in `wm-types` (`string \| string[] \| Record<string, string>`): oggi passa dall'index signature `[key: string]: any` | wm-types | Tocca un tipo condiviso col mobile per un beneficio che il ticket non richiede. Il caso più frequente da coprire è `[]` (2.572 POI), non la stringa |
