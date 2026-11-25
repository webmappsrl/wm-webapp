#!/usr/bin/env node
/**
 * Deploy web dedicato a camminiditalia: camminiditalia.webmapp.it/
 * riceve un bundle separato dal deploy condiviso (app.geohub.webmapp.it/),
 * necessario perché fileReplacements/--configuration di Angular agiscono
 * a compile-time — un bundle con home-layer.component.camminiditalia.ts e
 * search-bar.component.camminiditalia.ts "baked in" non può essere servito
 * dal deploy condiviso, altrimenti lo vedrebbero anche gli altri clienti
 * (vedi angular.json, configuration "camminiditalia").
 *
 * --output-path=www-camminiditalia: cartella separata da www/ per non
 * sovrascrivere l'output della build generica quando i due script girano
 * in sequenza.
 *
 * La cartella remota non esiste ancora sul server al momento in cui questo
 * script è stato scritto (oc:8512) — il comando `ssh ... mkdir -p` la crea
 * se assente, senza fallire se è già presente.
 *
 * In CI (variabile SSHPASS impostata) l'autenticazione SSH è a password:
 * il comando `ssh` (mkdir remoto) viene eseguito tramite `sshpass -e ssh`.
 * `rsync` non necessita di questo wrapping esplicito: rispetta nativamente
 * la variabile RSYNC_RSH impostata dal workflow CI.
 *
 * Deploy veloce e deploy completo (oc:9042). Senza argomenti lo script
 * passa a rsync `--exclude assets`: un pattern senza `/` iniziale esclude
 * OGNI cartella `assets` a qualunque profondità, quindi non solo `assets/`
 * ma anche `map-core/assets/` (l'icona delle frecce sulle track: senza,
 * sulla mappa resta solo il disco bianco sotto la freccia). È il deploy di
 * `npm run deploy` e della CI. Con `--full`
 * (`npm run deploy-camminiditalia-full`) l'esclusione non viene passata e
 * la build arriva per intera: si lancia a mano quando cambia un asset o
 * quando si prepara un server nuovo.
 */
const {run} = require('./lib/run');

const REMOTE_HOST = 'server';
const REMOTE_PATH = '/var/www/html/camminiditalia.webmapp.it/';
const FULL = process.argv.includes('--full');
const RSYNC_ARGS = FULL ? ['-av'] : ['-av', '--exclude', 'assets'];

// Come in deploy-default.js: `ionic build` non passa da `npm run build`, quindi il gate su
// `prebuild` non scatterebbe e il controllo va chiamato a mano (oc:8613).
run('npm', ['run', 'check-themes']);

run('ionic', [
  'build',
  '--configuration=production,camminiditalia',
  '--',
  '--output-path=www-camminiditalia',
]);

if (process.env.SSHPASS) {
  run('sshpass', ['-e', 'ssh', REMOTE_HOST, `mkdir -p ${REMOTE_PATH}`]);
} else {
  run('ssh', [REMOTE_HOST, `mkdir -p ${REMOTE_PATH}`]);
}

console.log(
  FULL
    ? '[deploy-camminiditalia] deploy completo, assets compresi'
    : '[deploy-camminiditalia] deploy veloce, cartelle assets escluse',
);
run('rsync', [...RSYNC_ARGS, './www-camminiditalia/*', `${REMOTE_HOST}:${REMOTE_PATH}`]);
