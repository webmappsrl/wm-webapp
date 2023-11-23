import {FeatureCollection} from 'geojson';
import {filterFeatureCollectionByInputTyped as filterFeatureCollectionByInputTypedFn} from 'wm-core/store/api/utils';
import {ILAYERBOX, ITITLEBOX} from 'wm-core/types/config';
const inputTyped = 'oasi';
const confURL = 'https://geohub.webmapp.it/api/app/webmapp/32/config.json';
const apiURL = 'https://elastic-json.webmapp.it/search/?id=32&query=' + inputTyped;
const poisURL = 'https://geohub.webmapp.it/api/v1/app/32/pois.geojson';

describe.skip('32_HOME_inputTyped', () => {
  let conf = null;
  let elasticRes = null;
  let tracks = [];
  let poisCountExpected = 0;
  let tracksCountExpected = 0;
  let wmTitleConf: ITITLEBOX[] = [];
  let wmLayerConf: ILAYERBOX[] = [];
  let filterFeatureCollectionByInputTyped: FeatureCollection;
  const hexToRgb = (hex: string): number[] => {
    let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
      : null;
  };

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
  });

  //tracks tab
  it(`wm-home-result: tracks count should be have #1271b7 color`, () => {
    const hexColor = '#1271b7';
    const rgbColor = hexToRgb(hexColor).join(', ');

    cy.get('wm-home-result > ion-segment > ion-segment-button')
      .first()
      .find('span')
      .should('have.css', 'color', `rgb(${rgbColor})`);
  });
  it(`wm-home-result: tracks count should be have #1271b7 border color`, () => {
    const hexColor = '#1271b7';
    const rgbColor = hexToRgb(hexColor).join(', ');

    cy.get('wm-home-result > ion-segment > ion-segment-button')
      .first()
      .find('span')
      .should('have.css', 'border', `1px solid rgb(${rgbColor})`);
  });
  it(`wm-home-result: tracks count should be have #f2f5ff background color`, () => {
    const hexColor = '#f2f5ff';
    const rgbColor = hexToRgb(hexColor).join(', ');

    cy.get('wm-home-result > ion-segment > ion-segment-button')
      .first()
      .find('span')
      .should(
        'have.css',
        'background',
        `rgb(${rgbColor}) none repeat scroll 0% 0% / auto padding-box border-box`,
      );
  });
  it(`wm-home-result: tracks images should have border-radius 0px`, () => {
    cy.get(
      'wm-home-result wm-img .wm-img-image, wm-home-result wm-poi-box wm-img .wm-img-image',
    ).each($el => {
      cy.wrap($el).should('have.css', 'border-radius', '0px');
    });
  });
  //pois tab
  it(`wm-home-result: pois count should be have #b7127f color`, () => {
    const hexColor = '#b7127f';
    const rgbColor = hexToRgb(hexColor).join(', ');

    cy.get('wm-home-result ion-segment-button[value="pois"]').click();
    cy.get('wm-home-result > ion-segment > ion-segment-button')
      .last()
      .find('span')
      .should('have.css', 'color', `rgb(${rgbColor})`);
  });
  it(`wm-home-result: pois count should be have #b7127f border color`, () => {
    const hexColor = '#b7127f';
    const rgbColor = hexToRgb(hexColor).join(', ');

    cy.get('wm-home-result ion-segment-button[value="pois"]').click();
    cy.get('wm-home-result > ion-segment > ion-segment-button')
      .last()
      .find('span')
      .should('have.css', 'border', `1px solid rgb(${rgbColor})`);
  });
  it(`wm-home-result: pois count should be have #fff6fc background color`, () => {
    const hexColor = '#fff6fc';
    const rgbColor = hexToRgb(hexColor).join(', ');

    cy.get('wm-home-result > ion-segment > ion-segment-button')
      .last()
      .find('span')
      .should(
        'have.css',
        'background',
        `rgb(${rgbColor}) none repeat scroll 0% 0% / auto padding-box border-box`,
      );
  });
  it(`wm-home-result: pois images should have border-radius 0px`, () => {
    cy.get('wm-home-result ion-segment-button[value="pois"]').click();
    cy.get('wm-home-result ion-content div wm-img img').each($el => {
      cy.wrap($el).should('have.css', 'border-radius', '0px');
    });
  });
});
