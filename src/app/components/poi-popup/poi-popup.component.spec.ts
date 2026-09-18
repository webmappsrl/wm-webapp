import {Component, CUSTOM_ELEMENTS_SCHEMA, Pipe, PipeTransform} from '@angular/core';
import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {AlertController} from '@ionic/angular';
import {provideMockStore} from '@ngrx/store/testing';
import {LangService} from '@wm-core/localization/lang.service';
import {UrlHandlerService} from '@wm-core/services/url-handler.service';

import {PoiPopupComponent} from './poi-popup.component';

/**
 * Stub dichiarati, non elementi ignorati da `CUSTOM_ELEMENTS_SCHEMA`: Angular li istanzia
 * davvero, quindi `By.directive(...)` trova l'istanza e l'assert non è soddisfacibile in modo
 * vacuo. `WmCoreModule` non viene importato, così si evita l'`NG0201` su `APP_TRANSLATION`
 * documentato nel CLAUDE.md di wm-core per gli spec di componenti.
 */
@Component({standalone: false, selector: 'wm-poi-properties', template: ''})
class PoiPropertiesStubComponent {}

@Component({standalone: false, selector: 'wm-ugc-medias', template: ''})
class UgcMediasStubComponent {}

@Pipe({standalone: false, name: 'wmtrans'})
class WmTransStubPipe implements PipeTransform {
  transform(value: unknown): unknown {
    return value;
  }
}

@Pipe({standalone: false, name: 'toArray'})
class ToArrayStubPipe implements PipeTransform {
  transform(value: string): string[] {
    return value ? [value] : [];
  }
}

const EC_POI = {
  type: 'Feature',
  geometry: {type: 'Point', coordinates: [10, 43]},
  properties: {id: 42535, name: 'Rifugio Telegrafo'},
};

const UGC_POI = {
  type: 'Feature',
  geometry: {type: 'Point', coordinates: [10, 43]},
  properties: {uuid: 'abc-123', name: 'Segnalazione'},
};

describe('PoiPopupComponent — instradamento EC/UGC', () => {
  let fixture: ComponentFixture<PoiPopupComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      declarations: [
        PoiPopupComponent,
        PoiPropertiesStubComponent,
        UgcMediasStubComponent,
        WmTransStubPipe,
        ToArrayStubPipe,
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        // `conf` va popolato con i sotto-oggetti che i selettori dereferenziano senza
        // null-safety: `confShowEditingInline` fa `state.editing_inline_show` su `confWEBAPP`
        // (`conf.selector.ts:109`) e `confPOIFORMS` fa `app.poi_acquisition_form` su `confAPP`.
        // Con `conf: {}` entrambi lanciano un TypeError che NgRx logga senza far fallire lo spec:
        // rumore che nasconderebbe errori veri. Stessa lezione già documentata in CLAUDE.md per
        // il MockStore di AppComponent.
        provideMockStore({initialState: {conf: {APP: {}, WEBAPP: {}}, ec: {}, ugc: {}}}),
        {provide: AlertController, useValue: {create: () => Promise.resolve({present: () => {}})}},
        {provide: LangService, useValue: {instant: (k: string) => k}},
        {provide: UrlHandlerService, useValue: {updateURL: () => {}}},
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(PoiPopupComponent);
  }));

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('monta wm-poi-properties per un POI EC', () => {
    fixture.componentInstance.setPoi = EC_POI;
    fixture.detectChanges();

    expect(fixture.debugElement.query(By.directive(PoiPropertiesStubComponent)))
      .withContext('il ramo EC deve montare wm-poi-properties')
      .not.toBeNull();
  });

  it('non monta wm-poi-properties per un POI UGC', () => {
    fixture.componentInstance.setPoi = UGC_POI;
    fixture.detectChanges();

    expect(fixture.debugElement.query(By.directive(PoiPropertiesStubComponent)))
      .withContext('il ramo UGC non deve montare il componente condiviso')
      .toBeNull();
  });

  // Il ramo UGC non passa dal componente condiviso, quindi tutto ciò che su develop stava nel
  // markup comune deve restare qui: l'indirizzo derivato dai campi `addr_*`, la quota e il link
  // OpenStreetMap. Sono spariti una volta nello split EC/UGC e li ha trovati una review esterna.
  describe('il ramo UGC conserva quello che aveva su develop', () => {
    it('deriva address dai campi addr_*', () => {
      fixture.componentInstance.setPoi = {
        ...UGC_POI,
        properties: {...UGC_POI.properties, addr_locality: 'Pisa', addr_street: 'Via Roma 1'},
      };

      expect(fixture.componentInstance.poiProperties.address).toBe('Pisa, Via Roma 1');
      expect(fixture.componentInstance.ugcMapsHref).toContain('Pisa');
    });

    it('conserva l\u2019indirizzo anche dopo il salvataggio', () => {
      // `updatePoi()` ricostruiva `poiProperties` per conto suo, senza derivare l'indirizzo:
      // dopo "Salva" su un POI UGC con i soli campi `addr_*` la riga spariva.
      const poi = {
        ...UGC_POI,
        properties: {...UGC_POI.properties, addr_locality: 'Pisa', addr_street: 'Via Roma 1'},
      };
      fixture.componentInstance.setPoi = poi;
      fixture.componentInstance.fg = {valid: true, value: {title: 'Nuovo nome'}} as any;

      fixture.componentInstance.updatePoi();

      expect(fixture.componentInstance.poiProperties.address).toBe('Pisa, Via Roma 1');
    });

    it('mostra la quota', () => {
      fixture.componentInstance.setPoi = {
        ...UGC_POI,
        properties: {...UGC_POI.properties, ele: 1029},
      };
      fixture.detectChanges();

      expect(fixture.nativeElement.textContent)
        .withContext('la quota deve comparire anche sui POI UGC')
        .toContain('1029');
    });

    it('mostra il link OpenStreetMap, in una scheda nuova', () => {
      fixture.componentInstance.setPoi = {
        ...UGC_POI,
        properties: {...UGC_POI.properties, osm_url: 'https://www.openstreetmap.org/node/42'},
      };
      fixture.detectChanges();

      const link = fixture.nativeElement.querySelector('a[href*="openstreetmap"]');
      expect(link).withContext('il link OSM deve esserci').not.toBeNull();
      expect(link.getAttribute('target')).toBe('_blank');
    });
  });

  describe('le frecce non rubano i tasti a chi scrive', () => {
    const premi = (tasto: string, target: any) =>
      fixture.componentInstance[tasto === 'ArrowRight' ? 'handleArrowRight' : 'handleArrowLeft'](
        {target} as any,
      );

    it('ignora il tasto se arriva da un campo di testo', () => {
      const naviga = spyOn<any>(fixture.componentInstance, '_goToRelatedPoi');
      for (const tag of ['input', 'textarea', 'ion-input', 'ion-searchbar']) {
        premi('ArrowRight', document.createElement(tag));
        premi('ArrowLeft', document.createElement(tag));
      }

      expect(naviga)
        .withContext('nella searchbar le frecce muovono il cursore, non il POI')
        .not.toHaveBeenCalled();
    });

    it('Escape non chiude il dettaglio mentre si scrive', () => {
      const chiude = spyOn(fixture.componentInstance.closeEVT, 'emit');
      fixture.componentInstance.handleEscape({target: document.createElement('input')} as any);
      expect(chiude).withContext('chiuderebbe buttando via il form in compilazione').not.toHaveBeenCalled();

      fixture.componentInstance.handleEscape({target: document.createElement('div')} as any);
      expect(chiude).toHaveBeenCalledTimes(1);
    });

    it('naviga se il tasto arriva dalla pagina', () => {
      const naviga = spyOn<any>(fixture.componentInstance, '_goToRelatedPoi');
      premi('ArrowRight', document.createElement('div'));

      expect(naviga).toHaveBeenCalledTimes(1);
    });
  });

  it('monta wm-ugc-medias per un POI UGC', () => {
    fixture.componentInstance.setPoi = UGC_POI;
    fixture.detectChanges();

    expect(fixture.debugElement.query(By.directive(UgcMediasStubComponent)))
      .withContext('il ramo UGC deve conservare wm-ugc-medias')
      .not.toBeNull();
  });
});
