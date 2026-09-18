import {Point} from 'geojson';
import {BehaviorSubject, Observable, from} from 'rxjs';

import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  HostListener,
  Input,
  Output,
  ViewEncapsulation,
} from '@angular/core';
import {UntypedFormGroup} from '@angular/forms';
import {AlertController} from '@ionic/angular';
import {MemoizedSelector, Store} from '@ngrx/store';
import {LangService} from '@wm-core/localization/lang.service';
import {confPOIFORMS, confShowEditingInline} from '@wm-core/store/conf/conf.selector';
import {deleteUgcPoi, updateUgcPoi} from '@wm-core/store/features/ugc/ugc.actions';
import {WmFeature, WmProperties} from '@wm-types/feature';
import {filter, switchMap, take} from 'rxjs/operators';
import {startDrawUgcPoi, stopDrawUgcPoi} from '@wm-core/store/user-activity/user-activity.action';
import {currentUgcPoiDrawnGeometry} from '@wm-core/store/features/ugc/ugc.selector';
import {
  currentRelatedPoisCount,
  nextRelatedPoiId,
  prevRelatedPoiId,
} from '@wm-core/store/features/ec/ec.selector';
import {UrlHandlerService} from '@wm-core/services/url-handler.service';
import {derivePoiAddress} from '@wm-core/utils/derive-poi-address';

@Component({
  standalone: false,
  selector: 'webmapp-poi-popup',
  templateUrl: './poi-popup.component.html',
  styleUrls: ['./poi-popup.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class PoiPopupComponent {
  @Output() closeEVT: EventEmitter<void> = new EventEmitter<void>();
  confPOIFORMS$: Observable<any[]> = this._store.select(confPOIFORMS);
  currentUgcPoiDrawnGeometry$: Observable<Point> = this._store.select(currentUgcPoiDrawnGeometry);
  enableEditingInline$ = this._store.select(confShowEditingInline);
  public fg: UntypedFormGroup;
  isEditing$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public poi: WmFeature<Point> = null;
  public poiProperties: WmProperties = null;

  constructor(
    private _store: Store,
    private _alertCtrl: AlertController,
    private _langSvc: LangService,
    private _cdr: ChangeDetectorRef,
    private _urlHandlerSvc: UrlHandlerService,
  ) {}

  @Input('poi') public set setPoi(poi: any) {
    if (poi != null && poi.properties != null) {
      this.poi = poi;
      // L'indirizzo va derivato anche qui, non solo in `wm-poi-properties`: il ramo UGC non passa
      // dal componente condiviso, e su `develop` questo setter componeva `address` da
      // `addr_complete`/`addr_locality`/`addr_street` per **tutti** i POI. Senza, un POI UGC che
      // abbia solo i campi `addr_*` perderebbe la riga dell'indirizzo e il link a Maps.
      // `derivePoiAddress` è la stessa funzione che usa il condiviso: una sola implementazione,
      // non due che possono divergere.
      const {address, address_link} = derivePoiAddress(poi.properties);
      this.poiProperties = {...poi.properties, address, address_link};
    }
  }

  /**
   * Link Google Maps per il ramo UGC. Sostituisce l'interpolazione inline che aveva una graffa di
   * chiusura in eccesso (`{{...}}}`): quella finiva letteralmente nell'URL, che nel DOM risultava
   * `daddr=…}&navigate=yes`. Per i POI EC il link lo produce `wm-address` in wm-core.
   *
   * Usa `address` e non `address_link`, che `develop` preferiva quando valorizzato: `address_link`
   * unisce con `+` per pre-codificare gli spazi, ma `encodeURIComponent` trasforma poi quei `+` in
   * `%2B`, cioè in un più letterale dentro l'indirizzo. Partendo da `address` gli spazi diventano
   * `%20`, che è la forma corretta.
   */
  get ugcMapsHref(): string {
    const destination = this.poiProperties?.address ?? '';
    return `https://www.google.com/maps?daddr=${encodeURIComponent(destination)}&navigate=yes`;
  }

  /**
   * `true` solo se `related_url` porta almeno un link utilizzabile. Sostituisce la normalizzazione
   * che il setter faceva prima — cancellava la chiave `''` e forzava `null` sull'oggetto vuoto
   * **mutando un oggetto dello store**: qui la stessa decisione è presa in lettura, senza toccare
   * lo stato.
   *
   * Il campo arriva dal backend in tre forme, conseguenza deterministica di `EcPoi::getJson()`
   * (`geohub/app/Models/EcPoi.php:282`), che lo rimuove solo se `!is_array && empty`: `false` e
   * `""` spariscono dal payload, una stringa non vuota sopravvive. Misurate sull'app 29: 752
   * oggetti `{label: url}`, 76 stringhe, 3 array. `Object.entries` su una stringa produrrebbe
   * coppie indice/carattere e restituirebbe `true` per caso, quindi le forme sono distinte.
   */
  get hasRelatedUrls(): boolean {
    const urls = this.poiProperties?.related_url;
    if (urls == null) {
      return false;
    }
    if (typeof urls === 'string') {
      return urls.trim() !== '';
    }
    if (Array.isArray(urls)) {
      return urls.some(url => typeof url === 'string' && url.trim() !== '');
    }
    return Object.entries(urls).some(
      ([label, url]) => label.trim() !== '' && typeof url === 'string' && url.trim() !== '',
    );
  }

  editUgcPoi(): void {
    this.isEditing$.next(true);
    this._store.dispatch(startDrawUgcPoi({ugcPoi: this.poi}));
  }

  cancelEditUgcPoi(): void {
    this.isEditing$.next(false);
    this._store.dispatch(stopDrawUgcPoi());
  }

  deleteUgcPoi(): void {
    from(
      this._alertCtrl.create({
        message: this._langSvc.instant(
          "Sei sicuro di voler eliminare questo POI? L'operazione è irreversibile.",
        ),
        buttons: [
          {text: this._langSvc.instant('Annulla'), role: 'cancel'},
          {
            text: this._langSvc.instant('Elimina'),
            handler: () => {
              this._store.dispatch(deleteUgcPoi({poi: this.poi}));
              this.closeEVT.emit();
            },
          },
        ],
      }),
    )
      .pipe(
        switchMap(alert => alert.present()),
        take(1),
      )
      .subscribe();
  }

  @HostListener('document:keydown.ArrowLeft')
  handleArrowLeft(): void {
    this._goToRelatedPoi(prevRelatedPoiId);
  }

  @HostListener('document:keydown.ArrowRight')
  handleArrowRight(): void {
    this._goToRelatedPoi(nextRelatedPoiId);
  }

  /**
   * Naviga al POI correlato indicato dal selettore passato, con la stessa semantica di
   * `WmRelatedPoisNavigatorComponent.poiNext()`/`poiPrev()`: la logica di "quale è il prossimo"
   * vive nel selettore, quindi qui viene riusata e non riscritta — evitando sia la duplicazione
   * sia un `@ViewChild` su un componente di libreria.
   *
   * Il gate su `currentRelatedPoisCount` è una condizione di dominio: naviga solo se esiste più di
   * un POI correlato. **Non è l'unico gate del navigator**: il suo template richiede anche che
   * `currentRelatedPoiIndex` non sia nullo, e quindi si nasconde quando nessun correlato è
   * selezionato. Qui quel secondo gate non si può replicare — queste sono `@HostListener` su
   * `document`, attive sempre — quindi vive nei selettori, che restituiscono `null` su indice
   * negativo invece del primo elemento dell'elenco (`ec.selector.ts`).
   */
  private _goToRelatedPoi(selector: MemoizedSelector<any, number | null>): void {
    this._store
      .select(currentRelatedPoisCount)
      .pipe(
        take(1),
        filter(count => count > 1),
        switchMap(() => this._store.select(selector).pipe(take(1))),
      )
      .subscribe(id => {
        if (id != null) {
          this._urlHandlerSvc.updateURL({ec_related_poi: id});
        }
      });
  }

  @HostListener('document:keydown.Escape')
  handleEscape(): void {
    this.closeEVT.emit();
  }

  openGeohub(): void {
    const id = this.poiProperties != null && this.poiProperties.id;
    if (id != null) {
      const url = `https://geohub.webmapp.it/resources/ec-pois/${id}/edit?viaResource&viaResourceId&viaRelationship`;
      window.open(url, '_blank').focus();
    }
  }

  updatePoi(): void {
    if (this.fg.valid) {
      const poi: WmFeature<Point> = {
        ...this.poi,
        properties: {
          ...this.poi?.properties,
          name: this.fg.value?.title,
          form: this.fg.value,
          updatedAt: new Date(),
        },
      };

      this._store.dispatch(updateUgcPoi({poi}));
      this._store.dispatch(stopDrawUgcPoi());
      this.isEditing$.next(false);
      this.poi = poi;
      this.poiProperties = {...poi.properties} as any;
      this._cdr.detectChanges();
    }
  }
}
