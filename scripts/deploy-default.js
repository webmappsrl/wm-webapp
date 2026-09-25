#!/usr/bin/env node
/**
 * Deploy web condiviso multi-tenant: app.geohub.webmapp.it/ serve tutti gli
 * shard con lo stesso bundle — EnvironmentService (wm-core) decide lo shard
 * a runtime leggendo l'hostname.
 *
 * In CI (variabile SSHPASS impostata) l'autenticazione SSH è a password:
 * `scp` viene eseguito tramite `sshpass -e scp` (non supporta RSYNC_RSH).
 * In locale (SSHPASS assente) si assume autenticazione a chiave già
 * configurata in ~/.ssh/config, quindi `scp` viene lanciato direttamente.
 */
const {run} = require('./lib/run');

const REMOTE = 'server:/var/www/html/app.geohub.webmapp.it/';

// `ionic build` non passa da `npm run build`, quindi il gate su `prebuild` qui non scatterebbe:
// il controllo va chiamato a mano (oc:8613). Senza, un submodule indietro produce un deploy in cui
// tutte le istanze personalizzate perdono il proprio CSS, con la build verde.
run('node', ['scripts/check-themes.js']);

run('ionic', ['build', '--prod']);

if (process.env.SSHPASS) {
  run('sshpass', ['-e', 'scp', '-r', './www/*', REMOTE]);
} else {
  run('scp', ['-r', './www/*', REMOTE]);
}
