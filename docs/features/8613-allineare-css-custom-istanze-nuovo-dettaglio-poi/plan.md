> Ticket: oc:8613

# Piano

Ricostruito a lavoro concluso. I passi sono quelli davvero eseguiti, nell'ordine in cui lo sono
stati; il lavoro si è svolto in parallelo su due sessioni, una per prodotto.

## 1 — Trovare i file — ✅

Cercati prima nei posti sbagliati: `global.scss`, le configurations di `angular.json`, la
configurazione dell'app servita dall'API. Trovati risalendo da chi costruisce l'URL,
`meta.component.ts:50`.

## 2 — Inventario — ✅

Nove file per otto app. Sei in `wm-webapp/src/theme/`, tre in `webmapp-app/core/src/theme/`, insiemi
disgiunti. Quattro con lo stesso md5.

## 3 — Audit, statico e a runtime — ✅

Classificato ogni selettore in «aggancia» / «morto» / «non raggiungibile da questa app», su entrambi
i prodotti, percorrendo gli stati invece di dedurli. Esito: **oc:8406 non ha scollegato niente in
questo repo**; sull'app aveva scollegato quattro selettori del tema 75, già corretti.

## 4 — Spostamento in `wm-core` — ✅

I nove file in `projects/wm-core/src/assets/theme/`, identici all'originale (md5 verificato uno per
uno), più una voce di `assets` per repo che punta lì con `output: "theme"`. Verificato che entrambi
i prodotti servano tutti e nove i temi.

## 5 — Riscrittura additiva — ✅

Le regole del tema 75 legate a `wm-map-details` che hanno un equivalente qui: affiancato un secondo
selettore su `.details-container` invece di sostituire il primo. Otto regole, verificate a runtime
sulla webapp con i valori calcolati.

## 6 — Regole non portabili — ✅

Sei restano solo sull'app, per ragioni verificate: tab bar, linguetta del foglio scorrevole, quattro
compensazioni dell'altezza di `ion-card-content`. Nessuna riga scritta.

## 7 — Controllo visivo, app per app — ✅

Ville (75) su entrambi, Sardegna Sentieri (32) e Forestas sulla mobile, FIE (29) e CAI Parma (33)
sulla mobile, Cammini d'Italia su entrambi. Ne sono uscite quattro correzioni, tutte in `notes.md`.

## 8 — Documentazione — ✅

Knowledge, regole di repo e questo cantiere.

## Non fatto, di proposito

Riagganciare le regole inerti di 29 e 33; toccare il tema dell'app 32 oltre a tenerlo allineato ai
tre gemelli; portare le personalizzazioni dentro la app. Le ragioni stanno in `overview.md`.
