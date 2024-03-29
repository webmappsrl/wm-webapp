import {clearTestState} from 'cypress/utils/test-utils';
import {environment} from 'src/environments/environment';
import {IHORIZONTALSCROLLBOX, ILAYERBOX, ITITLEBOX} from 'wm-core/types/config';

Cypress.config('defaultCommandTimeout', 10000);
const appId = environment.geohubId;
const confURL = `https://geohub.webmapp.it/api/app/webmapp/${appId}/config.json`;
let wmHorizontalScrollBoxConf: IHORIZONTALSCROLLBOX[] = [];
let wmTitleConf: ITITLEBOX[] = [];
let wmLayerConf: ILAYERBOX[] = [];

before(() => {
  clearTestState();
  cy.request(confURL)
    .its('body')
    .then(conf => {
      wmHorizontalScrollBoxConf = conf.HOME.filter(el => el.box_type === 'horizontal_scroll');
      wmTitleConf = conf.HOME.filter(el => el.box_type === 'title');
      wmLayerConf = conf.HOME.filter(el => el.box_type === 'layer');
      cy.visit('/');
      cy.intercept('GET', '/');
      if (wmHorizontalScrollBoxConf.length > 0) {
        cy.get('wm-horizontal-scroll-box').first().find('.wm-box').first().click();
      } else {
        cy.log(`SKIP(wm-horizontal-scroll-box): non presente nella HOME della app con id ${appId}`);
      }
    });
});

describe('HOME:Click sul box "Attività"', () => {
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
});

after(() => {
  clearTestState();
});
