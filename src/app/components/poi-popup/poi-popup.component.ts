import {
  Component,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  Input,
  EventEmitter,
  Output,
} from '@angular/core';
import {BehaviorSubject} from 'rxjs';

@Component({
  selector: 'webmapp-poi-popup',
  templateUrl: './poi-popup.component.html',
  styleUrls: ['./poi-popup.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class PoiPopupComponent {
  @Output() closeEVT: EventEmitter<void> = new EventEmitter<void>();

  @Input('padding') set mapPadding(padding: number[]) {
    if (padding != null && padding[3] != null) {
      this._left$.next(padding[3]);
    }
  }
  @Input('poi') set setPoi(poi: any) {
    if (poi != null && poi.properties != null) {
      poi.properties.address = [poi.properties.addr_locality, poi.properties.addr_street]
        .filter(f => f != null)
        .join(', ');
      poi.properties.address_link = [poi.properties.addr_locality, poi.properties.addr_street]
        .filter(f => f != null)
        .join('+');
      if (poi.properties.related_url != null) {
        if (poi.properties.related_url[''] === null) {
          delete poi.properties.related_url[''];
        }
        poi.properties.related_url =
          Object.keys(poi.properties.related_url).length === 0 ? null : poi.properties.related_url;
      }

      this.poiProperties = poi.properties;
    }
  }
  toggleImage$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  poiProperties: any = null;
  defaultPhotoPath = '/assets/icon/no-photo.svg';
  private _left$: BehaviorSubject<number> = new BehaviorSubject<number>(0);

  toggleImage(): void {
    console.table(this.poiProperties.feature_image);
    this.toggleImage$.next(!this.toggleImage$.value);
  }
}
