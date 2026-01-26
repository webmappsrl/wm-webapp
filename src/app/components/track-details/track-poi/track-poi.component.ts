import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  ViewEncapsulation,
} from '@angular/core';
import {Store} from '@ngrx/store';
import {WmFeature} from '@wm-types/feature';
import {LineString, Point} from 'geojson';
import {currentEcRelatedPoiId} from '@wm-core/store/features/ec/ec.selector';
@Component({
  standalone: false,
  selector: 'webmapp-track-poi',
  templateUrl: './track-poi.component.html',
  styleUrls: ['./track-poi.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class TrackPoiComponent {
  @Input('track') set feature(track: WmFeature<LineString>) {
    this.pois = [];
    this.poiClick.emit(null);
    if (track != null && track.properties != null && track.properties.related_pois != null) {
      this.pois = track.properties.related_pois.map(relatedPoi => {
        const properties = {...relatedPoi.properties};

        if (properties.related_url != null) {
          const updatedRelatedUrl = {...properties.related_url};
          delete updatedRelatedUrl[''];
          properties.related_url =
            Object.keys(updatedRelatedUrl).length === 0 ? null : updatedRelatedUrl || undefined;
        }

        properties.address = [properties.addr_locality, properties.addr_street]
          .filter(f => f != null)
          .join(', ');
        relatedPoi = {...relatedPoi, properties};
        return relatedPoi;
      });
    }
  }

  @Input('poi') set setPoi(id: number) {
    const newCurrentPoi = this.pois.find(p => p.id === id);
    this.currentPoi = newCurrentPoi;
  }

  @Output('poi-click') poiClick: EventEmitter<WmFeature<Point> | null> =
    new EventEmitter<WmFeature<Point> | null>();

  currentPoi: WmFeature<Point> = null;
  currentRelatedEcPid$ = this._store.select(currentEcRelatedPoiId);
  defaultPhotoPath = '/assets/icon/no-photo.svg';
  pois: WmFeature<Point>[] = [];

  constructor(private _store: Store) {}

  selectPoi(poi: WmFeature<Point>) {
    this.currentPoi = poi;
    this.poiClick.emit(poi);
  }
}
