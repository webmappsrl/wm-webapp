> Ticket: oc:8406

# Notes — Dettaglio EcPoi unificato in wm-webapp (fase C)

Stato al 15 settembre: **task 1-5, 7-10 e 12 eseguiti e committati**, più le correzioni emerse dal
test manuale del dev. Restano il ripristino di `environment.ts` (ora punta all'app in prova) e il
push, che va coordinato con l'agente su webmapp-app.

Esito test: **wm-webapp 5/5**, **wm-core 307/307** (288 di baseline + 18 nuovi + 1 arrivato con
develop). Nessuno spec preesistente è caduto, quindi non è stato necessario indebolire alcun test.
Build completa verde.

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
