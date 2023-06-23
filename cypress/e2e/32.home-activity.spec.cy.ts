import {wmIT} from '../../src/app/shared/wm-core/localization/i18n/it';
const confURL = 'https://geohub.webmapp.it/api/app/webmapp/32/config.json';
describe('HOME:Click sul box "Attività"', () => {
  let conf = null;
  let wmHorizontalScrollBoxConf: IHORIZONTALSCROLLBOX[] = [];
  let wmTitleConf: ITITLEBOX[] = [];
  let wmLayerConf: ILAYERBOX[] = [];
  before(() => {
    // Cypress starts out with a blank slate for each test
    // so we must tell it to visit our website with the `cy.visit()` command.
    // Since we want to visit the same URL at the start of all our tests,
    // we include it in our beforeEach function so that it runs before each test
    cy.request(confURL) // Sostituisci '/your-url' con l'URL desiderato
      .its('body')
      .then(res => {
        conf = res;
        wmHorizontalScrollBoxConf = conf.HOME.filter(el => el.box_type === 'horizontal_scroll');
        wmTitleConf = conf.HOME.filter(el => el.box_type === 'title');
        wmLayerConf = conf.HOME.filter(el => el.box_type === 'layer');
      });
    cy.visit('/');
    cy.get('wm-horizontal-scroll-box').first().find('.wm-box').first().click();
  });

  it('wm-status-filter', () => {
    cy.get('wm-status-filter > ion-grid > ion-row > ion-col')
      .first()
      .should('have.text', 'Filtri attivi 1');

    cy.get('wm-status-filter > ion-grid > ion-row > ion-col')
      .last()
      .should('have.text', 'Torna alla home');

    cy.get('ion-chip').first().should('have.text', 'Escursionismo');
  });
});
