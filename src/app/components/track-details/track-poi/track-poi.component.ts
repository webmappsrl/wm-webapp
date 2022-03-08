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
    if (track != null && track.properties != null && track.properties.related_pois != null) {
      this.poi = track.properties.related_pois.map(relatedPoi => relatedPoi.properties);
    }
  }
  @Input('poi') set setPoi(id: number) {
    const newCurrentPoi = this.poi.find(p => p.id === id);
    if (newCurrentPoi != null) {
      this.currentPoi = newCurrentPoi;
    }
  }

  poi: IGeojsonProperties[] = [];
  currentPoi: IGeojsonProperties = null;

  selectPoi(poi: IGeojsonProperties) {
    this.currentPoi = poi;
    this.poiClick.emit(poi.id);
  }
}
