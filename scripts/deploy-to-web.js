#!/usr/bin/env node
/**
 * Orchestratore: esegue in sequenza tutti i deploy web.
 * Per aggiornare un solo target, lanciare direttamente lo script dedicato
 * (npm run deploy-default / npm run deploy-camminiditalia).
 */
const {run} = require('./lib/run');

run('node', ['scripts/deploy-to-web-default.js']);
run('node', ['scripts/deploy-to-web-camminiditalia.js']);

console.log('\n[deploy-to-web] Completato: app.geohub.webmapp.it + camminiditalia.webmapp.it');
