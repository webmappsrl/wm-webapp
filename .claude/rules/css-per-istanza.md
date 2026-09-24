---
paths:
  - "src/theme/**"
  - "src/app/components/**/*.html"
  - "src/app/shared/wm-core/projects/wm-core/src/**/*.html"
---

# Trappole: CSS custom per istanza

Il perché sta in [docs/knowledge/css-custom-per-istanza.md](../../docs/knowledge/css-custom-per-istanza.md).

- **Rinominare un selettore o una classe può scollegare il CSS di un cliente, in silenzio.** I sei
  file `src/theme/<shard>/<appId>.css` puntano ai nomi dei componenti condivisi — elementi come
  `wm-tab-description`, classi come `.wm-track-details-activities`. Non sono referenziati da nessuna
  build: il `<link>` è costruito a runtime da `meta.component.ts:50` in `wm-core`. Nessun compilatore,
  nessun test e nessun lint segnalerà mai il drift. Dopo una rinomina, cerca il vecchio nome in
  `src/theme/`, e ricordati che gli stessi nomi sono presi di mira anche da `webmapp-app/core/src/theme/`.

- **Un figlio flex senza `order` vale 0, quindi va in cima, non in fondo.** `wm-track-properties` è
  `display: flex; flex-direction: column`, e `29.css` e `33.css` riordinano le sue sezioni con
  `order`. Se un selettore si scollega, quella sezione non perde solo il suo stile: **risale sopra
  tutte le altre**. È il difetto che ha portato "Informazioni" sotto al nome nel dettaglio POI della
  mobile (oc:8406/oc:8613).

- **Un file di tema che manca non è un errore.** L'URL è costruito, non dichiarato: un'app senza
  `theme/<shard>/<appId>.css` prende un 404 e resta senza personalizzazione. Prima di concludere che
  «la webapp rende diversamente dalla mobile», controlla se il file esiste da una parte sola — è
  quello che succede con l'app 75, che ce l'ha solo nella mobile.

- **L'audit degli orfani si fa con ERE POSIX, dove `\s` non esiste.** Usarlo fa restituire zero
  selettori reali e marca orfano *tutto*. Se il conteggio è fuori scala, è rotto lo strumento:

  ```bash
  grep -rhoE "selector: *'[^']+'" src/app --include="*.ts" | sed "s/selector: *'//;s/'$//" \
    | tr ',' '\n' | sed 's/^ *//;s/ *$//' | grep -E "^(wm|webmapp)-" | sort -u > /tmp/sel.txt
  grep -ohE "(^|[ ,>~+])(wm|webmapp)-[a-z0-9-]+" src/theme/*/*.css | sed 's/^[ ,>~+]//' \
    | sort -u | comm -23 - /tmp/sel.txt
  ```

  Spoglia i file dai commenti prima di estrarre, altrimenti i `/* start wm-home-page component */`
  entrano nell'elenco come falsi orfani. E per le **classi** serve un secondo passaggio: un nome
  cercato come sottostringa combacia con un altro più lungo — `webmapp-search` sembra esistere solo
  perché esiste `webmapp-search-box`.
