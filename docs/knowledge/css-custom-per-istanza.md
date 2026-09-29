# CSS custom per istanza

Cosa comporta, **per questo prodotto**, il fatto che alcune app abbiano un proprio foglio di stile.

## Il meccanismo sta in wm-core, non qui

I nove fogli — `<shardName>/<appId>.css`, per **sei** app: i tre shard di Forestas e i due di
Cammini d'Italia portano lo stesso `appId` su domini diversi — vivono in
`wm-core/projects/wm-core/src/assets/theme/`, e da lì li servono entrambi i prodotti. Come funziona
il caricamento, perché una rinomina li scollega in silenzio, come si estende una regola all'altro
prodotto e cosa invece non si traduce: sta tutto in
[`wm-core/docs/knowledge/varianti-per-shard.md`](../../src/app/shared/wm-core/docs/knowledge/varianti-per-shard.md),
insieme al [README accanto ai file](../../src/app/shared/wm-core/projects/wm-core/src/assets/theme/README.md).

**Non duplicare qui quella spiegazione.** Fino a oc:8613 stava in questa pagina, che era la più
lunga delle tre sull'argomento e stava nel repo che quei file non li possiede più — ed è così che si
arriva a due documenti che si smentiscono.

Le due cose da sapere lavorando qui:

- **La webapp pubblica i nove temi** con una voce di `assets` in `angular.json` che punta alla
  cartella di `wm-core` con `output: "theme"`. Se quella cartella manca — tipicamente perché il
  submodule è indietro — la glob non trova niente e la build **riuscirebbe** senza i CSS dei
  clienti: per questo `scripts/check-themes.js` di `wm-core` viene invocato dal `prebuild`, dai due
  script di deploy, dai quattro script Surge, da `deploy-cai`, da `deploy-webcomponent` e da un
  passo di `preview.yml` — nove punti in tutto. L'elenco dei clienti attesi sta in
  `theme-manifest.json`, nella radice del repo: senza, il gate non potrebbe accorgersi di un pin
  del submodule rimasto indietro.
- **Delle sei app, quattro hanno un tema nato qui**: Federazione Italiana Escursionismo (29) e
  Sentieri CAI Parma (33), che riordinano il dettaglio traccia con `order`, e Sardegna Sentieri (32)
  con Forestas (app 1 sui tre shard), che hanno lo stesso md5 e toccano filtri, ricerca e box della
  home.

## Stato dei selettori inerti in questo repo (oc:8613)

**L'esito dell'audit è che oc:8406 non ha scollegato niente su questo repo.** Verificati uno per
uno, i selettori che non combaciano sono assenti anche su `develop`: non c'è nessuna regressione da
correggere.

Quello che l'audit ha rilevato è un'altra cosa, e va letta come tale: nei temi ci sono regole
**inerti**, cioè che non agiscono e con ogni evidenza non agivano già prima. Non è qualcosa che
funzionava e si è rotto.

Nei quattro file identici, uno solo e puramente estetico:

| Orfano | Oggi |
|---|---|
| `webmapp-search` | `webmapp-search-box` |

In `geohub/29.css` e `geohub/33.css`, sul dettaglio traccia, dove la quota è tutt'altro che
marginale: delle **20 regole `order` in tutto, 14 sono inerti** — 8 su 11 in FIE, 6 su 9 in CAI
Parma. In entrambi i file reggono solo `wm-slope-chart`, `.wm-track-details-download` e
`.wm-track-details-track-related-poi`.

`.wm-alert` era contata fra le vive e non lo è: nessun elemento porta quella classe — il template
monta `<wm-track-alert>` — quindi la regola è orfana come le altre. Misurato a runtime sulle app 29
e 33, zero bersagli. Da qui il 14 invece del 12: la correzione allinea questa pagina a
`overview.md` del cantiere, che il numero giusto lo dava già (oc:8613).

| Orfano | Oggi | `order` in 29 | `order` in 33 |
|---|---|---|---|
| `webmapp-track-description` | `wm-tab-description` | 2 | — |
| `wm-gallery` | `wm-tab-image-gallery` | 3 | — |
| `.wm-track-details-related-url` | `wm-related-urls` | 4 | 7 |
| `.wm-track-details-activities` | `wm-tab-howto` | 5 | 5 |
| `.wm-track-details-title-technical-details` | `wm-tab-detail` | 6 | 4 |
| `.wm-track-details-edit-geohub` | nessun bersaglio nella webapp | 10 | 9 |
| `.webmapp-track-title` | `.wm-track-details-header` | −2 | −2 |
| `.wm-alert` | nessun elemento la porta: il componente è `wm-track-alert` | −1 | −1 |
| `webmapp-track-technical-data` | `wm-tab-detail` | — | — |
| `webmapp-track-download-urls` | `wm-feature-useful-urls` | — | — |

**Riagganciarli non ripristina niente, cambia la resa — e si è deciso di non farlo.** Qui non è come
sulla mobile, dove il CSS si era scollegato con il lavoro in corso e rimetterlo a posto riportava la
produzione com'era: questi selettori sono morti da prima di `develop`, quindi FIE e CAI Parma girano
da tempo **senza** quegli `order`, e la loro resa attuale in produzione è quella senza. Riagganciarli
non sarebbe un fix ma un cambio di aspetto su due app di clienti, verso un layout che nessun utente
ha mai visto. **La baseline è lo stato attuale** (oc:8613): restano inerti e documentati.

La regola generale che ne esce, e che vale per la prossima volta: **prima di riagganciare una regola,
misurare se agganciava**. Riscrivere un selettore inerte non ripristina niente, lo attiva per la
prima volta — ed è un errore in cui si è caduti da entrambe le parti prima di formularlo così.

Tre casi non si risolvono comunque con una rinomina secca:

- `.wm-track-details-edit-geohub` non ha nessun bersaglio: nella webapp quel pulsante non esiste.
- `.wm-track-details-related-url` diventerebbe `wm-related-urls`, che è **annidato** dentro
  `.wm-track-details-download`: l'`order` non agirebbe sul contenitore principale comunque.
- `33.css` dichiara già `wm-tab-detail { margin-top: 15px }`, quindi la rinomina di
  `.wm-track-details-title-technical-details` finisce sulla stessa regola e le due vanno fuse.

## Cosa ha richiesto la condivisione, dal lato di questo repo

Portare i temi nel core non è stato neutro: un file scritto per l'app, arrivando qui, ha chiesto
cose che la webapp non aveva. Sono emerse tutte dal controllo visivo app per app, non dall'analisi.

- **L'icon font sotto due nomi.** I due prodotti hanno sempre chiamato la propria font delle icone in
  modo diverso — `wm` qui, `webmapp` nell'app — e finché i CSS stavano in cartelle separate la cosa
  non emergeva. Un tema che chiede `font-family: 'webmapp'` qui non trovava niente e il glifo non
  rendeva: è il caso della freccia sulle schede dei layer del tema 75. Risolto con un **alias
  `@font-face`** sugli stessi file in `assets/icons/webmapp-icons/style.css`: è la stessa icona nei
  due font (`\e985`, `.icon-fill-arrow-right`), quindi costa una dichiarazione e vale per ogni regola
  che usi quel nome.

- **Due regole di prodotto in `global.scss`.** Non tutto ciò che un tema dichiara ha senso qui, e
  quando la differenza dipende dal prodotto e non dal cliente la decisione sta nel codice, non nel
  tema: **"Ottieni indicazioni" resta nascosto** — avvia la navigazione assistita, che senza GPS
  continuo non porta a niente — e **i tasti dello zoom restano dove li mette `map-core`**, centrati
  in altezza, anche se `geohub/75.css` li manda in basso perché sull'app sotto c'è la tab bar.
  Entrambe le regole portano il prefisso della pagina: il foglio del componente dichiara sullo stesso
  host e viene iniettato a runtime, quindi a parità di specificità vincerebbe lui.

- **Lo slot `[bottom]` di `wm-track-properties` ha un `order` esplicito** (in `wm-core`): il
  contenitore è flex e un figlio senza `order` vale 0, quindi bastava un tema che numerasse le
  sezioni perché il contenuto proiettato in fondo finisse in cima. Il sintomo era il pulsante
  "Modifica" sopra l'intestazione del percorso.

- **Un fondo bianco che era bianco per caso.** `geohub/32.css` dava al chip "Torna alla home"
  `background: white` per farlo sembrare un link, e funzionava solo perché dietro c'era il pannello
  bianco della webapp. Sull'app si vedeva come un riquadro. Ora è `transparent`, che dice quello che
  la regola voleva dire ed è identico su entrambi.

## Come ci siamo arrivati

- **"Dove stanno i CSS arcodati?" senza risposta** (oc:8613, superata): la prima ricerca li aveva
  cercati nel repo — in `global.scss`, nelle configurations di `angular.json`, in un `styles` per
  shard — e nella configurazione dell'app servita dall'API, dove esiste solo il blocco `THEME` con
  le variabili. In nessuno dei due posti c'era niente, e la conclusione sbagliata che se ne ricavava
  è che la webapp non avesse personalizzazioni per app. Erano in `src/theme/` — da oc:8613 stanno in
  `wm-core` — raggiunti da un URL
  costruito a runtime: non c'è nessuna riga di configurazione che li nomini, quindi non si trovano
  cercando chi li dichiara.
