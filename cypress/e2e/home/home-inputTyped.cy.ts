import {FeatureCollection} from 'geojson';
import {filterFeatureCollectionByInputTyped as filterFeatureCollectionByInputTypedFn} from '../../../src/app/shared/wm-core/store/api/utils';
import {environment} from 'src/environments/environment';
import {context} from '../../support/context';
import {wmIT} from 'src/app/shared/wm-core/localization/i18n/it';

Cypress.config('defaultCommandTimeout', 10000);
const appId = environment.geohubId;
const inputsTyped: string[] = context[appId]?.inputsTyped ?? [];
const confURL = `https://geohub.webmapp.it/api/app/webmapp/${appId}/config.json`;
const poisURL = `https://geohub.webmapp.it/api/v1/app/${appId}/pois.geojson`;

const executeTests = (HOME_inputTyped, {inputTyped = ''}) => {
  const apiURL = `https://elastic-json.webmapp.it/search/?id=${appId}&query=` + inputTyped;
  describe(`HOME_inputTyped_${inputTyped}`, () => {
    let tracks = [];
    let poisCountExpected = 0;
    let tracksCountExpected = 0;
    let wmTitleConf: ITITLEBOX[] = [];
    let wmLayerConf: ILAYERBOX[] = [];
    let filterFeatureCollectionByInputTyped: FeatureCollection;

    before(() => {
      cy.log(`inputTyped: ${inputTyped}`);
      cy.request(confURL)
        .its('body')
        .then(conf => {
          wmTitleConf = conf.HOME.filter(el => el.box_type === 'title');
          wmLayerConf = conf.HOME.filter(el => el.box_type === 'layer');
        });
      cy.request(apiURL)
        .its('body')
        .then(elasticRes => {
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
      cy.intercept('GET', poisURL).as('getPois');
      cy.get('webmapp-search div form input').type(inputTyped);
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
        .should('include.text', 'Torna alla home');
    });
    it(`wm-home-result: should be have right number of tabs`, () => {
      const expectedLength =
        tracksCountExpected > 0 && poisCountExpected > 0
          ? 2
          : tracksCountExpected > 0 || poisCountExpected > 0
          ? 1
          : 0;
      cy.get('wm-home-result > ion-segment > ion-segment-button').should(
        'have.length',
        expectedLength,
      );
    });
    it(`wm-home-result: no result in search ${inputTyped} show 'Spiacenti non ci sono risultati con questi criteri di ricerca.'`, () => {
      if (
        (poisCountExpected === 0 || poisCountExpected === undefined) &&
        (tracksCountExpected === 0 || tracksCountExpected === undefined)
      ) {
        cy.get('wm-home-result > ion-content > ion-item')
          .find('h5')
          .invoke('text')
          .should('include', 'Spiacenti non ci sono risultati con questi criteri di ricerca.');
      } else {
        cy.log(
          `SKIP(wm-home-result: no result in search ${inputTyped}): non presente nella HOME della app con id ${appId}`,
        );
      }
    });
    //tracks tab
    it(`wm-home-result: first tab should be have same count of api tracks`, () => {
      if (tracksCountExpected > 0) {
        cy.get('wm-home-result > ion-segment > ion-segment-button')
          .first()
          .find('span')
          .should('include.text', tracksCountExpected);
      } else {
        cy.log(
          `SKIP(wm-home-result: tab should be have same count of tracks ${inputTyped}): non presente nella HOME della app con id ${appId}`,
        );
      }
    });
    it('wm-home-result: tracks elem', () => {
      if (tracksCountExpected > 0) {
        cy.get('wm-home-result ion-content').each((ionContent, idx) => {
          cy.wrap(ionContent)
            .find('wm-search-box')
            .then($elements => {
              // Check if tracksCountExpected is 200, if not use tracksCountExpected for assertion
              if (tracksCountExpected > 200) {
                expect($elements).to.have.length(200);
              } else {
                expect($elements).to.have.length(tracksCountExpected);
              }
            })
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
              if (activity && activity.length > 0) {
                const activityStr = activity.join(', ');
                cy.wrap(wmSearchBox)
                  .find('ion-card .wm-box-taxonomies .wm-box-taxonomy')
                  .should('have.text', wmIT[activityStr] ?? activityStr);
              }
            });
        });
      } else {
        cy.log(
          `SKIP(wm-home-result: tracks elem ${inputTyped}): non presente nella HOME della app con id ${appId}`,
        );
      }
    });
    //pois tab
    it(`wm-home-result: second tab should be have same count of pois`, () => {
      if (poisCountExpected > 0) {
        cy.get('wm-home-result > ion-segment > ion-segment-button')
          .last()
          .find('span')
          .should('include.text', poisCountExpected);
      } else {
        cy.log(
          `SKIP(wm-home-result: second tab should be have same count of pois ${inputTyped}): non presente nella HOME della app con id ${appId}`,
        );
      }
    });
    it('wm-home-result: pois elem', () => {
      if (poisCountExpected > 0) {
        cy.get('wm-home-result > ion-segment > ion-segment-button').last().click();

        cy.get('wm-poi-box').then($boxes => {
          const boxes = $boxes.slice(0, 10);
          cy.wrap(boxes).each((wmPoiBox, idx) => {
            const currentFeature = filterFeatureCollectionByInputTyped.features[idx];
            const currentProperties = currentFeature.properties;
            const rawName = JSON.stringify(currentProperties.name);
            if (rawName) {
              cy.wrap(wmPoiBox)
                .invoke('text')
                .then(wmPoiBoxText => {
                  // Prepare wmPoiBoxText to match JSON format
                  const wmPoiBoxTextEscaped = wmPoiBoxText.replace(/"/g, '\\"');
                  expect(rawName).to.include(wmPoiBoxTextEscaped);
                });
            }
          });
        });
      } else {
        cy.log(
          `SKIP(wm-home-result: pois elem ${inputTyped}): non presente nella HOME della app con id ${appId}`,
        );
      }
    });
  });
};
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
inputsTyped.forEach(i => {
  executeTests('HOME_inputTyped', {inputTyped: i});
});
