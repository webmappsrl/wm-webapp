# CSS custom per istanza

Il foglio di stile che una singola app si porta dietro, dove vive e perché rinominare un selettore
condiviso lo scollega senza che nulla lo segnali.

## Come funziona oggi

Oltre alle variabili di tema — quelle stanno in [tema-e-colori.md](tema-e-colori.md) — ogni app può
avere **un foglio di stile tutto suo**, con selettori veri. Lo inietta `wm-core`, in
`meta.component.ts:50`:

```ts
this._renderer.setProperty(styleLink, 'href', `theme/${shardName}/${appId}.css`);
this._renderer.setProperty(styleLink, 'id', 'client-theme');
```

Il `<link id="client-theme">` finisce in fondo al `<head>`, quindi vince sui fogli del bundle a
parità di specificità. Il percorso è costruito, non dichiarato: **un'app senza quel file riceve
semplicemente un 404 e non ha nessuna personalizzazione**. Non c'è elenco da tenere aggiornato, e
non c'è errore quando il file manca.

I file stanno in `src/theme/<shardName>/<appId>.css`, serviti perché `src/theme` è fra gli `assets`
di `angular.json`. Sono **sei**, per cinque app:

| App | Shard | File | Regole `order` | Cosa tocca |
|---|---|---|---|---|
| Federazione Italiana Escursionismo (29) | `geohub` | `geohub/29.css` | 11 | dettaglio traccia |
| Sentieri CAI Parma (33) | `geohub` | `geohub/33.css` | 9 | dettaglio traccia |
| Sardegna Sentieri (32) | `geohub` | `geohub/32.css` | — | filtri, ricerca, box della home |
| Forestas (1) | `forestas`, `forestasdev`, `forestasuat` | `forestas/1.css` e i due gemelli | — | come sopra |

I quattro file senza `order` hanno lo **stesso md5** (`4312f5d8…`): si leggono e si correggono una
volta sola.

**Il meccanismo è condiviso, i file no.** Anche `webmapp-app` inietta `theme/<shard>/<appId>.css`,
ma legge dal proprio `src/theme/`, che contiene `camminiditalia/1.css`, `camminiditaliadev/1.css` e
`geohub/75.css`. Nessun file compare in entrambi i prodotti, quindi **la stessa app può avere un CSS
custom su una piattaforma e non sull'altra**: è il caso di Ville e Giardini Medicei (75), che ce
l'ha solo sulla mobile.

## Perché così

- **Un `<link>` costruito a runtime, non un `styles` di `angular.json`** : il bundle web è uno solo
  e multi-tenant — `app.geohub.webmapp.it` serve tutti gli shard e tutte le app, con lo shard
  deciso a runtime dall'hostname — quindi una personalizzazione per app non può essere compilata
  dentro. L'unica alternativa sarebbe un bundle per cliente, che è quello che si fa solo per
  `camminiditalia`, e solo perché lì servono `fileReplacements`.

- **L'`order` di flexbox è il modo con cui queste app riordinano le sezioni** (29 e 33):
  `wm-track-properties` è `display: flex; flex-direction: column`, quindi un `order` sul figlio
  giusto sposta una sezione senza toccare il markup condiviso. È la sola leva disponibile a chi
  scrive il CSS del cliente: il template non è suo.

- **Il prezzo di quella leva è che il CSS punta ai nostri nomi**: elementi (`wm-tab-description`) e
  classi (`.wm-track-details-activities`) del codice condiviso. Una rinomina in `wm-core` non fa
  fallire nessuna build e non produce nessun avviso — il selettore semplicemente non combacia più.

- **Un figlio flex senza `order` vale 0, e lo 0 viene prima dei valori positivi**: è la ragione per
  cui un selettore scollegato non "perde solo il suo stile", ma **manda la sezione in cima**. È
  esattamente il difetto che si è visto sul dettaglio POI della mobile, dove il blocco
  "Informazioni" era finito sotto al nome dopo che oc:8406 aveva rinominato il wrapper che il CSS
  dell'app 75 prendeva di mira.

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
marginale: delle **20 regole `order` in tutto, 12 sono inerti** — 7 su 11 in FIE, 5 su 9 in CAI
Parma. In entrambi i file reggono solo `wm-slope-chart`, `.wm-track-details-download`,
`.wm-track-details-track-related-poi` e `.wm-alert`.

| Orfano | Oggi | `order` in 29 | `order` in 33 |
|---|---|---|---|
| `webmapp-track-description` | `wm-tab-description` | 2 | — |
| `wm-gallery` | `wm-tab-image-gallery` | 3 | — |
| `.wm-track-details-related-url` | `wm-related-urls` | 4 | 7 |
| `.wm-track-details-activities` | `wm-tab-howto` | 5 | 5 |
| `.wm-track-details-title-technical-details` | `wm-tab-detail` | 6 | 4 |
| `.wm-track-details-edit-geohub` | nessun bersaglio nella webapp | 10 | 9 |
| `.webmapp-track-title` | `.wm-track-details-header` | −2 | −2 |
| `webmapp-track-technical-data` | `wm-tab-detail` | — | — |
| `webmapp-track-download-urls` | `wm-feature-useful-urls` | — | — |

**Riagganciarli non ripristina niente, cambia la resa.** Qui non è come sulla mobile, dove il CSS si
era scollegato con il lavoro in corso e rimetterlo a posto riportava la produzione com'era: questi
selettori sono morti da prima di `develop`, quindi FIE e CAI Parma girano da tempo **senza** quegli
`order`, e la loro resa attuale in produzione è quella senza. La correzione è quindi una decisione
di prodotto, non un fix, ed è ferma in attesa di quella decisione.

Tre casi non si risolvono comunque con una rinomina secca:

- `.wm-track-details-edit-geohub` non ha nessun bersaglio: nella webapp quel pulsante non esiste.
- `.wm-track-details-related-url` diventerebbe `wm-related-urls`, che è **annidato** dentro
  `.wm-track-details-download`: l'`order` non agirebbe sul contenitore principale comunque.
- `33.css` dichiara già `wm-tab-detail { margin-top: 15px }`, quindi la rinomina di
  `.wm-track-details-title-technical-details` finisce sulla stessa regola e le due vanno fuse.

## Come ci siamo arrivati

- **"Dove stanno i CSS arcodati?" senza risposta** (oc:8613, superata): la prima ricerca li aveva
  cercati nel repo — in `global.scss`, nelle configurations di `angular.json`, in un `styles` per
  shard — e nella configurazione dell'app servita dall'API, dove esiste solo il blocco `THEME` con
  le variabili. In nessuno dei due posti c'era niente, e la conclusione sbagliata che se ne ricavava
  è che la webapp non avesse personalizzazioni per app. Erano in `src/theme/`, raggiunti da un URL
  costruito a runtime: non c'è nessuna riga di configurazione che li nomini, quindi non si trovano
  cercando chi li dichiara.
