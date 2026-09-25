---
paths:
  - "src/app/shared/wm-core/projects/wm-core/src/assets/theme/**"
  - "src/app/components/**/*.html"
  - "src/app/pages/**/*.html"
  - "src/app/shared/wm-core/projects/wm-core/src/**/*.html"
---

# Trappole: CSS custom per istanza

Il perché sta in [docs/knowledge/css-custom-per-istanza.md](../../docs/knowledge/css-custom-per-istanza.md).

I nove temi stanno in `wm-core`, sotto `projects/wm-core/src/assets/theme/<shard>/<appId>.css`, e
sono serviti sia da questo repo sia da `webmapp-app`: **una modifica lì arriva a entrambi i
prodotti** (oc:8613).

## Quando si tocca un componente

- **Rinominare un selettore o una classe può scollegare il CSS di un cliente, in silenzio.** Quei
  file puntano ai nomi dei componenti condivisi e non sono referenziati da nessuna build: il
  `<link>` è costruito a runtime da `meta.component.ts:50`. Nessun compilatore, test o lint segnalerà
  mai il drift. Dopo una rinomina, cerca il vecchio nome nella cartella dei temi.

- **Un figlio flex senza `order` vale 0, quindi va in cima, non in fondo.** `wm-track-properties` è
  `display: flex; flex-direction: column`, e i temi di FIE (29) e CAI Parma (33) ne riordinano le
  sezioni. Se un selettore si scollega, quella sezione non perde solo il suo stile: **risale sopra
  tutte le altre**.

- **Un file di tema che manca non è un errore.** L'URL è costruito, non dichiarato: un'app senza il
  suo file prende un 404 e resta senza personalizzazione.

## Quando si riscrive una regola per farla valere su entrambi i prodotti

- **Si affianca un selettore, non si sostituisce.** Il ramo che già funzionava resta identico, così
  la resa su quel prodotto non cambia per costruzione. Vedi la knowledge per la forma.

- **Il prefisso del contenitore è portante.** `wm-home-layer` e `wm-status-filter` si montano in due
  punti sull'app — nel pannello e dentro `wm-home` — quindi togliere `wm-map-details` farebbe
  applicare la regola anche alla home. I due punti sono vivi **nello stesso momento** con un layer
  aperto.

- **Si decide su cosa dichiara la regola, non su come si chiama il selettore.** Una regola che
  compensa il padding di `ion-card-content` o fa spazio a una tab bar non ha senso dove non ci sono
  né la card né la tab bar: resta al prodotto suo.

## Quando si misura quali regole agganciano

- **`querySelectorAll` non aggancia mai uno pseudo-elemento.** `document.querySelectorAll('body::after')`
  restituisce 0 anche se `body` esiste. Misura sull'elemento host, togliendo lo pseudo, o
  classificherai come morte regole vive. Le pseudo-**classi** (`:first-of-type`, `:has()`) invece
  funzionano. In questo repo i temi non hanno `::after` né `::before` — zero occorrenze in tutti e
  quattro — ma il tema di Ville ne ha quattordici.

- **Un match non basta: controlla in quale contenitore sta.** Un elemento può essere montato fuori
  dal contenitore che ti interessa e farti contare un falso positivo. Ancora la query al contenitore
  (`.details-container …`) o verifica con `closest()`.

- **Percorri gli stati, non dedurli dalla configurazione.** `wm-home-layer` e `wm-status-filter`
  compaiono solo con un layer aperto, `wm-tab-description` solo se quel layer ha una descrizione,
  `.wm-track-details-track-related-poi` solo su una traccia con POI correlati. Dedurre da `MAP.layers`
  porta fuori strada: l'app 75 è stata data per «senza layer» quando ne ha cinque.

- **L'audit degli orfani si fa con ERE POSIX, dove `\s` non esiste.** Usarlo restituisce zero
  selettori reali e marca orfano *tutto*; se il conteggio è fuori scala, è rotto lo strumento. Spoglia
  i file dai commenti prima di estrarre, e per le classi ricorda che una ricerca per sottostringa fa
  sembrare vivo `webmapp-search` solo perché esiste `webmapp-search-box`.
