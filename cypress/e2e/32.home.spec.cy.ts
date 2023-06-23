import {wmIT} from './../../src/app/shared/wm-core/localization/i18n/it';
// const serverURL = 'https://32.app.geohub.webmapp.it/#/map';
const serverURL = '/';
const confURL = 'https://geohub.webmapp.it/api/app/webmapp/32/config.json';
describe('HOME', () => {
  let conf = null;
  let wmHorizontalScrollBoxConf: IHORIZONTALSCROLLBOX[] = [];
  let wmTitleConf: ITITLEBOX[] = [];
  let wmLayerConf: ILAYERBOX[] = [];
  before(() => {
    // Cypress starts out with a blank slate for each test
    // so we must tell it to visit our website with the `cy.visit()` command.
    // Since we want to visit the same URL at the start of all our tests,
    // we include it in our beforeEach function so that it runs before each test
    cy.request(confURL) // Sostituisci '/your-url' con l'URL desiderato
      .its('body')
      .then(res => {
        conf = res;
        wmHorizontalScrollBoxConf = conf.HOME.filter(el => el.box_type === 'horizontal_scroll');
        wmTitleConf = conf.HOME.filter(el => el.box_type === 'title');
        wmLayerConf = conf.HOME.filter(el => el.box_type === 'layer');
      });
  });
  beforeEach(() => {
    // Cypress starts out with a blank slate for each test
    // so we must tell it to visit our website with the `cy.visit()` command.
    // Since we want to visit the same URL at the start of all our tests,
    // we include it in our beforeEach function so that it runs before each test
    cy.visit(serverURL);
  });
  it('welcome', () => {
    const welcome = conf.APP.welcome;
    if (welcome && JSON.stringify(welcome) != '{"es":null}') {
      cy.get('span')
        .first()
        .invoke('text')
        .then(text => {
          expect(welcome.it).to.include(text);
        });
    } else {
      // Il test viene saltato se la condizione non è verificata
      cy.log(`Il test è stato saltato perché la condizione non è verificata su ${serverURL}`);
    }
  });
  it('wm-horizontal-scroll-box: title', () => {
    cy.get('wm-horizontal-scroll-box webmapp-title').each((elem, idx) => {
      expect(elem.text()).to.include(wmHorizontalScrollBoxConf[idx].title);
    });
  });
  it('wm-horizontal-scroll-box: length', () => {
    cy.get('wm-home-page wm-horizontal-scroll-box').should(
      'have.length',
      wmHorizontalScrollBoxConf.length,
    );
  });
  it('wm-horizontal-scroll-box: elem', () => {
    cy.get('wm-home-page wm-horizontal-scroll-box').each((elem, idx) => {
      cy.wrap(elem)
        .find('.wm-box') // Seleziona gli elementi <wm-box> all'interno di ciascun <wm-horizontal-scroll-box>
        .should('have.length', wmHorizontalScrollBoxConf[idx].items.length) // Verifica che ci siano esattamente 5 elementi selezionati
        .each(($box, idx2) => {
          const word = wmHorizontalScrollBoxConf[idx].items[idx2].title as string;
          // Verifica che il testo all'interno del wm-box corrente sia corretto
          cy.wrap($box)
            .find('.wm-box-title')
            .should('have.text', wmIT[word] ?? word);
          const img = $box.find('img.wm-result-img');
          expect(img).to.exist; // Verifica che l'immagine sia presente
          const imageUrl = img.attr('src');
          expect(imageUrl).to.be.equal(wmHorizontalScrollBoxConf[idx].items[idx2].image_url);
          cy.request(imageUrl).then(response => {
            expect(response.status).to.eq(200); // Verifica che la risposta HTTP per l'immagine sia 200 (OK)
          });
        });
    });
  });
  it('wm-title: length', () => {
    cy.get('wm-home-page > webmapp-title').should('have.length', wmTitleConf.length);
  });
  it('wm-title: text', () => {
    cy.get('wm-home-page > webmapp-title').each((elem, idx) => {
      cy.wrap(elem).should('include.text', wmTitleConf[idx].title);
    });
  });

  it('wm-layer-box: length', () => {
    cy.get('wm-home-page > wm-layer-box').should('have.length', wmLayerConf.length);
  });
  it('wm-layer-box: elem', () => {
    cy.get('wm-home-page > wm-layer-box').each((elem, idx) => {
      cy.wrap(elem).should('include.text', wmLayerConf[idx].title);
      const img = elem.find('img.wm-img-image');
      expect(img).to.exist; // Verifica che l'immagine sia presente
      const imageUrl = img.attr('src');
      cy.request(imageUrl).then(response => {
        expect(response.status).to.eq(200); // Verifica che la risposta HTTP per l'immagine sia 200 (OK)
      });
    });
  });
});
// Funzione per ottenere il testo corretto del wm-box in base all'indice
