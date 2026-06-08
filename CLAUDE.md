# wm-webapp — CLAUDE.md

## Architettura submoduli

Ordine di dipendenza: `wm-types` → `wm-core` → `wm-webapp`

- `wm-types`: interfacce TypeScript condivise (niente logica)
- `wm-core`: componenti Angular, store NgRx, effetti, selettori
- `wm-webapp`: app shell, environment, routing

## Test E2E con Cypress

Il pattern completo (intercept, fixture, `visitWithPrivacy`, motivazioni) è documentato in `src/app/shared/wm-core/CLAUDE.md`.

