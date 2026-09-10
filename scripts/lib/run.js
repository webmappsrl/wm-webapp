const {spawnSync} = require('child_process');

/**
 * Esegue un comando ereditando stdio, esce con lo stesso exit code in caso
 * di fallimento — stesso comportamento di `&&` in shell, ma con un
 * messaggio esplicito su quale comando è fallito.
 */
function run(command, args) {
  console.log(`\n$ ${command} ${args.join(' ')}`);
  const result = spawnSync(command, args, {stdio: 'inherit', shell: true});
  if (result.status !== 0) {
    console.error(`Comando fallito (exit ${result.status}): ${command} ${args.join(' ')}`);
    process.exit(result.status ?? 1);
  }
}

module.exports = {run};
