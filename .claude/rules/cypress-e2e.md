---
paths:
  - "cypress/**"
---

# Trappole: test E2E con Cypress

La procedura completa — come si catturano le fixture, il template di un test — sta nel submodule
che quei test esercitano:
[src/app/shared/wm-core/docs/howto/test-e2e-cypress.md](../../src/app/shared/wm-core/docs/howto/test-e2e-cypress.md).

- **`privacy-accepted` va impostato in `onBeforeLoad`, non chiudendo la modale.** La modale privacy
  appare quando `localStorage.privacy-accepted` è assente, e `clearTestState()` svuota il
  localStorage: senza intervento riappare a ogni test. Impostarlo in `onBeforeLoad` la previene
  prima che Angular si avvii, e fa sparire sia i `{force: true}` sia le `cy.wait()` arbitrarie.

  ```typescript
  cy.visit(url, {
    onBeforeLoad(win) {
      win.localStorage.setItem('privacy-accepted', 'true');
    },
  });
  ```

- **Fixture e `cy.intercept()` per i test di logica UI, mai le API reali.** Le API reali valgono
  solo per gli smoke test. Un test di logica che dipende dalla rete è instabile per costruzione e
  non gira in CI senza backend.

- **In CI gira un solo spec**, `cypress/e2e/home/home-layers-tab.cy.ts`: è l'unico basato su
  fixture. Se ne scrivi uno nuovo che dipende da API vive o da credenziali, non aggiungerlo al
  workflow — fallirebbe per motivi che non riguardano il codice.

- **Il percorso non è lo stesso nei due prodotti**: qui è `cypress/e2e/`, nell'app (`webmapp-app`)
  è `core/cypress/e2e/`. Un percorso copiato dall'altro repo non risolve.
