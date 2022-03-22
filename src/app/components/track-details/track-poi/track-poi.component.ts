import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  ViewEncapsulation,
} from '@angular/core';

import {CGeojsonLineStringFeature} from 'src/app/classes/features/cgeojson-line-string-feature';
import {IGeojsonProperties} from 'src/app/types/model';

@Component({
  selector: 'webmapp-track-poi',
  templateUrl: './track-poi.component.html',
  styleUrls: ['./track-poi.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class TrackPoiComponent {
  @Output('poi-click') poiClick: EventEmitter<number> = new EventEmitter<number>();

  @Input('track') set feature(track: CGeojsonLineStringFeature) {
    this.poi = [];
    this.poiClick.emit(-1);
    if (track != null && track.properties != null && track.properties.related_pois != null) {
      this.poi = track.properties.related_pois.map(relatedPoi => {
        const properties = relatedPoi.properties;
        if (properties.related_url != null) {
          delete properties.related_url[''];
          properties.related_url =
            Object.keys(properties.related_url).length === 0
              ? null
              : properties.related_url || undefined;
        }

        properties.address = [properties.addr_locality, properties.addr_street]
          .filter(f => f != null)
          .join(', ');
        return properties;
      });
    }
  }
  @Input('poi') set setPoi(id: number) {
    const newCurrentPoi = this.poi.find(p => p.id === id);
    this.currentPoi = newCurrentPoi;
  }

  defaultPhotoPath = '/assets/icon/no-photo.svg';
  poi: IGeojsonProperties[] = [];
  currentPoi: IGeojsonProperties = null;

  selectPoi(poi: IGeojsonProperties) {
    this.currentPoi = poi;
    this.poiClick.emit(poi.id);
  }
}
