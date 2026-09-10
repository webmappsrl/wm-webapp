#!/usr/bin/env node
/**
 * Wrapper per `ng serve`: legge shardName da src/environments/environment.ts
 * e, solo se esiste una build configuration con lo stesso nome in angular.json,
 * lancia `ng serve --configuration=<shardName>`. Altrimenti fa `ng serve` semplice.
 *
 * Necessario perché fileReplacements (angular.json) decide QUALE environment.ts
 * finisce nel bundle a compile-time — non può quindi anche leggerne il contenuto
 * per auto-selezionarsi. Questo script fa da ponte tra i due, evitando di dover
 * ricordare --configuration a mano.
 */
const fs = require('fs');
const path = require('path');
const {spawnSync} = require('child_process');

const envPath = path.join(__dirname, '..', 'src', 'environments', 'environment.ts');
const angularJsonPath = path.join(__dirname, '..', 'angular.json');

function readShardName() {
  const content = fs.readFileSync(envPath, 'utf8');
  const match = content.match(/shardName:\s*['"]([^'"]+)['"]/);
  return match ? match[1] : null;
}

function readAvailableConfigurations() {
  const angularJson = JSON.parse(fs.readFileSync(angularJsonPath, 'utf8'));
  const configurations = angularJson.projects.app.architect.serve.configurations || {};
  return Object.keys(configurations);
}

function matchConfiguration(shardName, availableConfigurations) {
  if (!shardName) return null;
  // Match esatto prima, poi "shardName inizia per <configuration>" per coprire
  // varianti dev/prod dello stesso shard (es. "camminiditaliadev" → "camminiditalia").
  if (availableConfigurations.includes(shardName)) return shardName;
  const prefixMatches = availableConfigurations
    .filter(name => shardName.startsWith(name))
    .sort((a, b) => b.length - a.length);
  return prefixMatches[0] ?? null;
}

const shardName = readShardName();
const availableConfigurations = readAvailableConfigurations();
const matchedConfiguration = matchConfiguration(shardName, availableConfigurations);

const extraArgs = process.argv.slice(2);
const args = ['serve'];

if (matchedConfiguration) {
  console.log(`[serve.js] shardName "${shardName}" → --configuration=${matchedConfiguration}`);
  args.push(`--configuration=${matchedConfiguration}`);
} else {
  console.log(
    `[serve.js] shardName "${shardName}" non ha una configuration dedicata — ng serve senza flag`,
  );
}

args.push(...extraArgs);

const result = spawnSync('ng', args, {stdio: 'inherit', shell: true});
process.exit(result.status ?? 0);
