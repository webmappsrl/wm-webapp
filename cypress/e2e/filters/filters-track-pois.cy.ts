import {clearTestState} from 'cypress/utils/test-utils';

Cypress.config('defaultCommandTimeout', 10000);

/**
 * oc:8684 - Pannello "Filtri" con una track aperta.
 * Fixture e cy.intercept(), nessuna API reale.
 *
 * Nota: `conf-1-filters.json` è `conf-1.json` più `MAP.filters` della conf reale di camminiditalia,
 * con in aggiunta le opzioni `poi_type_accomodation` e `poi_type_camping` (nella conf reale
 * mancano da `filters.poi_types`, ma esistono in `MAP.pois.taxonomies.poi_type`).
 * Anche `MAP.pois.taxonomies.poi_type` viene dalla conf reale: `poiFilters` tiene solo le tipologie
 * selezionate presenti lì, e con quella di conf-1.json la chip cliccata non risultava selezionata.
 */

const ELASTIC_URL = /\/(api\/v2\/elasticsearch|v2\/search)/;
const CONF_URL = /\/(config\.json|conf\/\d+\.json)/;
const TRACK_URL = /\/camminiditalia\/tracks\/183\.json/;
const POIS_URL = /\/camminiditalia\/1\/pois\.geojson/;

const SEARCH = 'rotta%20dei%20due%20mari';
// La sezione delle tipologie POI è l'accordion con value 'poi_types'. `value` è solo una property,
// non un attributo, quindi si filtra in JS invece che con un selettore CSS.
const isPoiTypesAccordion = (_: number, el: HTMLElement) => (el as any).value === 'poi_types';
const poiTypesAccordion = () => cy.get('wm-filters wm-select-filter ion-accordion').filter(isPoiTypesAccordion);

// Il DOM non espone l'identifier della tipologia sulla chip: si usa l'etichetta italiana.
const LABEL_ACCOMODATION = 'Struttura ricettiva';
const LABEL_CATERING = 'Ristorazione';
const LABEL_CAMPING = 'Area tende';

const setupIntercepts = () => {
  cy.intercept('GET', CONF_URL, {fixture: 'conf-1-filters.json'}).as('conf');
  cy.intercept('GET', ELASTIC_URL, {fixture: 'elastic-rotta'}).as('elastic');
  cy.intercept('GET', TRACK_URL, {fixture: 'track-183.json'}).as('track');
  cy.intercept('GET', POIS_URL, {fixture: 'pois-1.json'}).as('pois');
};

const visitWithPrivacy = (url: string) => {
  cy.visit(url, {
    onBeforeLoad(win) {
      win.localStorage.setItem('privacy-accepted', 'true');
      // Le asserzioni usano le etichette italiane: senza, l'app prende la lingua del browser
      // (in CI inglese) e le chip diventano "Accomodation", "Camping" (lang.service.ts, oc:8684)
      win.localStorage.setItem('wm-lang', 'it');
      // Pulisce IndexedDB (localForage) per forzare il reload via HTTP
      const req = win.indexedDB.deleteDatabase('localforage');
      req.onsuccess = () => {};
      req.onerror = () => {};
    },
  });
};

/** Apre il pannello Filtri e l'accordion "Punti di interesse". */
const openPoiTypesSection = () => {
  cy.get('wm-filters .filter-button').click();
  poiTypesAccordion().find('ion-item[slot="header"]').click();
};

const chipOf = (label: string) =>
  poiTypesAccordion().find('ion-chip').contains('ion-label', label).closest('ion-chip');

/** Click sulla track 183 nei risultati della ricerca (tab "Sentieri" se serve). */
const openTrackFromResults = () => {
  cy.get('wm-home-result ion-segment-button[value="tracks"]').click();
  cy.get('wm-home-result ion-segment-button[value="tracks"]').should('have.class', 'segment-button-checked');
  cy.get('wm-home-result wm-search-box ion-card ion-card-title').first().should('be.visible').click();
  cy.url().should('include', 'track=183');
};

describe('FILTRI con track aperta - tipologie dei POI della track (oc:8684)', () => {
  beforeEach(() => {
    // Layout desktop, quello dello screenshot del cliente: a 412px (viewport della CI) la X della
    // track è coperta da wm-profile-button, problema di layout separato (vedi notes.md oc:8684)
    cy.viewport(1280, 800);
    clearTestState();
    setupIntercepts();
  });

  it('apre la track dalla ricerca e il pannello mostra le tipologie dei suoi POI', () => {
    visitWithPrivacy(`/?search=${SEARCH}`);
    cy.wait('@conf');
    cy.wait('@elastic');
    openTrackFromResults();

    cy.url().should('include', 'track=183').and('not.include', 'search=');

    openPoiTypesSection();
    chipOf(LABEL_ACCOMODATION).should('exist').find('.wm-filters-count').should('contain.text', '24');
    chipOf(LABEL_CATERING).find('.wm-filters-count').should('contain.text', '9');
    chipOf(LABEL_CAMPING).find('.wm-filters-count').should('contain.text', '2');
  });

  it('sceglie una tipologia, chiude con la X e il filtro resta selezionato', () => {
    visitWithPrivacy(`/?search=${SEARCH}`);
    cy.wait('@conf');
    cy.wait('@elastic');
    openTrackFromResults();

    openPoiTypesSection();
    chipOf(LABEL_ACCOMODATION).click();
    chipOf(LABEL_ACCOMODATION).should('have.class', 'ion-color-success');

    cy.get('wm-track-properties .webmapp-track-details-dismiss').click();

    // Il ripristino della ricerca con la X è coperto dagli unit test di UrlHandlerService
    // (url-handler.service.spec.ts, closeTrack): qui si verifica solo il pannello.
    cy.url().should('not.include', 'track=');

    // Dopo la chiusura il pannello resta aperto o va riaperto: la chip deve restare selezionata.
    cy.get('body').then($body => {
      const $chips = $body.find('wm-filters wm-select-filter ion-accordion').filter(isPoiTypesAccordion).find('ion-chip');
      if ($chips.length === 0) openPoiTypesSection();
    });
    cy.get('wm-filters .wm-selected-filters .wm-active-filter').should('contain.text', LABEL_ACCOMODATION);
  });

  it('apre direttamente il link del cliente', () => {
    visitWithPrivacy(`/?track=183&search=${SEARCH}`);
    cy.wait('@conf');
    cy.wait('@track');

    cy.url().should('include', 'track=183').and('not.include', 'search=');

    openPoiTypesSection();
    chipOf(LABEL_ACCOMODATION).find('.wm-filters-count').should('contain.text', '24');
    chipOf(LABEL_CATERING).should('exist');
  });
});
