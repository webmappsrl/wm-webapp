import {clearTestState, data} from 'cypress/utils/test-utils';

describe('Draw UGC POI', () => {
  beforeEach('should draw a UGC POI', () => {
    clearTestState();
  });

  it('should select correct layer if layer parameter is present on url', () => {
    const layerBox = data.layers.ecTrack;
    cy.visit(`/?layer=${layerBox.id}`);
    cy.get('wm-home-layer .wm-box-title').should('be.visible').contains(layerBox.title);
  });

  it('should select correct ec-poi if poi parameter is present on url', () => {
    const poi = data.pois.exampleOne;
    cy.visit(`/?poi=${poi.id}`);
    cy.get('webmapp-poi-popup .webmapp-poi-popup-title').should('be.visible').contains(poi.title);
  });

  it('should select correct ec-track if track parameter is present on url', () => {
    const track = data.tracks.exampleOne;
    cy.visit(`/?track=${track.id}`);
    cy.get('wm-track-properties .wm-track-details-header')
      .should('be.visible')
      .contains(track.title);
  });

  it('should select corrects ec-track and related poi if track and ec_related_poi parameters are present on url', () => {
    const track = data.tracks.exampleTwo;
    const relatedPoi = data.tracks.exampleTwoRelatedPoi;
    cy.visit(`/?track=${track.id}&ec_related_poi=${relatedPoi.id}`);
    cy.get('wm-track-properties .wm-track-details-header')
      .should('be.visible')
      .contains(track.title);
    cy.get('webmapp-poi-popup .webmapp-poi-popup-title')
      .should('be.visible')
      .contains(relatedPoi.title);
  });
});
