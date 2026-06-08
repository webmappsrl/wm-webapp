import {clearTestState} from 'cypress/utils/test-utils';

Cypress.config('defaultCommandTimeout', 10000);

const ELASTIC_URL = /\/(api\/v2\/elasticsearch|v2\/search)/;
const CONF_URL = /\/(config\.json|conf\/\d+\.json)/;

const setupIntercepts = (elasticFixture: string = 'elastic-init') => {
  cy.intercept('GET', CONF_URL, {fixture: 'conf-1.json'}).as('conf');
  cy.intercept('GET', ELASTIC_URL, {fixture: elasticFixture}).as('elastic');
};

const visitWithPrivacy = (url: string) => {
  cy.visit(url, {
    onBeforeLoad(win) {
      win.localStorage.setItem('privacy-accepted', 'true');
      // Pulisce IndexedDB (localForage) per forzare il reload della conf via HTTP
      const req = win.indexedDB.deleteDatabase('localforage');
      req.onsuccess = () => {};
      req.onerror = () => {};
    },
  });
};

const waitForApp = () => {
  cy.wait('@conf');
  cy.wait('@elastic');
};

describe('HOME layers tab - ricerca per layer/cammino (oc:7643)', () => {
  beforeEach(() => {
    clearTestState();
  });

  describe('Scenario 1: ricerca che matcha layer e sentieri (?search=bolo)', () => {
    before(() => {
      clearTestState();
      setupIntercepts('elastic-bolo');
      visitWithPrivacy('/?search=bolo');
      waitForApp();
    });

    it('deve mostrare il tab LAYERS come primo tab', () => {
      cy.get('wm-home-result ion-segment ion-segment-button')
        .first()
        .should('have.attr', 'value', 'layers');
    });

    it('deve mostrare il tab LAYERS come attivo di default', () => {
      cy.get('wm-home-result ion-segment ion-segment-button[value="layers"]').should(
        'have.class',
        'segment-button-checked',
      );
    });

    it('deve mostrare il tab TRACKS come secondo tab', () => {
      cy.get('wm-home-result ion-segment ion-segment-button[value="tracks"]').should('exist');
    });

    it('il tab LAYERS deve mostrare il contatore > 0', () => {
      cy.get('wm-home-result ion-segment ion-segment-button[value="layers"] span').should(
        'not.have.text',
        '0',
      );
    });

    it('il contenuto del tab LAYERS deve mostrare wm-layer-box', () => {
      cy.get('wm-home-result .layers wm-layer-box').should('have.length.gt', 0);
    });
  });

  describe('Scenario 1b: contatore layer corretto (?search=camm → 72 layer)', () => {
    before(() => {
      clearTestState();
      setupIntercepts('elastic-camm');
      visitWithPrivacy('/?search=camm');
      waitForApp();
    });

    it('deve mostrare 72 layer con search=camm', () => {
      cy.get('wm-home-result ion-segment ion-segment-button[value="layers"] span').should(
        'have.text',
        '72',
      );
    });
  });

  describe('Scenario 2: ricerca senza match layer (?search=xyz123nomatch)', () => {
    before(() => {
      clearTestState();
      setupIntercepts('elastic-nomatch');
      visitWithPrivacy('/?search=xyz123nomatch');
      waitForApp();
    });

    it('non deve mostrare il tab LAYERS', () => {
      cy.get('wm-home-result ion-segment ion-segment-button[value="layers"]').should('not.exist');
    });
  });

  describe('Scenario 3: click esplicito su tab SENTIERI', () => {
    before(() => {
      clearTestState();
      setupIntercepts('elastic-bolo');
      visitWithPrivacy('/?search=bolo');
      waitForApp();
      cy.get('wm-home-result ion-segment ion-segment-button[value="tracks"]').click();
    });

    it('deve attivare il tab TRACKS dopo click', () => {
      cy.get('wm-home-result ion-segment ion-segment-button[value="tracks"]').should(
        'have.class',
        'segment-button-checked',
      );
    });

    it('deve mostrare wm-search-box nel tab TRACKS', () => {
      cy.get('wm-home-result wm-search-box').should('have.length.gt', 0);
    });

    it('il div .layers non deve essere visibile nel tab TRACKS', () => {
      cy.get('wm-home-result .layers').should('not.exist');
    });
  });

  describe('Scenario 4: layer già aperto + ricerca (?layer=55&search=alta)', () => {
    before(() => {
      clearTestState();
      setupIntercepts('elastic-layer55-alta');
      visitWithPrivacy('/?layer=55&search=alta');
      waitForApp();
    });

    it('non deve mostrare il tab LAYERS quando un layer è aperto', () => {
      cy.get('wm-home-result ion-segment ion-segment-button[value="layers"]').should('not.exist');
    });

    it('deve mostrare il tab TRACKS attivo', () => {
      cy.get('wm-home-result ion-segment ion-segment-button[value="tracks"]').should(
        'have.class',
        'segment-button-checked',
      );
    });
  });

  describe('Scenario 5: click su box layer naviga al layer e pulisce la ricerca', () => {
    before(() => {
      clearTestState();
      setupIntercepts('elastic-bolo');
      visitWithPrivacy('/?search=bolo');
      waitForApp();
      cy.intercept('GET', ELASTIC_URL, {fixture: 'elastic-init'}).as('elasticAfterNav');
      cy.get('wm-home-result .layers wm-layer-box .wm-box').first().click();
      cy.wait(500);
    });

    it('deve navigare alla vista layer (URL con ?layer=)', () => {
      cy.url().should('include', 'layer=');
    });

    it('non deve avere search nell URL dopo il click sul layer', () => {
      cy.url().should('not.include', 'search=');
    });
  });

  describe('Scenario 6: nessun risultato track — no messaggio "Spiacenti" con layer matches', () => {
    before(() => {
      clearTestState();
      setupIntercepts('elastic-cammino');
      visitWithPrivacy('/?search=cammino');
      waitForApp();
    });

    it('non deve mostrare "Spiacenti" se ci sono layer matches', () => {
      cy.get('wm-home-result').should('not.contain.text', 'Spiacenti non ci sono risultati');
    });
  });

  describe('Scenario 7: badge contatore non influenzato dalla ricerca', () => {
    it('deve mostrare lo stesso contatore badge con ricerche diverse sullo stesso layer', () => {
      clearTestState();
      cy.intercept('GET', CONF_URL, {fixture: 'conf-1.json'}).as('conf1');
      cy.intercept('GET', ELASTIC_URL, {fixture: 'elastic-bolo'}).as('elastic1');
      visitWithPrivacy('/?search=bolo');
      cy.wait('@conf1');
      cy.wait('@elastic1');

      cy.get('wm-home-result .layers wm-layer-box wm-layer-features-counter-badge')
        .first()
        .invoke('text')
        .then(countWithBolo => {
          clearTestState();
          cy.intercept('GET', CONF_URL, {fixture: 'conf-1.json'}).as('conf2');
          cy.intercept('GET', ELASTIC_URL, {fixture: 'elastic-bolog'}).as('elastic2');
          visitWithPrivacy('/?search=bolog');
          cy.wait('@conf2');
          cy.wait('@elastic2');

          cy.get('wm-home-result .layers wm-layer-box wm-layer-features-counter-badge')
            .first()
            .invoke('text')
            .should('eq', countWithBolo);
        });
    });
  });

  describe('Scenario 8: cambio input resetta il tab attivo al default', () => {
    before(() => {
      clearTestState();
      cy.intercept('GET', CONF_URL, {fixture: 'conf-1.json'}).as('conf');
      cy.intercept('GET', ELASTIC_URL, {fixture: 'elastic-bolo'}).as('elasticBolo');
      visitWithPrivacy('/?search=bolo');
      cy.wait('@conf');
      cy.wait('@elasticBolo');

      cy.get('wm-home-result ion-segment ion-segment-button[value="tracks"]').click();

      cy.intercept('GET', ELASTIC_URL, {fixture: 'elastic-cammino'}).as('elasticCamm');
      cy.get('wm-searchbar ion-input input').clear({force: true}).type('camm', {force: true});
      cy.wait('@elasticCamm');
    });

    it('deve tornare al tab LAYERS come default dopo nuovo input', () => {
      cy.get('wm-home-result ion-segment ion-segment-button[value="layers"]').should(
        'have.class',
        'segment-button-checked',
      );
    });
  });
});
