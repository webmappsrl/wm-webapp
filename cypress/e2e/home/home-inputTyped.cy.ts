import {FeatureCollection} from 'geojson';
import {filterFeatureCollectionByInputTyped as filterFeatureCollectionByInputTypedFn} from '../../../src/app/shared/wm-core/store/api/utils';
const inputTyped = 'cento';
const confURL = 'https://geohub.webmapp.it/api/app/webmapp/33/config.json';
const apiURL = 'https://elastic-json.webmapp.it/search/?id=33&query=' + inputTyped;
const poisURL = 'https://geohub.webmapp.it/api/v1/app/33/pois.geojson';

describe('HOME_inputTyped', () => {
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
          inputTyped,
        );
        poisCountExpected = filterFeatureCollectionByInputTyped.features.length ?? 0;
      });

    cy.visit('/');
    cy.get('webmapp-search div form input').type(inputTyped);
    cy.intercept('GET', poisURL).as('getPois');
    cy.wait('@getPois').its('response.statusCode').should('eq', 200);
  });

  it('home_inputTyped should exist', () => {
    cy.get('webmapp-search div form input').should('exist');
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
  it('wm-home-result: should be 2 tabs', () => {
    cy.get('wm-home-result > ion-segment > ion-segment-button').should('have.length', 2);
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
        .should('have.length', tracksCountExpected)
        .each((wmSearchBox, idx) => {
          const currentTrail = tracks[idx]?._source;
          const name = currentTrail?.name;
          const distance = currentTrail?.distance;
          cy.wrap(wmSearchBox)
            .find('ion-card ion-card-header ion-card-title')
            .should('include.text', name);
          if (distance) {
            cy.wrap(wmSearchBox)
              .find('ion-card .wm-search-box-properties .wm-search-box-property')
              .should('include.text', distance);
          }
        });
    });
  });
  //pois tab
  it(`wm-home-result: second tab should be have same count of pois`, () => {
    cy.get('wm-home-result > ion-segment > ion-segment-button')
      .last()
      .find('span')
      .should('include.text', poisCountExpected);
  });
  it('wm-home-result: pois elem', () => {
    cy.get('wm-home-result > ion-segment > ion-segment-button').last().click();

    cy.get('wm-poi-box').each((wmPoiBox, idx) => {
      const currentFeature = filterFeatureCollectionByInputTyped.features[idx];
      const currentProperties = currentFeature.properties;
      const rawName = JSON.stringify(currentProperties.name);
      cy.wrap(wmPoiBox)
        .invoke('text')
        .then(wmPoiBoxText => {
          expect(rawName).to.include(wmPoiBoxText);
        });
    });
  });
});

// TODO: non riesco ad importarla
const _filterFeatureCollectionByInputTyped = (
  featureCollection: FeatureCollection,
  inputTyped: string,
): FeatureCollection => {
  if (inputTyped == null || inputTyped == '' || featureCollection == null) {
    return featureCollection;
  }
  return {
    type: 'FeatureCollection',
    features: featureCollection.features.filter(feature => {
      const p = feature?.properties;
      const searchable = `${JSON.stringify(p?.name ?? '')}${p?.searchable ?? ''}`;
      return searchable.toLowerCase().indexOf(inputTyped.toLocaleLowerCase()) >= 0;
    }),
  } as FeatureCollection;
};
