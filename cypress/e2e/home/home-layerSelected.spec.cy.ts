import {FeatureCollection} from 'geojson';
import {filterFeatureCollectionByInputTyped as filterFeatureCollectionByInputTypedFn} from '../../../src/app/shared/wm-core/store/api/utils';

const confURL = 'https://geohub.webmapp.it/api/app/webmapp/33/config.json';
const apiURL = 'https://elastic-json.webmapp.it/search/?id=33&layer=164';
const poisURL = 'https://geohub.webmapp.it/api/v1/app/33/pois.geojson';

describe('HOME_layerSelected', () => {
  let conf = null;
  let elasticRes = null;
  let tracks = [];
  let poisCountExpected = 0;
  let tracksCountExpected = 0;
  let wmTitleConf: ITITLEBOX[] = [];
  let wmLayerConf: ILAYERBOX[] = [];
  let filterFeatureCollectionByInputTyped: FeatureCollection;

  before(() => {
    cy.request(confURL)
      .its('body')
      .then(res => {
        conf = res;
        wmTitleConf = conf.HOME.filter(el => el.box_type === 'title');
        wmLayerConf = conf.HOME.filter(el => el.box_type === 'layer');
      });
    cy.request(apiURL)
      .its('body')
      .then(res => {
        elasticRes = res;
        tracks = elasticRes?.hits?.hits;
        tracksCountExpected = elasticRes?.hits?.total?.value ?? 0;
      });
    cy.request(poisURL)
      .its('body')
      .then(featureCollection => {
        filterFeatureCollectionByInputTyped = filterFeatureCollectionByInputTypedFn(
          featureCollection,
          '',
        );
        poisCountExpected = filterFeatureCollectionByInputTyped.features.length ?? 0;
      });

    cy.visit('/');
    cy.intercept('GET', poisURL).as('getPois');
    cy.get('wm-layer-box').first().click();
    cy.wait('@getPois').its('response.statusCode').should('eq', 200);
  });

  it('wm-status-filter: should show "Filtri attivi" button text', () => {
    cy.get('wm-status-filter > ion-grid > ion-row > ion-col')
      .first()
      .should('include.text', 'Filtri attivi');
  });
  it('wm-status-filter: should show "Torna alla home" button text', () => {
    cy.get('wm-status-filter > ion-grid > ion-row > ion-col')
      .last()
      .should('have.text', 'Torna alla home');
  });
  it('wm-status-filter: should show "Escursionismo" filter', () => {
    cy.get('wm-status-filter .chip-list ion-chip ion-label')
      .first()
      .should('include.text', 'Escursionismo');
  });
  it('wm-home-layer: should be 1 layer', () => {
    cy.get('wm-home-layer').should('have.length', 1);
  });
  it('wm-home-result: should be 2 tabs', () => {
    cy.get('wm-home-result > ion-segment > ion-segment-button', {timeout: 10000}).should(
      'have.length',
      2,
    );
  });
  //tracks tab
  it(`wm-home-result: first tab should be have same count of tracks`, () => {
    cy.get('wm-home-result > ion-segment > ion-segment-button')
      .first()
      .find('span')
      .should('include.text', tracksCountExpected);
  });
  it('wm-home-result: tracks elem', () => {
    cy.get('wm-home-result ion-content').each((ionContent, idx) => {
      cy.wrap(ionContent)
        .find('wm-search-box') // Seleziona gli elementi <wm-search-box> all'interno di ciascun <wm-horizontal-scroll-box>
        .should('have.length', '200' || tracksCountExpected)
        .then($elements => $elements.slice(0, 10))
        .each((wmSearchBox, idx) => {
          const currentTrack = tracks[idx]?._source;
          const name = currentTrack?.name;
          const distance = currentTrack?.distance;
          const taxonomyWhere = currentTrack?.taxonomyWheres;
          const activity = currentTrack?.activities;
          if (name) {
            cy.wrap(wmSearchBox).find('ion-card ion-card-header').should('include.text', name);
          } else {
            cy.log(`track ${currentTrack?.id}: missed field name`);
          }
          if (distance) {
            cy.wrap(wmSearchBox)
              .find('ion-card .wm-search-box-properties .wm-search-box-property')
              .should('include.text', distance);
          }
          if (taxonomyWhere) {
            cy.wrap(wmSearchBox)
              .find('ion-card ion-card-header ion-card-subtitle')
              .invoke('text')
              .then(text => {
                const taxonomy = taxonomyWhere.find(element => text.includes(element));
                expect(taxonomy).to.exist;
                cy.log(`Taxonomy: ${taxonomy}`);
              });
          }
          if (activity) {
            cy.wrap(wmSearchBox)
              .find('ion-card .wm-box-taxonomies .wm-box-taxonomy > div')
              .should('include.text', 'Escursionismo');
          }
        });
    });
  });
  //pois tab
  it(`wm-home-result: second tab should be have same count of pois`, () => {
    cy.get('wm-home-result > ion-segment > ion-segment-button', {timeout: 10000})
      .last()
      .find('span')
      .should('include.text', poisCountExpected);
  });
  it('wm-home-result: pois elem', () => {
    cy.get('wm-home-result > ion-segment > ion-segment-button').last().click();

    cy.get('wm-home-result ion-content', {timeout: 10000}).each((ionContent, idx) => {
      cy.wrap(ionContent)
        .find('div > wm-poi-box')
        .then($elements => $elements.slice(0, 10)) // Testa solo i primi 100 elementi
        .each((wmPoiBox, index) => {
          const currentFeature = filterFeatureCollectionByInputTyped.features[index];
          const currentProperties = currentFeature.properties;
          const rawName = JSON.stringify(currentProperties.name);
          if (rawName) {
            cy.wrap(wmPoiBox)
              .invoke('text')
              .then(wmPoiBoxText => {
                expect(rawName).to.include(wmPoiBoxText);
              });
          }
        });
    });
  });
});
