import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostListener,
  Input,
  Output,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import {BehaviorSubject, from, Observable} from 'rxjs';

import {IonSlides} from '@ionic/angular';
import {Store} from '@ngrx/store';

import {IGeojsonProperties} from 'src/app/types/model';
import {confShowEditingInline} from 'wm-core/store/conf/conf.selector';
import {Media, MediaProperties, WmFeature} from '@wm-types/feature';
import {getUgcMediasByIds} from 'wm-core/utils/localForage';
import {map} from 'rxjs/operators';

@Component({
  selector: 'webmapp-poi-popup',
  templateUrl: './poi-popup.component.html',
  styleUrls: ['./poi-popup.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class PoiPopupComponent {
  @Input('poi') set setPoi(poi: any) {
    if (poi != null && poi.properties != null) {
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
      if (poi.properties?.photoKeys) {
        this.medias$ = from(getUgcMediasByIds(poi.properties.photoKeys.map(key => key.toString()))).pipe(
          map(medias => medias)
        );
      }
      this.poiProperties = {...poi.properties, ...prop};
      this.enableGallery$.next(
        this.poiProperties?.feature_image != null ||
          (this.poiProperties?.image_gallery != null && this.poiProperties?.image_gallery?.length > 0)
      );
    }
  }

  @Output() closeEVT: EventEmitter<void> = new EventEmitter<void>();
  @Output() nextEVT: EventEmitter<void> = new EventEmitter<void>();
  @Output() prevEVT: EventEmitter<void> = new EventEmitter<void>();
  @ViewChild('gallery') slider: IonSlides;

  defaultPhotoPath = '/assets/icon/no-photo.svg';
  enableEditingInline$ = this._store.select(confShowEditingInline);
  enableGallery$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  isEnd$: Observable<boolean>;
  medias$: Observable<WmFeature<Media, MediaProperties>[]>;
  poiProperties: IGeojsonProperties = null;
  slideOptions = {
    allowTouchMove: false,
    slidesPerView: 1,
    slidesPerColumn: 1,
    slidesPerGroup: 1,
    centeredSlides: true,
    watchSlidesProgress: true,
    spaceBetween: 20,
    loop: true,
  };

  constructor(private _store: Store) {}

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
}
