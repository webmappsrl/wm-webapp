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
 */
const {run} = require('./lib/run');

const REMOTE_HOST = 'server';
const REMOTE_PATH = '/var/www/html/camminiditalia.webmapp.it/';
const RSYNC_ARGS = ['-av', '--exclude', 'assets'];

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

run('rsync', [...RSYNC_ARGS, './www-camminiditalia/*', `${REMOTE_HOST}:${REMOTE_PATH}`]);
