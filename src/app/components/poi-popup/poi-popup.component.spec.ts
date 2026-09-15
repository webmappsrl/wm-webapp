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

  it('monta wm-ugc-medias per un POI UGC', () => {
    fixture.componentInstance.setPoi = UGC_POI;
    fixture.detectChanges();

    expect(fixture.debugElement.query(By.directive(UgcMediasStubComponent)))
      .withContext('il ramo UGC deve conservare wm-ugc-medias')
      .not.toBeNull();
  });
});
