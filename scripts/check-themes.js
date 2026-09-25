#!/usr/bin/env node
/**
 * Ferma la build se i temi per istanza non ci sono (oc:8613).
 *
 * I CSS personalizzati dei clienti vivono in wm-core, sotto
 * `projects/wm-core/src/assets/theme/<shard>/<appId>.css`, e `angular.json` li pubblica con una
 * voce di `assets`. Il `<link>` che li carica lo costruisce `meta.component.ts` a runtime, quindi
 * **niente li referenzia a compile-time**: se la cartella è vuota o assente, la glob non trova
 * nulla, non protesta, e la build riesce. Il risultato è un deploy in cui tutte le istanze
 * personalizzate perdono il proprio CSS senza un solo messaggio.
 *
 * Il caso concreto che ha motivato questo controllo: il submodule è pinnato a un commit precedente
 * alla creazione della cartella — condizione normale finché le PR di wm-core non sono mergiate,
 * perché i pin si aggiornano dopo il merge. Prima di oc:8613 un pin indietro dava codice vecchio
 * ma funzionante; da quando i temi stanno nel submodule, dà nove clienti senza personalizzazione.
 *
 * Non controlla quali file ci sono, solo che ce ne sia almeno uno: l'elenco cambia a ogni cliente
 * nuovo, e un controllo che va tenuto allineato a mano è un controllo che prima o poi mente.
 */
const fs = require('fs');
const path = require('path');

const TEMI = path.join(
  __dirname,
  '..',
  'src/app/shared/wm-core/projects/wm-core/src/assets/theme',
);

function conta(dir) {
  if (!fs.existsSync(dir)) return null;
  return fs
    .readdirSync(dir, {withFileTypes: true})
    .filter(e => e.isDirectory())
    .flatMap(e =>
      fs
        .readdirSync(path.join(dir, e.name))
        .filter(f => f.endsWith('.css'))
        .map(f => `${e.name}/${f}`),
    );
}

const trovati = conta(TEMI);

if (trovati == null || trovati.length === 0) {
  console.error('');
  console.error("✖ I temi per istanza non ci sono: la build produrrebbe un'app senza i CSS dei clienti.");
  console.error('');
  console.error(`  Cercati in: ${path.relative(path.join(__dirname, '..'), TEMI)}`);
  console.error(
    trovati == null ? '  La cartella non esiste.' : '  La cartella esiste ma non contiene nessun .css.',
  );
  console.error('');
  console.error('  Causa più probabile: il submodule wm-core è a un commit che precede oc:8613.');
  console.error('  Verifica con:  git -C src/app/shared/wm-core log --oneline -1');
  console.error('  e allinealo al commit della PR di wm-core prima di buildare.');
  console.error('');
  process.exit(1);
}

console.log(`[check-themes] ${trovati.length} temi per istanza trovati: ${trovati.join(', ')}`);
