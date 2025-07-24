import {
  clearTestState,
  confURL,
  e2eLogin,
  openUgcBox,
  originUrl,
  waitMapReady,
} from 'cypress/utils/test-utils';

const clickPosition = [478.18231201171875, 335.328125];
const poiTitle = 'Draw ugc poi title test e2e';

describe('Draw UGC POI', () => {
  beforeEach('should draw a UGC POI', () => {
    clearTestState();
  });

  it('should request login if enabled in conf after click draw poi button', () => {
    mockConfWithLoginAndDrawEnabled().as('getConf');
    cy.visit('/');
    clickDrawUgcPoi();

    cy.get('ion-modal > wm-profile-auth').should('be.visible');
  });

  it('should draw an ugc poi after login', () => {
    mockConfWithLoginAndDrawEnabled().as('getConf');
    cy.visit('/');
    e2eLogin();
    cy.get('ion-alert button').click();

    clickDrawUgcPoi();
    cy.get('.ol-viewport .ol-layer canvas').click(clickPosition[0], clickPosition[1]);
    cy.get('ion-input[ng-reflect-name="title"] input').should('be.visible').click().type(poiTitle);

    mockSaveApiPoi().as('saveApiPoi');
    cy.get('wm-draw-ugc ion-button').click();
    cy.get('ion-alert .alert-button').should('be.visible').click();
    cy.wait('@saveApiPoi');
    cy.get('wm-draw-ugc').should('not.exist');
    cy.get('[e2e-draw-button-exit]').should('be.visible').click();
  });

  it('should draw an ugc poi without auth enabled', () => {
    mockConfWithOnlyDrawEnabled().as('getConf');
    cy.visit('/');

    waitMapReady();
    clickDrawUgcPoi();
    cy.get('.ol-viewport .ol-layer canvas').click(clickPosition[0], clickPosition[1]);

    cy.get('ion-input[ng-reflect-name="title"] input').should('be.visible').click().type(poiTitle);
    cy.get('wm-draw-ugc ion-button').click();
    cy.get('ion-alert .alert-button').should('be.visible').click();

    openUgcBox();
    cy.get('wm-poi-box')
      .contains('.wm-box-name', poiTitle)
      .parent()
      .within(() => {
        cy.get('wm-ugc-synchronized-badge ion-icon[name="cloud-offline-outline"]').should('exist');
      });
    cy.get('[e2e-draw-button-exit]').should('be.visible').click();
  });
});

function clickDrawUgcPoi() {
  cy.get('[e2e-draw-button]').should('be.visible').click();
  cy.get('[e2e-draw-button-poi]').should('be.visible').click();
}

function mockConfWithLoginAndDrawEnabled(): Cypress.Chainable {
  return cy.intercept('GET', confURL, req => {
    req.reply(res => {
      const newRes = {
        ...res.body,
        AUTH: {
          ...res.body.AUTH,
          enable: true,
          webappEnable: true,
        },
        WEBAPP: {
          ...res.body.WEBAPP,
          draw_track_show: true,
          draw_poi_show: true,
        },
      };
      res.send(newRes);
    });
  });
}

function mockConfWithOnlyDrawEnabled(): Cypress.Chainable {
  return cy.intercept('GET', confURL, req => {
    req.reply(res => {
      const newRes = {
        ...res.body,
        WEBAPP: {
          ...res.body.WEBAPP,
          draw_track_show: true,
          draw_poi_show: true,
        },
      };
      res.send(newRes);
    });
  });
}

function mockSaveApiPoi(): Cypress.Chainable {
  return cy.intercept('POST', `${originUrl}/api/v2/ugc/poi/store`, req => {
    const bodyString = Array.isArray(req.body) ? req.body.join('') : req.body;
    req.reply({
      statusCode: 200,
      body: {success: true},
    });
    expect(bodyString).to.include(poiTitle);
  });
}
