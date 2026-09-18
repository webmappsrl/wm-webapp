> Ticket: oc:8406

# Notes — Dettaglio EcPoi unificato in wm-webapp (fase C)

Stato al 17 settembre: **task 1-5, 7-10 e 12 eseguiti e committati**, più le correzioni emerse dal
test manuale del dev, le due decisioni dello scrum recepite in ritardo e i tre difetti trovati dalla
review. Restano il ripristino di `environment.ts` (ora punta all'app in prova) e il push, che va
coordinato con l'agente su webmapp-app.

Esito test: **wm-webapp 5/5**, **wm-core 315/315** (288 di baseline, 1 arrivato con develop, il
resto aggiunti da questo ticket). Nessuno spec preesistente è caduto, quindi non è stato necessario
indebolire alcun test. Build di produzione verde.

Branch riallineati: wm-webapp e wm-core su `develop`, wm-types su `main` (non ha `develop`).

## Cronologia

| Momento | Quando | Fonte |
|---|---|---|
| Ticket creato | 25 agosto, 15:29 | `created_at` su Orchestrator |
| Inizio lavori | **3 settembre, 10:50** | `planning_start_at` registrato in `Fase: ticket` |
| Fase A committata (wm-core, wm-types) | 3 settembre, 15:44-15:45 | data autore dei commit, preservata dal rebase |
| Branch creato in wm-webapp | 3 settembre, 15:57 | reflog |
| **Stop dei lavori** | **3 settembre, ~16:00** | ultima voce di reflog prima del salto |
| Ripresa | **15 settembre, 12:15** | primo commit del secondo giorno |

Dodici giorni di fermo, durante i quali il lavoro è rimasto interamente nel working tree.

## Deviazioni dal piano

- **`angular.json` riscritto con `json.dumps` e ripristinato.** Il primo tentativo di aggiungere
  `src/app/components` all'`include` ha usato `json.dumps`, che ha riformattato gli array inline
  (`["a", "b"]` → multilinea) producendo **11 righe di diff non richieste** in punti non
  pertinenti (`styles`, `scripts` della build). Ripristinato con `git checkout` e rifatto con un
  edit puntuale: il diff finale è di **2 righe**. Lezione: su file di configurazione formattati a
  mano, un round-trip attraverso un parser JSON non è una modifica chirurgica.

- **`initialState` del MockStore ampliato oltre quanto previsto dal piano.** Con `conf: {}` lo spec
  passava ma NgRx logga `TypeError: Cannot read properties of undefined (reading
  'editing_inline_show')`: `confShowEditingInline` (`conf.selector.ts:109`) fa
  `state.editing_inline_show` su `confWEBAPP` senza null-safety, e `confPOIFORMS` fa
  `app.poi_acquisition_form` su `confAPP`. Corretto in `conf: {APP: {}, WEBAPP: {}}`. Il rumore non
  faceva fallire nulla, ma avrebbe nascosto errori veri nelle esecuzioni successive.

- **Task 5 anticipato prima della verifica di compilazione del Task 2.** Il template smette di
  esporre `prevEVT`/`nextEVT` mentre `map.page.html` li bindava ancora: eseguire i task nell'ordine
  scritto avrebbe lasciato l'albero non compilabile tra il 2 e il 5. Il piano stesso segnalava la
  possibilità di anticipare.

- **L'import di `OnDestroy` in `tab-description` non è stato applicato dallo script**, perché
  l'import da `@angular/core` in quel file è multilinea e il pattern cercava la forma compatta.
  Aggiunto a mano. `ngOnDestroy` era già stato inserito, quindi senza questo passaggio il file non
  avrebbe compilato.

## Decisioni

- **Scope ridotto ai soli POI EC (decisione del dev, dopo la challenge).** L'intenzione iniziale
  era lo split completo EC/UGC con instradamento su `wm-ugc-poi-properties`. La challenge
  adversariale ha fatto emergere quattro problemi concentrati sul ramo UGC, due irreversibili lato
  dati: header/close/edit duplicati (`ugc-poi-properties.component.html:3-12` porta un proprio
  `ion-header`), un secondo scss globale con selettore di id e `calc(100% - 56px)`,
  `deleteUgcMedia` dispatchato senza conferma (`image-picker.component.ts:88-91`), e
  `stopDrawUgcPoi` non ricollegato dopo il save. Poiché il gap che ha originato il ticket
  (`wm-config-detail`, oc:8181) riguarda solo i POI EC, limitarsi agli EC lo chiude interamente
  con rischio dati nullo e senza dipendenze da wm-core. Split UGC → ticket successivo (F1).

- **Override degli stili nel solo repo wm-webapp, nessuna modifica a wm-core.** Il componente
  condiviso dichiara globalmente il posizionamento del pannello mobile
  (`poi-properties.component.scss:1-10`, `ViewEncapsulation.None`). Prima di chiedere una modifica
  in libreria ho controllato il consumer mobile e ho trovato che **fa già la stessa
  neutralizzazione** (`webmapp-app/core/src/app/pages/map/map-details/map-details.component.scss:127-129`
  → `wm-poi-properties { position: relative; }`, con lo scroll gestito dal contenitore via
  `overflow-y: auto`). Quindi quelle regole in libreria sono già residuo: entrambi i consumer le
  sovrascrivono. Effetto collaterale utile: la fase C non ha più dipendenze da wm-core per il
  layout, quindi non è vincolata all'ordine di merge.

- **Categoria nel chrome solo per il ramo UGC.** Sul ramo EC la categoria arriva dal corpo
  condiviso via `wm-poi-types-badges`: tenerla anche nel chrome la mostrerebbe due volte. È anche
  il comportamento mobile (header col solo nome, badge nel corpo). Deviazione consapevole dal
  requisito 3 dell'overview, che elencava la categoria tra gli elementi del chrome senza
  distinguere i due rami.

- **Scorciatoie da tastiera: dispatch diretto del selettore, non `@ViewChild` sul navigator.**
  `WmRelatedPoisNavigatorComponent.poiNext()` non dispatcha azioni NgRx: legge
  `nextRelatedPoiId$` e chiama `UrlHandlerService.updateURL({ec_related_poi: id})`. La logica di
  "quale è il prossimo" vive nel **selettore**, quindi il contenitore lo riusa invece di
  reimplementarlo — evitando sia la duplicazione sia un `@ViewChild` da wm-webapp su un componente
  di libreria.

- **Fix di `wm-related-urls` rinviato all'ultimo task, ma dentro oc:8406** (decisione del dev):
  prima far funzionare la visualizzazione del dettaglio. La garanzia "stesso ticket, non può
  sfuggire al merge" che avevo dato al peer **era sbagliata** — il merge di wm-webapp e il bump del
  pin di wm-core sono atti separati, quindi si può mergiare la fase C con un pin privo del fix. Il
  rischio è però annullato dal fatto che il ramo UGC resta nel popup: `webmapp-related-urls` non
  viene rimosso dal repo e può fare da ponte a costo zero.

- **Stima 12h per la fase C, 16.5h sul ticket** (4.5 delle fasi A+B). Le 11.00h che erano su
  Orchestrator provenivano da una sessione diversa, di cui nessuno ha la scomposizione, e sono
  state calcolate su uno scope cambiato due volte dopo. Scritto solo `estimated_hours`, nessuna
  nota di sviluppo, su richiesta del dev.

## Correzioni dopo il test manuale (15 settembre)

- **La label della categoria era sparita dal ramo EC, ed era un mio errore.** L'avevo rimossa
  assumendo che `wm-poi-types-badges` la sostituisse: sono invece **due elementi distinti** — la
  label sopra il titolo e il chip con icona nel corpo — e il pannello mobile li ha **entrambi**.
  La label vive nel chrome del contenitore anche lì
  (`webmapp-app/core/src/app/pages/map/map.page.html:14-26`). Ripristinata per entrambi i rami.

- **Il fallback su `taxonomy.poi_type` singolare serve davvero**, contrariamente a quanto avevamo
  concluso. Il backend lo marca `// deprecated` (`geohub/app/Models/EcPoi.php:304`) ma continua a
  popolarlo: sul POI 42535 vale `{id: 15, name: {it: "Rifugio"}}`. Ed è di fatto **l'unico ramo
  che il mobile raggiunge**, per via del typo qui sotto.

- **Typo trovato nel repo mobile**: `map.page.html:14` legge `properties?.taxonom?.poi_types` —
  manca la `y`. È l'unica occorrenza in quel repo, quindi il ramo plurale non matcha mai e la
  label arriva sempre dal fallback singolare. Segnalato all'agente su webmapp-app, non corretto da
  qui.

- **`wm-image-detail` non si apriva sulla webapp da telefono.** `image-gallery.component.ts`
  apriva il modale solo `if (!isMobile)`, e `isMobile` è `Platform.is('android') || is('ios')`,
  cioè **user agent**: era vero anche per la webapp aperta da telefono o tablet, che però non ha
  la vista inline (quella la monta il pannello dell'app). Lì il tap su una foto non apriva nulla e
  cambiava solo l'URL. Cambiato in `isAppMobile` (`isMobile && !isBrowser`, cioè "dentro l'app
  nativa") su richiesta esplicita del dev: comportamento identico su ogni browser.

- **Le foto verticali venivano ritagliate nel modale del dettaglio.** Causa: `wm-img` applica
  `object-fit: cover` (`img.component.scss`), corretto per card e box ma sbagliato nel dettaglio.
  Non era una divergenza di codice fra le piattaforme, ma **lo stesso CSS in contenitori di forma
  diversa**: il modale è fullscreen sotto i 768px e **quadrato 700×700** sopra
  (`modal-image.component.scss`), quindi il ritaglio si vedeva solo su desktop. Corretto con
  `object-fit: contain` **solo dentro `image-detail.component.scss`** — `wm-img` non è stato
  toccato perché almeno 8 componenti (`layer-box`, `home-layer`, `slug-box`, `search-box`…) si
  aspettano `cover`.

## Bug trovati

Tutti in fase di pianificazione, nessuno introdotto da questo lavoro.

### Nel web attuale — la fase C li elimina

- **Una graffa in eccesso nell'URL di Google Maps.** `poi-popup.component.html:82` ha `{{...}}}`:
  due graffe per l'interpolazione più una letterale. Verificato nel DOM renderizzato:
  `daddr=,,}&navigate=yes`. Riguarda **tutti** i link Maps del popup.
- **Indirizzo spazzatura mostrato e reso cliccabile.** POI 42535 mostra `,,` (con link a Maps),
  42533 `,37013 Caprino Veronese VR,`, 42417 con virgola finale.
- **Navigazione POI correlati inerte.** `map.page.ts:65` è `next(): void {}` e `:81`
  `prev(): void {}` — corpi vuoti. I pulsanti si mostravano quando `poiProperties.related` era
  valorizzato e non facevano nulla.
- **Codice morto** in `poi-popup.component.ts`: `defaultPhotoPath`, `slideOptions`,
  `@ViewChild('gallery')`, `medias$`, `isEnd$` — zero occorrenze nel template.

### Trovati nel piano stesso, corretti prima dell'esecuzione

- **Le scorciatoie da tastiera avrebbero lanciato `TypeError`.** `nextRelatedPoiId`/
  `prevRelatedPoiId` (`ec.selector.ts:267,278`) chiamano `findIndex` su `currentEcRelatedPois`, che
  restituisce `?? null` (riga 190), **senza guardia** — a differenza dei selettori vicini alle
  righe 197 e 253, che ce l'hanno. Il navigator non esplode perché i suoi pulsanti sono dentro un
  doppio `*ngIf` su `currentRelatedPoisCount`, ma le scorciatoie sono `@HostListener` su
  `document`, quindi globali: una freccia premuta su un POI aperto diretto avrebbe letto un
  selettore che lancia. Il piano aggiunge un gate su `currentRelatedPoisCount` (null-safe, `?? 0`).
  Follow-up F8 per la guardia mancante in libreria.
- **`hasRelatedUrls` funzionava per caso su 76 POI.** `related_url` arriva in tre forme: 752
  oggetti, **76 stringhe** (URL nudo), 3 array sull'app 29. `Object.entries` su una stringa produce
  coppie indice/carattere e avrebbe restituito `true` accidentalmente. Il piano distingue le tre
  forme esplicitamente. Follow-up F9 per il fatto che sia `wm-related-urls` sia
  `webmapp-related-urls` fanno `|keyvalue` su un campo che può essere una stringa — comportamento
  indefinito **già oggi**, su entrambe le piattaforme.

## Riallineamento dei branch su develop (15 settembre)

Il lavoro era partito da `RDO_ass_cammini_italia_2026_2` perché `wm-config-detail` (oc:8181)
esisteva **solo lì**. Quella ragione è decaduta: l'**8 settembre** RDO è stato mergiato nelle basi
— `bb0fe549` su wm-core (#194), `d0feec6` su wm-types (#24) — quindi il dev ha deciso di
riallineare prima di aprire la PR.

**Il rebase normale fallisce, e non per caso.** `git rebase origin/develop` su wm-types è andato
in conflitto su oc:8177 ed è stato abortito. Causa: i branch risultano molti commit "avanti", ma
il contenuto di quasi tutti è **già nelle basi**, arrivato via **squash merge** — un solo parent,
SHA diversi. Git non lo sa e prova a riapplicarli uno a uno, andando in conflitto su codice che
esiste già.

La forma che funziona è `git rebase --onto <base> <parent-del-primo-commit-nostro>`, che riapplica
**solo i commit propri**:

| Repo | Base | Rebase normale | Con `--onto` | Esito |
|---|---|---|---|---|
| wm-types | `main` (non ha `develop`) | 9 commit | **1** | zero conflitti |
| wm-core | `develop` | 21 commit | **2** | zero conflitti |
| wm-webapp | `develop` | 5 commit | **1** | zero conflitti |

Prima di iniziare sono stati creati branch `backup/pre-rebase-8406` nei tre repo; l'abort su
wm-types ha ripristinato uno stato identico al backup, verificato per SHA.

**Conseguenza per l'altro agente:** il commit della fase A ha cambiato SHA (`5190949` →
`b4827f6`), contenuto identico e author date preservata. Il suo checkout di wm-core resta
divergente finché non fa `fetch` e si riallinea — comunicato.

**`map-core` riallineato a develop.** Il suo gitlink puntava a `7b12c59` (`fix(oc:8399)`, dal
branch RDO), un bump estraneo a questo ticket che era nel working tree da prima. Verificato che
develop contiene già quel fix come `b7e7c11`, quindi allinearlo a `86ebcec0` non perde nulla.

## Un errore da non ripetere: i gitlink non si committano dal padre

Nel primo giro di commit avevo fatto `git add src/app/shared/{wm-core,wm-types,map-core}` e
committato il bump dei pin insieme al resto, creando `chore(oc:8406): bump dei pin`. **Sbagliato
due volte:**

1. L'istruzione era «commit dei **soli file in staging**», e i gitlink **non erano in staging** —
   erano stati lasciati fuori deliberatamente, insieme a `environment.ts`. Li ho aggiunti io.
2. Mentre si lavora, i submodule si spostano **dai rispettivi repo**, non dal padre: un bump
   committato sul branch prima che i submodule siano pushati produce gitlink che puntano a commit
   che per chiunque altro non esistono.

Il commit è stato annullato con `git reset --soft HEAD~1` + `git restore --staged`. Il bump va
fatto **alla fine**, dopo il push dei submodule.

### Nell'analisi, non nel codice — miei errori

- **Ho segnalato al peer un'incoerenza in `environment.ts` che non esiste.** Avevo letto
  `appId: 1` + `shardName: 'camminiditalia'` e concluso "incoerente, l'app 1 è Parco Maremma e
  Cammini di Italia è la 11", confrontando un `appId` dello shard `camminiditalia` con la tabella
  `apps` del db `geohub`: **shard diversi hanno numerazioni indipendenti**. Verificato:
  `camminiditalia/1/config.json` → `name: "Cammini di Italia"`. Ritirato con il peer, nessun
  ticket di pulizia aperto. Regola che ne ricavo: incrociare un id applicativo con una tabella del
  db richiede prima di verificare che siano dello stesso shard.
- **Un rischio dell'overview descriveva codice inesistente.** Avevo scritto che
  `showTechnicalDetails$` si sarebbe attivato "ora che `address` è popolato": nel commit di fase A
  è `!!properties?.ele` (solo la quota), e `technicalProperties$` rimuove deliberatamente
  l'address. Corretto dopo la challenge, che l'ha usato come prova che le affermazioni del
  documento non erano state riverificate contro il commit reale. Da qui la convenzione, ora in
  testa all'overview, di marcare `[da verificare]` ciò che è assunto.

## Follow-up

Gli otto follow-up F1–F8 sono elencati nell'overview, più F9 aggiunto in fase di piano. Quelli con
impatto su dati utente, da guardare per primi:

- **F1** — `deleteUgcMedia` senza conferma: un click cancella una foto in modo irreversibile, in un
  pannello che a 1024px di viewport è larga ~205px. Il difetto esiste **già oggi sul mobile**.
- **F1** — `stopDrawUgcPoi` non dispatchato da `UgcPoiPropertiesComponent.updatePoi()`: se lo split
  UGC verrà fatto senza ricollegarlo, dopo un salvataggio il POI resta agganciato al draw e la
  geometria alterata raggiunge il backend.

Non di dati ma insidiosi:

- **F2** — `wm-tab-description` ha `setInterval(…, 50)` senza `ngOnDestroy`, che si azzera solo se
  `scrollHeight > 0`: timer a 20 Hz con `getComputedStyle` per ogni POI aperto, in una sessione
  browser che non si riavvia mai (tablet/kiosk). Non produce nessun errore in console: il sintomo è
  "dopo un po' la mappa va a scatti". In più `showExpandButton$`/`isExpanded$` non si resettano nel
  setter, quindi cambiando POI il successivo eredita il troncamento del precedente — questo si vede
  **anche sul mobile**.
- **F3** — `startGetDirections$` usa `withLatestFrom` su `onLocationChange$`, un `ReplaySubject`
  senza valore iniziale: senza GPS attivo l'effect non emette e il pulsante non fa nulla, senza
  errore. Da confermare in QA.

## Verifiche visive fatte in esecuzione

Screenshot headless a 1920px e 1024px sul POI 42535, letti e confrontati:

- **Il rischio 1 era reale e l'override lo risolve.** Senza di esso il corpo condiviso si
  stenderebbe su tutta l'area del popup a `z-index: 2` coprendo titolo e navigatore. Negli
  screenshot il titolo "Rifugio Telegrafo Gaetano Barana" è visibile e sopra il corpo a entrambe le
  larghezze — su due righe a 1024px.
- **Nessuno scroll orizzontale a ~205px** (requisito 13): telefoni, email e URL vanno a capo
  invece di sfondare. Non è stato necessario impilare le righe di `wm-tab-detail`, che su quel POI
  non compare (nessun `ele`).
- **I fix di fase A si vedono**: il gruppo "Contatti" mostra i tre telefoni **senza** le etichette
  `Fixed Phone:`/`Cell Phone:`/`Other Phone:` del backend, e l'indirizzo `,,` **non compare**
  (confermato anche sul DOM: zero occorrenze di `daddr=%2C%2C`).
- Nota estetica non bloccante, già dichiarata out of scope: sul POI 42535 la chiave di
  `related_url` **è** l'URL, quindi in "Link utili" a 205px il link va a capo in modo brutto
  (`https://www.eq` / `uipenatura.it/ri` / …). Non è rotto, è solo povero.

## Limite dell'ambiente headless, scoperto in esecuzione

**Tre dei cinque POI del set di QA non aprono il popup in Chrome headless**: 53037, 97598 e 42417
danno zero occorrenze di `webmapp-poi-popup` nel DOM, mentre 42535 e 42533 funzionano
(22 occorrenze, titolo corretto). Verificato che **non è una regressione**: i due che funzionano
mostrano tutti i fix, e le API `ec/poi/<id>` rispondono 200 per tutti e cinque; tutti e cinque sono
presenti in `pois/29.geojson`. Nemmeno un `--virtual-time-budget` di 90 secondi cambia l'esito, e i
`taxonomyIdentifiers` non spiegano la differenza (7 per quattro POI su cinque).

**Conseguenza concreta:** il POI **53037** è quello che serve per verificare end-to-end il fix
`http://` di `wm-related-urls`, e in headless non è verificabile. Il fix è coperto dai 9 spec di
`normalizeRelatedUrls`, ma la verifica sul dato reale resta da fare **in un browser vero** durante
il test manuale. Da segnalare al dev, non da dare per fatto.

Riprovato dopo un riavvio del dev server: stesso esito. 42535 e 42533 si aprono, gli altri tre no.
Non è quindi uno stato sporco del server.

## Da verificare a mano: i link di "Link utili" sono cliccabili?

Sul POI 42535 il blocco renderizzato è:

```html
<ion-item target="_blank" rel="noopener noreferrer" role="listitem">
  <i slot="start" class="icon-outline-globe"></i>
  <ion-label>https://www.equipenatura.it/rifugio-telegrafo-…</ion-label>
</ion-item>
```

`target` e `rel` ci sono, quindi il template nuovo è attivo, ma **l'attributo `href` non compare
nel DOM**. La spiegazione probabile è benigna — `ion-item` con `[href]` genera l'`<a
class="item-native">` nello **shadow DOM**, che `--dump-dom` non include, ed è lo stesso pattern di
`wm-address` già in produzione sul mobile dalla fase A.

**Ma non è dimostrato:** su questa macchina manca un driver JS (patchright non installato, la skill
`browser-automation` non parte), quindi non è stato possibile leggere né lo shadow DOM né la
property. I 9 spec coprono `normalizeRelatedUrls`, cioè la logica di normalizzazione, non il
rendering di Ionic.

Se i link non fossero cliccabili sarebbe una **regressione** rispetto al vecchio `window.open`, che
era scomodo ma funzionante. Va verificato nel test manuale prima del merge.

`config_detail` è **assente su tutti** i 3.721 POI dell'app 29, e non è nemmeno una colonna del db
(è risolto dal backend); non compare nell'API del POI né nelle config delle app 11/15/5/33 provate.
Quindi `wm-config-detail` — **il gap che ha originato questo ticket** — non è dimostrabile con dati
reali su questo ambiente. La verifica resta strutturale più dati mock.

Chiudere oc:8406 dichiarando risolto il gap di oc:8181 senza averlo visto funzionare una volta è un
rischio: se esiste un'app con `config_detail` attivo sui POI, il QA va fatto lì. Domanda girata
all'agente su webmapp-app, in attesa di risposta.

Altri campi assenti sull'app 29, quindi non verificabili: `taxonomy_where`, `osm_url`, `audio`,
`info`, `embedded_html`, `form`. E nessuno dei 5 POI del set di QA ha `ele`, quindi `wm-tab-detail`
non compare mai su quel set — servono 12842, 16570 o 5314.

## Seconda tornata di correzioni, dal test manuale del dev (15 settembre)

- **Il primary del tema non arrivava ai componenti Ionic.** Le icone di Contatti e Link utili
  restavano blu mentre la label della località seguiva il brand: le prime leggono
  `--ion-color-primary`, la seconda `--wm-color-primary`. `variables.scss` deriva la prima dalla
  seconda, ma `@ionic/angular/css/core.css` dichiara le proprie `--ion-color-*` su `:root` con la
  stessa specificità ed è importato dopo, quindi vinceva Ionic. **La mobile non aveva il problema
  perché ri-importa `variables.scss` in fondo al proprio `global.scss`**, dopo il core: stessa
  soluzione applicata qui. Le `--ion-*` non sono impostabili a runtime — `_setGlobalCSS` applica
  solo le 78 variabili `--wm-*` — quindi l'ordine di import è l'unico punto in cui intervenire.

- **Intestazione spostata nel componente condiviso.** Località, nome e
  `wm-related-pois-navigator` erano markup duplicato qui e nell'header del pannello mobile, con
  rese divergenti: la mobile usa `var(--wm-font-lg)` e `var(--wm-font-weight-bold)`, il popup
  aveva `20px` e `700` fissi. Ha vinto la resa della mobile perché segue la scala tipografica
  per-istanza. Il pulsante di chiusura resta ai contenitori: lì la semantica differisce davvero —
  il pannello chiude il dettaglio, il popup azzera anche `ec_related_poi`.

- **Sopra il nome ora c'è il comune, non più la categoria.** Richiesta del dev. La sorgente è
  `taxonomyWheres` e non `taxonomy_where`: quest'ultimo — il campo tipizzato che `wm-txn-where`
  consuma — è vuoto su tutti i POI delle app verificate (0 su 3.252 dell'app 33, 0 su 3.721
  dell'app 29), mentre `taxonomyWheres` è popolato su 3.251 e 3.203. È un array ordinato regione →
  provincia → comune, verificato su cinque POI, quindi si prende l'ultimo elemento.
  **Conseguenza da tenere presente:** anche la sezione "Dove" di `wm-txn-where` non renderizza mai
  nulla su queste app, per lo stesso motivo. Non toccata in questo giro.

- **`wm-image-detail` non si apriva sulla webapp da telefono.** La condizione era su `isMobile`
  (`Platform.is('android') || is('ios')`, cioè user agent), vera anche per la webapp aperta da un
  telefono, che però non monta la vista inline. Cambiata in `isAppMobile` (`isMobile &&
  !isBrowser`, cioè dentro l'app nativa). Nota emersa indagando: `wm-image-detail` **era già usato
  su entrambe le piattaforme** — sul web dentro `ModalImageComponent`, nell'app inline — quindi
  non era un componente mancante ma un contenitore non raggiungibile.

- **Foto verticali ritagliate nel modale.** `wm-img` applica `object-fit: cover`, corretto per card
  e box. Non era una divergenza fra piattaforme: `ModalImageComponent` è unico, ma è fullscreen
  sotto i 768px e **quadrato 700×700** sopra, e `cover` in un quadrato taglia una foto verticale.
  Corretto con `contain` nel solo `image-detail.component.scss`; `wm-img` non toccato perché almeno
  otto componenti dipendono da `cover`.

## Divergenze dal piano, task per task

### Task 2 — chrome del popup

Il piano prevedeva che titolo e categoria restassero nel contenitore su entrambe le piattaforme,
seguendo quanto stabilito dall'agente su webmapp-app. Il dev ha ribaltato la decisione dopo il test
manuale: l'intestazione è stata spostata in `wm-poi-properties` e rimossa da entrambi i contenitori.
La categoria è stata inoltre sostituita dal comune. Il ramo UGC conserva il proprio titolo perché
non passa dal componente condiviso.

### Task 7-10 — scope allargato a wm-core

Il piano dichiarava «nessuna scrittura su wm-core». Il dev ha autorizzato le modifiche al repo
condiviso in corso d'opera, prima per quattro follow-up (F2, F4, F8, F9) e poi per l'intestazione,
il fix di `isAppMobile` e quello di `object-fit`. Il perimetro finale è di 23 file in wm-core —
il piano ne prevedeva cinque, e di quei cinque `feature-useful-urls.component.html` non è mai stato
toccato perché il dettaglio POI ha smesso di montarlo.

### Task 7-10 — due decisioni dello scrum recepite in ritardo

Rilette le trascrizioni a lavoro quasi finito, la call del **04/09/2026** conteneva due decisioni
sul dettaglio del POI che non erano arrivate né nel ticket né nel piano, e che questo cantiere
aveva quindi disatteso. Il ticket riportava solo la parte architetturale — spostare il componente
in `wm-core` — non le scelte di resa discusse a voce.

- **Le tassonomie vanno subito sotto il titolo**, non in fondo: «in generale le tassonomie vanno in
  cima per tanti motivi, fa parte dei filtri, quindi li vedete subito», con recap finale esplicito.
  Stavano in fondo in **entrambi** i prodotti, quindi la regola «vince sempre la mobile» aveva
  riprodotto fedelmente un ordine che era già stato bocciato. Corretto nel componente condiviso.

- **Le etichette "Contatti", "Link utili" e "Galleria" vanno tolte**, non usate per separare: la
  proposta di dividere contatti e link era stata presentata in quella stessa call e respinta —
  «se li ricevi uniti e il frontend deve fare una serie di if o controlli per separarli, allora non
  mi sta tanto bene», «la suddivisione dinamica di questi dati al più va fatta nel backend». Questo
  cantiere aveva fatto l'opposto: etichetta "Contatti" nuova, con le sette traduzioni, e due
  `BehaviorSubject` per decidere se mostrare i gruppi. Tutto rimosso.

**Cosa cade con le etichette.** Senza titoli non esiste più il problema del titolo orfano sopra
zero righe, che era la ragione di `hasUsableRelatedUrls`: la funzione e il suo spec sono stati
eliminati, e con loro la duplicazione con `normalizeRelatedUrls`, che fa già la stessa analisi
delle tre forme di `related_url` dentro `wm-related-urls`. Anche la chiave i18n `Contatti`,
aggiunta in sette lingue, è stata tolta perché non la usa più nessuno.

**Cosa resta come prima, di proposito.** `wm-feature-useful-urls` e `wm-tab-image-gallery` non sono
stati modificati: portano le etichette anche al dettaglio della traccia, che non era oggetto della
decisione. Nel dettaglio del POI sono stati semplicemente sostituiti dai componenti interni che
avvolgono. Se la stessa pulizia va fatta anche sulle tracce, è un ticket suo.

**Lezione.** Le decisioni di resa vivevano solo nella trascrizione: il ticket, scritto prima di
quella call, descriveva l'intervento come «sostituire il componente e cancellarne uno». Cercare le
trascrizioni all'inizio, non alla fine, avrebbe evitato di costruire e poi smontare la separazione
dei contatti.

### Requisito superato — la classe `.webmapp-poi-popup-title`

L'overview chiedeva di **conservare** quella classe, perché `cypress/e2e/url-with-parameters.cy.ts`
vi asserisce alle righe 21 e 39 su due POI EC. Lo spostamento dell'intestazione nel componente
condiviso l'ha lasciata solo sul ramo UGC, quindi per un POI EC il selettore non matcha più nulla.
Il file è dentro un `describe.skip` in attesa di oc:8022, quindi il difetto non si vedeva: sarebbe
emerso solo alla riattivazione della suite, come un finto bug di rendering.

Risolto aggiornando il selettore a `webmapp-poi-popup .wm-poi-properties-title`, non rimettendo la
vecchia classe nel componente di libreria. La ragione è la convenzione sui prefissi, misurata sul
repo: in `wm-core` 91 selettori di componente su 94 sono `wm-`, e dei sette template nati nel 2026
cinque usano solo classi `wm-`, uno solo `webmapp-` e uno è misto — ed è
`poi-properties.component.html`, nato per questo ticket, che si era portato dietro copiando la
mobile una `webmapp-track-download-urls-item-label` senza alcuna regola CSS dietro, in nessuno dei
due prodotti. Rinominata `wm-poi-properties-osm-link`. Trapiantare in libreria un nome `webmapp-` — prefisso in
abbandono, e per giunta di un componente della webapp — per far felice un test dell'altro repo è
l'accoppiamento che questo ticket serve a togliere. L'assert vicino, quello sulla traccia, usa già
`wm-track-properties .wm-track-details-header`: ora i due sono simmetrici.

La classe resta dov'è ancora usata, cioè sul titolo del ramo UGC del popup.

## Da decidere prima di chiudere la PR

### Rimasto in sospeso, da valutare qui o con un ticket

- **Markup della categoria nel ramo UGC** (`poi-popup.component.html`, blocco
  `taxonomy.poi_types` / `poi_type` dentro `*ngIf="poiProperties?.uuid"`): sembra irraggiungibile,
  perché un POI UGC non ha `taxonomy`. Va verificato su un UGC reale prima di toglierlo. Se
  confermato, è codice morto che entra nel ticket dello split UGC insieme al resto del ramo.

- **Popup vuoto sul percorso `{related: false}`**: `currentPoiProperties` (`ec.selector.ts:225`)
  azzera le properties su quel valore sentinella, mentre il selettore `poi` che apre il popup non
  applica lo stesso filtro. Su quel percorso il popup si aprirebbe con il solo pulsante di
  chiusura, dove prima mostrava titolo e descrizione dal proprio `@Input`. Non riprodotto con dati
  reali; già tracciato come follow-up F7, ma questo ticket ne peggiora la resa.

### Candidati a ticket nuovo

- **`.eslintrc.json` di wm-webapp dichiara `prefix: "webmapp"` come `error`**, contro la
  convenzione appena scritta nei due `CLAUDE.md`. Oggi è configurazione morta — `ng lint` non parte
  perché estende `plugin:@angular-eslint/ng-cli-compat`, che non esiste più nella versione
  installata — ma rimettere in piedi il lint senza toccarla bloccherebbe i selettori `wm-`.
  Il ticket è "far ripartire il lint", e tocca la configurazione dell'intero repo.

- **Unificare il componente badge dei filtri con quello delle tassonomie**, con la questione del
  colore (primary contro secondary). Deciso a voce nello stesso scrum e rinviato lì per lì
  («stiamo complicando troppo», «magari si fa un ticket postumo»).

- **Etichette del dettaglio della traccia**: "Link utili" e "Galleria" restano, perché la decisione
  dello scrum guardava il dettaglio del POI. Se vale anche per le tracce, è un ticket suo — tocca
  `wm-feature-useful-urls` e `wm-tab-image-gallery`, montati da `track-properties`,
  `ugc-track-properties` e `draw-ugc`.

- **URL dell'editor di backend parametrico per shard.** In oc:8406 l'etichetta del tasto è passata
  da "modifica geohub" a "Modifica", generica in previsione di istanze collegate ad altri shard. La
  destinazione però resta scritta nel codice: `map.page.ts:69` costruisce
  `https://geohub.webmapp.it/resources/ec-tracks/<id>/edit`, quindi su un'altra istanza il tasto
  direbbe "Modifica" e aprirebbe comunque geohub. La strada è quella indicata nello scrum del
  04/09/2026: «l'approccio di solito quando si passa da una cosa arcodata a una cosa parametrica è
  che il default è il valore arcodato… se nella configurazione ho lo shard name, ci metto lo
  shard». Tocca `environment`/`shards` e va provato su almeno due shard.

- **`draw-ugc` monta `wm-tab-detail` con la distanza live attiva.** È lo stesso difetto corretto
  nel dettaglio POI con `[showLiveDistance]="false"`: `trackLiveDistanceVm` è agganciato a
  `currentEcTrack`, non alla feature renderizzata, quindi nel pannello di disegno di una traccia UGC
  i badge riporterebbero i numeri della traccia EC in stato. Preesistente, non introdotto da
  oc:8406, e chiuderlo costa una parola — ma sta nel ramo UGC, tenuto fuori per decisione del dev.

- **`contact_phone` non stringa.** Se il backend mandasse un oggetto di traduzione invece di una
  stringa, `splitPhones` restituisce `[]` e da oc:8406 il gruppo "Informazioni" si nasconde del
  tutto. È coerente con `wm-phone`, che comunque non disegnerebbe la riga, quindi non è una
  regressione; ma prima di considerarlo chiuso vale una verifica sui dati, perché il caso passa
  dall'essere visibile-e-vuoto all'essere invisibile.

- **Verificare `wm-config-detail` sui POI** su Cammini d'Italia dev, POI Santa Barbara: è l'unico
  posto dove i box esistono (vedi `wm-core/docs/knowledge/config-detail.md`). Era il gap che ha
  dato origine a questo ticket, e non è ancora stato visto funzionare sulla webapp.

### Etichette: tolte e poi rimesse, con una sola al posto di due

La rimozione delle etichette è stata **ribaltata dal dev il giorno dopo**, e la ragione è buona: il
dettaglio della traccia le etichette ce le ha ancora, e due schermate dello stesso prodotto che
trattano i titoli in modo diverso sembrano un lavoro lasciato a metà — cioè esattamente il difetto
che questo ticket esiste per togliere. Ha vinto la coerenza fra le due schermate sulla decisione
presa guardandone una sola.

Stato finale: "Galleria" torna montando di nuovo `wm-tab-image-gallery`, e al posto dei due titoli
"Contatti" e "Link utili" ce n'è **uno solo, "Informazioni"**, sopra indirizzo, telefoni, mail e
link insieme.

**Perché un titolo solo e perché quella parola.** Due titoli separati erano la forma che lo scrum
aveva respinto. Un titolo solo doveva quindi coprire tutte e quattro le righe, e "Contatti"
mentirebbe: misurato sui dati, `related_url` porta spesso pagine di approfondimento — «Comune di
Pizzighettone», «Pizzighettone (da Wikipedia)» — che contatti non sono. Avevo proposto "Contatti e
link", il dev ha scelto "Informazioni", che era anche il ripiego offerto da Giuseppe in call
(«potremmo mettere informazioni e basta e lasciare perdere la parola»).

**Una premessa dello scrum era falsa, e vale la pena saperlo.** Il criterio per decidere se
separare i gruppi era: «se li ricevi già separati, allora mi sta bene che tu li suddividi; se
invece li ricevi uniti e il frontend deve fare una serie di if o controlli per separarli, allora
non mi sta tanto bene». L'ipotesi operativa in call era che arrivassero uniti — «mi sembra che
siano tutti assieme» — e nessuno l'ha verificata. Profilando i payload di 45 app: `addr_complete`,
`contact_phone`, `contact_email` e `related_url` sono **campi distinti**, sempre. Separarli sarebbe
stato ammesso dal criterio stesso. La scelta finale di unirli resta valida, ma per la ragione
linguistica sopra, non perché il dato lo imponesse.

**`hasContacts$`, l'unico gate rimasto.** Serve a non lasciare "Informazioni" sospeso sopra il
vuoto, e non è sostituibile da un `*ngIf` sui campi: `related_url` arriva come `[]` su 2.572 POI, e
in JavaScript un array vuoto è truthy. Riusa `normalizeRelatedUrls`, la stessa funzione di
`wm-related-urls`, quindi non reintroduce la duplicazione che `hasUsableRelatedUrls` aveva creato.

### Rientro delle righe: tolta un'eccezione, non aggiunta una regola

Nel dettaglio, "Dove" partiva dal bordo mentre "Dettagli tecnici" e i contatti erano rientrati di
16px. La causa era un override in `poi-popup.component.scss` che azzerava `--padding-start` sugli
`ion-item` del solo `wm-txn-where`, e solo nella webapp: produceva due divergenze insieme, una
dentro il dettaglio e una fra webapp e dettaglio traccia.

Il primo tentativo è stato allineare tutto **al bordo**, portando la regola nel componente
condiviso. Il dev ha poi chiesto l'opposto — allineare al rientro standard, cioè alla resa della
traccia — che si ottiene semplicemente togliendo l'eccezione. Risultato: `wm-core` non ha nessun
override di padding sul dettaglio POI e `wm-webapp` ne ha uno in meno di prima che cominciassimo.

### Identificatori in italiano: uno, ed era mio

`wm-poi-informazioni` è stato l'unico identificatore italiano di entrambi i repo — verificato su
classi, id, variabili CSS e membri TypeScript con una ventina di parole italiane comuni. Rinominato
`wm-poi-properties-contacts`, insieme a `hasInformazioni$` → `hasContacts$` e alle variabili locali
dello spec. La convenzione, che non era scritta da nessuna parte, è ora nei due `CLAUDE.md`:
identificatori in inglese, prosa in italiano — descrizioni dei test comprese, che nel repo sono
già italiane.

## Tre difetti trovati dalla review, e corretti

Review con `wm-skills:wm-review-ticket` a lavoro finito, cinque finder in parallelo. I tre
bloccanti erano tutti introdotti da questo ticket, e nessuno dei tre era coperto dai test.

- **Le frecce saltavano su un POI non correlato.** Le guardie che avevo aggiunto a
  `nextRelatedPoiId`/`prevRelatedPoiId` coprivano `relatedPois == null` ma non l'indice `-1`: senza
  un correlato selezionato, `findIndex` torna `-1` e `relatedPois[-1 + 1]` è il **primo** POI
  dell'elenco. Il navigator a schermo non lo mostrava perché il suo template ha un gate in più
  (`currentRelatedPoiIndex` filtrato sui null, poi `+1`, quindi `0` e falsy); le scorciatoie da
  tastiera del popup no. Il commento che avevo scritto affermava che il gate fosse lo stesso: non
  lo era, ed è stato corretto insieme al codice.

- **Il titolo "Informazioni" poteva restare sopra una lista vuota.** `hasContacts$` guardava
  `contact_phone` grezzo, ma la riga la disegna `wm-phone`, che passa per `splitPhones` e scarta le
  stringhe senza cifre — `"Fixed Phone:,Cell Phone:,Other Phone:"`, forma già registrata in queste
  note come vista in QA. Era la stessa asimmetria che per i link avevo risolto riusando
  `normalizeRelatedUrls` e che non avevo applicato ai telefoni. Ora ogni riga è chiesta alla stessa
  funzione che poi la disegna.

- **Nel dettaglio del POI compariva la distanza live della traccia.** `wm-tab-detail` legge
  `trackLiveDistanceVm$` dallo stato di navigazione **globale**, non dalle `properties` che riceve,
  e le righe "Da"/"A" hanno un `*ngIf` in `||` su quel valore. Con una navigazione live attiva,
  aprire un POI correlato con la quota mostrava dentro "Dettagli tecnici" i numeri della traccia.
  È una regressione nuova, perché è la prima volta che `wm-tab-detail` viene montato per un POI.
  Risolto con un `@Input showLiveDistance`, default `true` così le tracce non cambiano, messo a
  `false` da `wm-poi-properties`.

Tutti e tre hanno ora uno spec che li blocca: `related-poi-navigation.spec.ts` sui due selettori, e
tre casi nuovi in `hasContacts$` per il telefono di sole etichette, quello non stringa e quello con
un numero vero dietro l'etichetta. Test di wm-core: da 308 a 315.

### Le chiavi sorelle di `edit`, tradotte per non lasciare tasti bilingui

Tradurre `edit` ha avuto un effetto che la review ha colto e che da solo sarebbe stato un
peggioramento: sui tasti dei POI e delle tracce UGC si sarebbe letto «Modifica» accanto a
«delete». Prima erano entrambe in inglese — sbagliate ma coerenti — e il cambio avrebbe reso la
riga visibilmente incoerente su entrambi i prodotti.

Tradotte quindi anche `delete`, `save` e `cancel` nelle sette lingue, che erano nella stessa
condizione di `edit`: chiave presente nei template, assente nei file i18n, quindi `wmtrans`
ricadeva sulla chiave. Non era nel perimetro del ticket, ma lasciare a metà una riga di tasti per
rispettarlo avrebbe voluto dire consegnare un difetto nuovo.

## La seconda review, e cosa ha corretto

Rieseguita `wm-skills:wm-review-ticket` dopo i tre fix. Le correzioni sono state verificate una per
una e reggono — guardia sull'indice negativo, `showLiveDistance`, `hasContacts$` — e lo `z-index: 2`
del popup è stato verificato sui file: i pannelli che il dettaglio copriva sono `position: fixed`
dentro `.top-right`, che sta a 2 e viene dopo nel DOM, quindi ora ci passano sopra.

Due difetti sono però emersi, ed erano entrambi introdotti da modifiche dello stesso giorno.

- **Il commento che giustificava lo `z-index` diceva il falso.** Affermava che `.bottom-right` sta a
  2 e il canvas a 1. Verificato in `map-core`: `.bottom-right` è a **1** insieme a scala e
  attribuzione, e il canvas non ha z-index affatto; a 2 ci sono `top-left`, `top-right`, `bottom` e
  `bottom-center`. La scelta resta giusta, ma chi avesse letto quel commento per posizionare un
  overlay nuovo sarebbe partito da una mappa sbagliata dei piani. Corretto nel codice e nella pagina
  di conoscenza, dove l'errore era stato ricopiato.

- **Tradurre `edit` da solo peggiorava la resa**, ed è il motivo per cui `delete`, `save` e `cancel`
  sono state tradotte nello stesso giro invece di restare un follow-up: vedi sopra.

### Il ritmo verticale delle sezioni

Segnalato dal dev: spazi disomogenei nel dettaglio, in particolare l'excerpt con più aria sopra che
sotto. Il modello era corretto — ogni componente porta `--wm-feature-details-margin` e i margini
adiacenti collassano — ma aveva quattro eccezioni: l'excerpt usava `padding: 20px 0 3px 0` invece
del margine (il riquadro era spaziato bene, il **testo dentro** no, ed era quello che si vedeva),
il link OSM e l'HTML incorporato non avevano niente, la distanza azzerava il margine sopra.

Il ritmo ora lo dichiara il contenitore, `.wm-poi-properties-body > *`, quindi vale anche per le
sezioni che verranno aggiunte. Restano margini e non `gap`: i margini collassano, e un host sempre
montato che non rende nulla — `wm-config-detail` — non lascia spazio vuoto, mentre con flex ne
lascerebbe uno per ciascuno. Misurato sul POI 42057 di geohub, sette sezioni visibili e due host
vuoti: tutti gli intervalli a 24px.
