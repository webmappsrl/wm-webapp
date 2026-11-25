> Ticket: oc:9042

# Notes — webapp desktop: punti bianchi non cliccabili sulle track

## Deviazioni dal piano

Nessuna deviazione rilevante. La verifica del Task 1 è stata più forte di quanto previsto: oltre a
`node --check`, gli script sono stati caricati con `run()` sostituito da una funzione che stampa
gli argomenti, così da leggere il comando rsync composto nei due modi senza lanciarlo.

## Bug trovati

- **Causa del ticket.** `RSYNC_ARGS = ['-av', '--exclude', 'assets']` in
  `scripts/deploy-camminiditalia.js` (nato in oc:8512 come copia dello script gemello di
  `webmapp-app`) esclude ogni cartella `assets` a qualunque profondità, quindi anche
  `map-core/assets/`. Su `1.camminiditalia.webmapp.it` l'icona `line-icon-arrow.png` non esisteva
  e la richiesta restituiva l'`index.html`: sulla track selezionata restava solo il `Circle` bianco
  che `map-core` disegna sotto ogni freccia. Il confronto con l'istanza Geohub
  (`11.app.webmapp.it`), dove l'icona è servita, l'ha mostrato.
- **Root `assets/` irraggiungibile.** Sul server la cartella, creata a mano da `root` il 10/09,
  era `drwxr--r--`: senza il bit di attraversamento Apache rispondeva `403` a tutti i 73 file.
- **Stesso bug in `webmapp-app`.** `1.camminiditalia.mobile.webmapp.it` rispondeva `500` su
  `map-core/assets/line-icon-arrow.png`: il deploy dedicato ha la stessa esclusione.

## Decisioni

- **Correzioni manuali sul server, 25/11**, lanciate dal dev dal proprio terminale (da qui l'SSH a
  password non è utilizzabile):
  - `rsync` di `src/app/shared/map-core/src/assets/` in
    `/var/www/html/camminiditalia.webmapp.it/map-core/assets/`;
  - `chmod 755 /var/www/html/camminiditalia.webmapp.it/assets`;
  - `rsync` di `core/src/app/shared/map-core/src/assets/` di `webmapp-app` in
    `/var/www/html/mobile.camminiditalia.webmapp.it/map-core/assets/`.
  Verificati con `curl`: tutti gli asset rispondono `200` con il tipo giusto e lo stesso hash del
  repo. Dopo la correzione le frecce non comparivano nel browser del dev per la cache (la risposta
  HTML era stata messa in cache senza `Cache-Control`); in incognito comparivano.
- **Due deploy distinti, non un pattern ancorato.** Il dev ha scelto di tenere il deploy veloce
  (senza nessuna cartella `assets`) come deploy automatico di `npm run deploy` e della CI, e di
  aggiungere un deploy completo da lanciare a mano. Scartato `--exclude /assets`.
- **Esteso a `webmapp-app`** su richiesta del dev, per entrambi i target web.
- **Challenge:** il dev ha rifiutato sia una procedura per il primo deploy completo (copia della
  cartella remota, deploy da `main` pulito) sia un controllo sugli asset nella health check della
  CI. Il deploy completo lo lancia il team a mano.
- **Nessun tag Orchestrator**: il dev ha chiesto di saltare la proposta.

## Follow-up

- `assets/icons/webmapp-icons/style.css` sul server di camminiditalia è quello del 10/09: il file
  è cambiato con oc:8406. Si allinea con il primo `npm run deploy-camminiditalia-full`.
- La cartella remota accumula bundle vecchi (`main.*.js` di settembre e ottobre): nessun deploy
  usa `--delete`.
- `docs/knowledge/variante-camminiditalia.md` dice che i `fileReplacements` della configuration
  `camminiditalia` coprono due componenti: in `angular.json` sono otto. Non corretto qui perché
  fuori dal tema del ticket.
