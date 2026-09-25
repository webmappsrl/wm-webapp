> Ticket: oc:8613

# Allineare i CSS custom delle istanze al nuovo dettaglio POI condiviso

> Cantiere scritto **a lavoro concluso**: il ticket è nato come verifica e si è trasformato in
> un'unificazione mentre lo si faceva. Overview e piano raccontano quindi il lavoro com'è stato,
> non com'era stato previsto.

## Cosa chiedeva il ticket

Nato dallo scrum del 21/09/2026: oc:8406 aveva riscritto il markup del dettaglio POI, e Giuseppe
Bonfanti ha chiesto di controllare le istanze con CSS personalizzato prima di andare in produzione —
«se andiamo in produzione con sta roba sulla web app senza aver rivisto i CSS si spacca tutto».

## Cosa è cambiato in corsa

Lo scrum del 25/09 ha aggiunto una decisione che ha cambiato la natura del lavoro: **dove una
personalizzazione esiste su un prodotto solo, la si porta su entrambi.** Da verifica il ticket è
diventato uno spostamento dei temi in `wm-core`.

## Cosa è stato fatto

1. **Trovato dove vivono i CSS per istanza**, che era il punto aperto del ticket: `meta.component.ts:50`
   di `wm-core` costruisce `theme/<shardName>/<appId>.css` e lo inietta come `<link id="client-theme">`.
   I file stavano nelle cartelle `src/theme/` dei due prodotti.
2. **Audit dei nove temi**, statico e a runtime su entrambi i prodotti.
3. **Spostamento in `wm-core`**, `projects/wm-core/src/assets/theme/`, con una voce di `assets` per
   repo. Da qui ogni app vede il suo tema su entrambe le piattaforme.
4. **Riscrittura additiva** delle regole del tema di Ville legate al contenitore dell'app, perché
   valgano anche qui senza cambiare la resa lì.
5. **Correzioni emerse dal controllo visivo**: alias dell'icon font, due regole di prodotto in
   `global.scss`, `order` sullo slot `[bottom]`, fondo del chip "Torna alla home".

## Requisiti, come si sono assestati

- **oc:8406 non deve aver rotto nessun CSS di cliente.** Verificato: nessuno dei selettori inerti
  trovati in questo repo è stato scollegato da oc:8406, sono assenti anche su `develop`.
- **La resa delle app personalizzate non deve cambiare** rispetto allo stato attuale, salvo dove la
  modifica è voluta. La forma additiva serve a questo: il ramo che già funzionava resta intatto.
- **Le distinzioni fra i due prodotti restano dove servono**: una regola che dipende da com'è fatto
  il contenitore di un prodotto non si traduce, resta sua.

## Out of scope

- **Riagganciare le regole inerti di FIE (29) e CAI Parma (33)**: 14 `order` su 20 non agganciano da
  prima di `develop`. Riscriverle cambierebbe l'aspetto di due app di clienti verso un layout mai
  visto. Decisione: la baseline è lo stato attuale.
- **Spegnere o cancellare il tema dell'app 32**: Giuseppe ha detto che «la 32 non viene usata più,
  diventa la uno», ma anche «ora non lo facciamo perché in produzione ancora la vedono».
- **Portare le personalizzazioni dentro la app**, come design system: direzione dichiarata nello
  scrum del 25/09, esplicitamente futura.
- **Il ramo UGC**, già fuori da oc:8406.

## Moduli toccati

- `wm-core`: `projects/wm-core/src/assets/theme/` (nove file), `track-properties.component.scss`
- `wm-webapp`: `angular.json`, `src/theme/`, `src/global.scss`,
  `src/assets/icons/webmapp-icons/style.css`
- `webmapp-app`: `core/angular.json`, `core/src/theme/`
