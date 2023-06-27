import {wmIT} from 'src/app/shared/wm-core/localization/i18n/it';
import {environment} from 'src/environments/environment';

Cypress.config('defaultCommandTimeout', 10000);
const appId = environment.geohubId;
const confURL = `https://geohub.webmapp.it/api/app/webmapp/${appId}/config.json`;

describe('HOME', () => {
  let conf = null;
  let wmHorizontalScrollBoxConf: IHORIZONTALSCROLLBOX[] = [];
  let wmTitleConf: ITITLEBOX[] = [];
  let wmLayerConf: ILAYERBOX[] = [];
  before(() => {
    cy.request(confURL)
      .its('body')
      .then(res => {
        conf = res;
        wmHorizontalScrollBoxConf = conf.HOME.filter(el => el.box_type === 'horizontal_scroll');
        wmTitleConf = conf.HOME.filter(el => el.box_type === 'title');
        wmLayerConf = conf.HOME.filter(el => el.box_type === 'layer');
      });
    cy.visit('/');
  });

  it('welcome', () => {
    const welcome = JSON.stringify(conf.APP.welcome);

    if (welcome && welcome != '[]' && welcome != '{"es":null}') {
      cy.get('span')
        .first()
        .invoke('text')
        .then(text => {
          expect(conf.APP.welcome.it).to.include(text);
        });
    } else {
      cy.log(`SKIP(welcome): non presente nella HOME della app con id ${appId}`);
    }
  });
  it('wm-horizontal-scroll-box: title', () => {
    if (wmHorizontalScrollBoxConf.length > 0) {
      cy.get('wm-horizontal-scroll-box webmapp-title').each((elem, idx) => {
        expect(elem.text()).to.include(wmHorizontalScrollBoxConf[idx].title);
      });
    } else {
      cy.log(
        `SKIP(wm-horizontal-scroll-box: title): non presente nella HOME della app con id ${appId}`,
      );
    }
  });
  it('wm-horizontal-scroll-box: length', () => {
    if (wmHorizontalScrollBoxConf.length > 0) {
      cy.get('wm-home-page wm-horizontal-scroll-box').should(
        'have.length',
        wmHorizontalScrollBoxConf.length,
      );
    } else {
      cy.log(
        `SKIP(wm-horizontal-scroll-box: length): non presente nella HOME della app con id ${appId}`,
      );
    }
  });
  it('wm-horizontal-scroll-box: elem', () => {
    if (wmHorizontalScrollBoxConf.length > 0) {
      cy.get('wm-home-page wm-horizontal-scroll-box').each((elem, idx) => {
        cy.wrap(elem)
          .find('.wm-box')
          .should('have.length', wmHorizontalScrollBoxConf[idx].items.length)
          .each(($box, idx2) => {
            const word = wmHorizontalScrollBoxConf[idx].items[idx2].title as string;
            cy.wrap($box)
              .find('.wm-box-title')
              .should('have.text', wmIT[word] ?? word);
            const img = $box.find('img.wm-result-img');
            expect(img).to.exist;
            const imageUrl = img.attr('src');
            expect(imageUrl).to.be.equal(wmHorizontalScrollBoxConf[idx].items[idx2].image_url);
            cy.request(imageUrl).then(response => {
              expect(response.status).to.eq(200);
            });
          });
      });
    } else {
      cy.log(
        `SKIP(wm-horizontal-scroll-box: elem): non presente nella HOME della app con id ${appId}`,
      );
    }
  });
  it('wm-title: length', () => {
    if (wmTitleConf.length > 0) {
      cy.get('wm-home-page > webmapp-title').should('have.length', wmTitleConf.length);
    } else {
      cy.log(`SKIP(wm-title: length): non presente nella HOME della app con id ${appId}`);
    }
  });
  it('wm-title: text', () => {
    if (wmTitleConf.length > 0) {
      cy.get('wm-home-page > webmapp-title').each((elem, idx) => {
        cy.wrap(elem).should('include.text', wmTitleConf[idx].title);
      });
    } else {
      cy.log(`SKIP(wm-title: text): non presente nella HOME della app con id ${appId}`);
    }
  });

  it('wm-layer-box: length', () => {
    if (wmLayerConf.length > 0) {
      cy.get('wm-home-page > wm-layer-box').should('have.length', wmLayerConf.length);
    } else {
      cy.log(`SKIP(wm-layer-box: length): non presente nella HOME della app con id ${appId}`);
    }
  });
  it('wm-layer-box: elem', () => {
    if (wmLayerConf.length > 0) {
      cy.get('wm-home-page > wm-layer-box').each((elem, idx) => {
        cy.wrap(elem).should('include.text', wmLayerConf[idx].title);
        const img = elem.find('img.wm-img-image');
        expect(img).to.exist;
        const imageUrl = img.attr('src');
        cy.request(imageUrl).then(response => {
          expect(response.status).to.eq(200);
        });
      });
    } else {
      cy.log(`SKIP(wm-layer-box: elem): non presente nella HOME della app con id ${appId}`);
    }
  });
});
