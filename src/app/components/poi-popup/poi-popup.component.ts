import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostListener,
  Input,
  Output,
  ViewEncapsulation,
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
  @Output() public closeEVT: EventEmitter<void> = new EventEmitter<void>();
  @Output() public nextEVT: EventEmitter<void> = new EventEmitter<void>();
  @Output() public prevEVT: EventEmitter<void> = new EventEmitter<void>();

  public defaultPhotoPath = '/assets/icon/no-photo.svg';
  public poiProperties: any = null;
  toggleImage$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  @Input('poi') public set setPoi(poi: any) {
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

      this.poiProperties = {...poi.properties, ...prop};
    }
  }

  @HostListener('document:keydown.ArrowLeft', ['$event'])
  public handleArrowLeft() {
    this.prevEVT.emit();
  }

  @HostListener('document:keydown.ArrowRight', ['$event'])
  public handleArrowRight() {
    this.nextEVT.emit();
  }

  @HostListener('document:keydown.Escape', ['$event'])
  public handleEscape() {
    this.closeEVT.emit();
  }

  public toggleImage(): void {
    this.toggleImage$.next(!this.toggleImage$.value);
  }
}
