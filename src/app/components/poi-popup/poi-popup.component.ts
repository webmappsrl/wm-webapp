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
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import {UntypedFormGroup} from '@angular/forms';
import {AlertController, IonSlides} from '@ionic/angular';
import {Store} from '@ngrx/store';
import {LangService} from '@wm-core/localization/lang.service';
import {confPOIFORMS, confShowEditingInline} from '@wm-core/store/conf/conf.selector';
import {deleteUgcPoi, updateUgcPoi} from '@wm-core/store/features/ugc/ugc.actions';
import {Media, WmFeature, WmProperties} from '@wm-types/feature';
import {switchMap, take} from 'rxjs/operators';
import {startEditUgcPoi, stopEditUgcPoi} from '@wm-core/store/user-activity/user-activity.action';
import {currentUgcPoiDrawnGeometry} from '@wm-core/store/features/ugc/ugc.selector';

@Component({
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
  public defaultPhotoPath = '/assets/icon/no-photo.svg';
  enableEditingInline$ = this._store.select(confShowEditingInline);
  enableGallery$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public fg: UntypedFormGroup;
  isEditing$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  isEnd$: Observable<boolean>;
  medias$: Observable<Media[]>;
  @Output() public nextEVT: EventEmitter<void> = new EventEmitter<void>();
  public poi: WmFeature<Point> = null;
  public poiProperties: WmProperties = null;
  @Output() public prevEVT: EventEmitter<void> = new EventEmitter<void>();
  public slideOptions = {
    allowTouchMove: false,
    slidesPerView: 1,
    slidesPerColumn: 1,
    slidesPerGroup: 1,
    centeredSlides: true,
    watchSlidesProgress: true,
    spaceBetween: 20,
    loop: true,
  };
  @ViewChild('gallery') public slider: IonSlides;

  constructor(
    private _store: Store,
    private _alertCtrl: AlertController,
    private _langSvc: LangService,
    private _cdr: ChangeDetectorRef,
  ) {}

  @Input('poi') public set setPoi(poi: any) {
    if (poi != null && poi.properties != null) {
      this.poi = poi;
      this.medias$ = undefined;
      const prop: {[key: string]: any} = {};
      try {
        prop.address =
          poi.properties.addr_complete ??
          [poi.properties.addr_locality, poi.properties.addr_street]
            .filter(f => f != null)
            .join(', ');
      } catch (_) {
        prop.address = '';
      }
      try {
        prop.address_link = [poi.properties.addr_locality, poi.properties.addr_street]
          .filter(f => f != null)
          .join('+');
      } catch (_) {
        prop.address_link = '';
      }
      if (poi.properties.related_url != null) {
        if (poi.properties.related_url[''] === null) {
          delete poi.properties.related_url[''];
        }
        prop.related_url =
          Object.keys(poi.properties.related_url).length === 0 ? null : poi.properties.related_url;
      }

      this.poiProperties = {...poi.properties, ...prop};
      this.enableGallery$.next(
        this.poiProperties?.feature_image != null ||
          (this.poiProperties?.image_gallery != null &&
            this.poiProperties?.image_gallery?.length > 0),
      );
    }
  }

  editUgcPoi(): void {
    this.isEditing$.next(true);
    this._store.dispatch(startEditUgcPoi({ugcPoi: this.poi}));
  }

  cancelEditUgcPoi(): void {
    this.isEditing$.next(false);
    this._store.dispatch(stopEditUgcPoi());
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

  @HostListener('document:keydown.ArrowLeft', ['$event'])
  handleArrowLeft(): void {
    this.prevEVT.emit();
  }

  @HostListener('document:keydown.ArrowRight', ['$event'])
  handleArrowRight(): void {
    this.nextEVT.emit();
  }

  @HostListener('document:keydown.Escape', ['$event'])
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
      this._store.dispatch(stopEditUgcPoi());
      this.isEditing$.next(false);
      this.poi = poi;
      this.poiProperties = {...poi.properties} as any;
      this._cdr.detectChanges();
    }
  }
}
