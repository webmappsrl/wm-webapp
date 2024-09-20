import {confOPTIONS, confTRACKFORMS} from 'wm-core/store/conf/conf.selector';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import {IonContent} from '@ionic/angular';

import {CGeojsonLineStringFeature} from 'src/app/classes/features/cgeojson-line-string-feature';
import {IGeojsonProperties} from 'src/app/types/model';
import {ITrackElevationChartHoverElements} from 'src/app/types/track-elevation-chart';
import {Store} from '@ngrx/store';
import {confShowEditingInline} from 'wm-core/store/conf/conf.selector';
import {apiElasticStateLayer} from 'wm-core/store/api/api.selector';
import {ITrack} from 'wm-core/types/track';
import {BehaviorSubject, Observable} from 'rxjs';

@Component({
  selector: 'wm-ugc-details',
  templateUrl: './ugc-details.component.html',
  styleUrls: ['./ugc-details.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class UgcDetailsComponent {
  @Input('poi') set setPoi(id: number | 'reset') {
    if (typeof id === 'number') {
      this.poiId = id;
    }
  }

  @Input('track') set setTrack(track: ITrack) {
    if (track != null) {
      this.track = track;
    }
  }

  @Output('dismiss') dismiss: EventEmitter<any> = new EventEmitter<any>();
  @Output('poi-click') poiClick: EventEmitter<number> = new EventEmitter<number>();
  @Output('trackElevationChartHover')
  trackElevationChartHover: EventEmitter<ITrackElevationChartHoverElements> =
    new EventEmitter<ITrackElevationChartHoverElements>();
  @ViewChild('content') content: IonContent;

  confTRACKFORMS$: Observable<any[]> = this._store.select(confTRACKFORMS);
  confOPTIONS$ = this._store.select(confOPTIONS);
  currentLayer$ = this._store.select(apiElasticStateLayer);
  public data: Partial<IGeojsonProperties>;
  enableEditingInline$ = this._store.select(confShowEditingInline);
  public feature: CGeojsonLineStringFeature;
  poiId: number;
  track: ITrack;
  isEditing$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  constructor(private _store: Store) {}

  onLocationHover(event: ITrackElevationChartHoverElements | any) {
    this.trackElevationChartHover.emit(event);
  }

  save(): void {
    console.log('SALVA MODIFICHE');
  }

  triggerDismiss(): void {
    this.dismiss.emit();
  }

  enableEditing(): void {
    this.isEditing$;
  }
}
