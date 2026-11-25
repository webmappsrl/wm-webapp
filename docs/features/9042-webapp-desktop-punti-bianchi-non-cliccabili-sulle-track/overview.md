> Ticket: oc:9042

# webapp desktop: punti bianchi non cliccabili sulle track

## Cosa cambia

Il deploy di camminiditalia diventa due script distinti:

- `npm run deploy-camminiditalia` resta com'è: builda e pubblica **senza** nessuna cartella
  `assets`. È quello che continuano a usare `npm run deploy` (`scripts/deploy.js`) e la CI di
  produzione (`.github/workflows/deploy_prod.yml`).
- `npm run deploy-camminiditalia-full`, nuovo, fa lo stesso build e pubblica **tutto**
  `www-camminiditalia/`, comprese `assets/` e `map-core/assets/`. Si lancia a mano quando cambia
  un asset o quando si prepara un server nuovo.

I due comandi npm puntano allo stesso file, `scripts/deploy-camminiditalia.js`: con l'argomento
`--full` l'`--exclude assets` di rsync non viene passato. Nessuna duplicazione di build e
destinazione fra due file.

Lo stesso schema si applica in `webmapp-app` (overview gemella nello stesso slug, in quel repo).

## Perché

Sulla track selezionata `map-core` disegna le frecce del senso di percorrenza: un `Circle` bianco
di raggio 10 ogni ~85 px con sopra l'icona `map-core/assets/line-icon-arrow.png`
(`src/app/shared/map-core/src/utils/styles.ts:110-137`). Su `1.camminiditalia.webmapp.it`
l'icona non esisteva — la richiesta restituiva l'`index.html` — e restava solo il disco bianco: i
«punti bianchi non cliccabili» segnalati dal cliente nella call del 23/11.

La causa è `scripts/deploy-camminiditalia.js`, nato in oc:8512 come copia dello script gemello di
`webmapp-app`: `RSYNC_ARGS = ['-av', '--exclude', 'assets']`. Un pattern rsync senza `/`
iniziale vale per **ogni** cartella `assets` a qualunque profondità, quindi esclude anche
`map-core/assets/`. `scripts/deploy-default.js` non ha il problema perché copia tutto con `scp -r`.

Sul server sono già stati sistemati a mano, il 25/11, entrambi i sintomi:

- `map-core/assets/` caricata con rsync dai sorgenti del submodule;
- la root `assets/` esisteva (creata a mano da `root` il 10/09) ma era `drwxr--r--`, senza il bit
  di attraversamento: Apache rispondeva `403` a tutti i 73 file. Corretta con `chmod 755`.

Il sito oggi serve tutti gli asset. Lo script però non li pubblicherebbe su un server nuovo né
pubblicherebbe un asset aggiunto o modificato: il ticket rende il deploy completo un comando,
invece di una procedura da ricordare.

## Requisiti

- [ ] `npm run deploy-camminiditalia-full` pubblica su `server:/var/www/html/camminiditalia.webmapp.it/`
      il contenuto di `www-camminiditalia/` senza escludere nessuna cartella `assets`
- [ ] `npm run deploy-camminiditalia` si comporta esattamente come oggi (stesso build, stesso
      `--exclude assets`), così `npm run deploy` e la CI non cambiano
- [ ] `scripts/deploy-camminiditalia.js` spiega nel commento di testa che `--exclude assets`
      esclude anche `map-core/assets/`, e quando serve il deploy completo
- [ ] La tabella Comandi del `CLAUDE.md` riporta il nuovo comando
- [ ] La pagina `docs/knowledge/variante-camminiditalia.md` descrive i due deploy e la trappola
      del pattern rsync
- [ ] Verifica con `node --check` sullo script e lettura del comando rsync composto nei due casi
      (senza lanciarlo contro il server)

## Rischi

- **Il deploy completo sovrascrive la root `assets/` del server.** Oggi contiene gli stessi nomi
  di `src/assets` al primo livello (confrontati il 25/11, sottocartelle non confrontate), quindi nessun contenuto specifico dell'istanza andrebbe
  perso; rsync senza `--delete` non toglie nulla. Se in futuro sul server comparisse un file
  proprio dell'istanza con lo stesso nome di uno della build, verrebbe sovrascritto.
- **Il deploy veloce resta incompleto per costruzione.** Un asset nuovo non arriva in produzione
  finché qualcuno non lancia il completo: è la scelta del dev, mitigata dal commento nello script
  e dalla riga nel `CLAUDE.md`.
- **Il primo deploy completo pubblica gli asset arretrati.** Il 25/11, confrontando con `shasum`
  i 73 file serviti con quelli del repo, solo `assets/icons/webmapp-icons/style.css` è diverso
  (il server è fermo al 10/09, il file è cambiato con oc:8406 il 29/09). rsync sovrascrive senza
  tenere copie. Deciso dal dev: il deploy completo lo lancia il team a mano, senza procedure o
  controlli aggiuntivi nello script.
- **Un asset mancante non fa fallire nulla.** Il fallback della webapp risponde `200` con
  l'`index.html` al posto del file mancante, e la health check guarda solo la home: è così che il
  bug è arrivato al cliente. Accettato dal dev: nessun controllo sugli asset nella CI.
- **Cache dei browser.** Chi ha aperto il sito prima del 25/11 può avere in cache l'`index.html`
  al posto dell'icona per qualche giorno (nessun `Cache-Control` da Apache). Si risolve da sé.

## Out of scope

- Cambiare cosa lanciano `npm run deploy` e la CI di produzione
- Header `Cache-Control` su Apache per gli asset
- Controllo nella CI che un asset (per esempio `map-core/assets/line-icon-arrow.png`) arrivi come
  immagine dopo il deploy
- Pulizia dei bundle vecchi accumulati nella cartella remota (`main.*.js` di settembre e ottobre)
- Modifiche a `map-core` (stile delle frecce, cerchio bianco)

## Moduli toccati

Repo `wm-webapp`:

- `scripts/deploy-camminiditalia.js` — argomento `--full`, commento di testa
- `package.json` — script `deploy-camminiditalia-full`
- `CLAUDE.md` — riga nella tabella Comandi
- `docs/knowledge/variante-camminiditalia.md` — i due deploy, la trappola del pattern

Repo `webmapp-app`: vedi la sua `docs/features/9042-webapp-desktop-punti-bianchi-non-cliccabili-sulle-track/overview.md`.
