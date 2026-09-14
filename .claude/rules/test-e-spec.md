---
paths:
  - "src/app/**/*.spec.ts"
  - "tsconfig.spec.json"
  - "angular.json"
---

# Trappole: registrazione degli spec

Il perché sta in [docs/knowledge/test-di-questo-repo.md](../../docs/knowledge/test-di-questo-repo.md).

- **Un nuovo spec fuori da `src/app/shared/` va registrato in due posti**, non uno:
  `tsconfig.spec.json` → `include`, e `angular.json` → `projects.app.architect.test.options.include`.
  Angular CLI scopre gli spec con uno scanner proprio, che legge `angular.json`; se un file viene
  scoperto lì ma non è nel programma TypeScript, il test fallisce con **«missing from TypeScript
  compilation»** — un messaggio che non dice quale delle due configurazioni manca.

- **Gli spec dei submodule non si aggiungono qui.** `src/app/shared/**` è escluso di proposito:
  ogni submodule ha il proprio setup di test nel proprio repo, e includerli da qui li farebbe
  girare due volte con configurazioni diverse.
