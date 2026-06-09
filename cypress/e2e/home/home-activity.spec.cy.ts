// TODO(oc:8022): migra a fixture + cy.intercept() per CI.
// Usa home-layers-tab.cy.ts come riferimento: cy.fixture() + cy.intercept() su CONF_URL e ELASTIC_URL.
import {clearTestState} from 'cypress/utils/test-utils';
import {environment} from 'src/environments/environment';

Cypress.config('defaultCommandTimeout', 10000);

describe.skip('HOME:Click sul box "Attività" — TODO: migra a fixture + cy.intercept() per CI, vedi home-layers-tab.cy.ts', () => {
  const appId = environment.appId;
  const confURL = `https://geohub.webmapp.it/api/app/webmapp/${appId}/config.json`;
  let wmHorizontalScrollBoxConf: any[] = [];

  before(() => {
    clearTestState();
    cy.request(confURL)
      .its('body')
      .then(conf => {
        wmHorizontalScrollBoxConf = conf.HOME.filter(el => el.box_type === 'horizontal_scroll');
        cy.visit('/');
        cy.intercept('GET', '/');
        if (wmHorizontalScrollBoxConf.length > 0) {
          cy.get('wm-horizontal-scroll-box').first().find('.wm-box').first().click();
        } else {
          cy.log(
            `SKIP(wm-horizontal-scroll-box): non presente nella HOME della app con id ${appId}`,
          );
        }
      });
  });

  it('wm-status-filter', () => {
    if (wmHorizontalScrollBoxConf.length > 0) {
      cy.get('wm-status-filter > ion-grid > ion-row > ion-col')
        .first()
        .should('include.text', 'Filtri attivi');

      cy.get('wm-status-filter > ion-grid > ion-row > ion-col')
        .last()
        .should('have.text', 'Torna alla home');

      cy.get('ion-chip').first().should('have.text', 'Torna alla home');
    } else {
      cy.log(`SKIP(wm-status-filter): non presente nella HOME della app con id ${appId}`);
    }
  });

  after(() => {
    clearTestState();
  });
});
