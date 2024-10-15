import { clearTestState, e2eLogin } from "cypress/utils/test-utils";
import { environment } from "src/environments/environment";

Cypress.config('defaultCommandTimeout', 10000);

const appId = environment.geohubId;
const awsApi = environment.awsApi;
const geohubApi = environment.api;
const confURL = `${awsApi}/conf/${appId}.json`;

describe('UGC', () => {
  let confAuthEnable: boolean;

  before(() => {
    clearTestState();
    cy.request(confURL)
      .its('body')
      .then(conf => {
        confAuthEnable = conf.AUTH.enable;
      });
  });

  it('Should show the user profile button if confAuthEnable is true', () => {
    cy.visit('/');

    if (confAuthEnable) {
      cy.get('.wm-profile-button').should('exist');
    } else {
      cy.get('.wm-profile-button').should('not.exist');
    }
  });

  describe('When confAuthEnable is true and the user is logged in', () => {
    let tracksData = null;  // Variabile per tracce
    let poisData = null;    // Variabile per POI

    before(() => {
      if (confAuthEnable) {
        cy.intercept('GET', `${geohubApi}/api/ugc/track/index`).as('getTracks');
        cy.intercept('GET', `${geohubApi}/api/ugc/poi/index`).as('getPois');
        e2eLogin();
        cy.get('ion-alert button').click();
        // Recupera i dati delle tracce e POI e salvali in variabili
        cy.wait('@getTracks').then((interception) => {
          tracksData = interception.response?.body.features || [];
        });
        cy.wait('@getPois').then((interception) => {
          poisData = interception.response?.body.features || [];
        });
      } else {
        cy.log('Test skipped because confAuthEnable is false');
        return;
      }
    });

    it('Should show wm-ugc-box', () => {
      cy.get('wm-home-page wm-ugc-box').should('exist');
      cy.get('wm-home-page wm-ugc-box').click();
    });

    it('Should correctly display track data', () => {
      const trackCount = tracksData.length;
      if (trackCount > 0) {
        cy.get('wm-home-result ion-segment-button[value="tracks"]')
          .should('be.visible')
          .within(() => {
            cy.get('span').should('contain', trackCount);
          });

        const firstTrackName = tracksData[0]?.properties.name;
        cy.get('wm-home-result wm-search-box').first().within(() => {
          cy.get('ion-card-title').should('contain', firstTrackName);
        });
      } else {
        cy.get('wm-home-result ion-segment-button[value="track"]').should('not.exist');
      }
    });

    it('Should correctly display POI data', () => {
      const poiCount = poisData.length;
      if (poiCount > 0) {
        cy.get('wm-home-result ion-segment-button[value="pois"]')
          .should('be.visible')
          .within(() => {
            cy.get('span').should('contain', poiCount);
          });

        const firstPoiName = poisData[0]?.properties.name;
        cy.get('wm-home-result ion-segment-button[value="pois"]').click();
        cy.get('wm-home-result .pois wm-poi-box').first().within(() => {
          cy.get('.wm-box-name').should('contain', firstPoiName);
        });
      } else {
        cy.get('wm-home-result ion-segment-button[value="poi"]').should('not.exist');
      }
    });
  });
});
