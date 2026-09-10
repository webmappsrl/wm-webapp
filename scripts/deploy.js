#!/usr/bin/env node
/**
 * Orchestratore: esegue in sequenza tutti i deploy web.
 * Per aggiornare un solo target, lanciare direttamente lo script dedicato
 * (npm run deploy-default / npm run deploy-camminiditalia).
 */
const {run} = require('./lib/run');

run('node', ['scripts/deploy-default.js']);
run('node', ['scripts/deploy-camminiditalia.js']);

console.log('\n[deploy] Completato: app.geohub.webmapp.it + camminiditalia.webmapp.it');
