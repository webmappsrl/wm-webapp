import {confOPTIONS} from 'wm-core/store/conf/conf.selector';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import {IonContent, ModalController} from '@ionic/angular';

import {CGeojsonLineStringFeature} from 'src/app/classes/features/cgeojson-line-string-feature';
import {IGeojsonProperties} from 'src/app/types/model';
import {ITrackElevationChartHoverElements} from 'src/app/types/track-elevation-chart';
import {Store} from '@ngrx/store';
import {confShowEditingInline} from 'wm-core/store/conf/conf.selector';
import {apiElasticStateLayer} from 'wm-core/store/api/api.selector';
import {map} from 'rxjs/operators';
import { ITrack } from 'wm-core/types/track';
import { Observable } from 'rxjs';

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
      this._initializeFeature();
    }
  }

  @Output('dismiss') dismiss: EventEmitter<any> = new EventEmitter<any>();
  @Output('poi-click') poiClick: EventEmitter<number> = new EventEmitter<number>();
  @Output('trackElevationChartHover')
  trackElevationChartHover: EventEmitter<ITrackElevationChartHoverElements> =
    new EventEmitter<ITrackElevationChartHoverElements>();
  @ViewChild('content') content: IonContent;

  confOPTIONS$ = this._store.select(confOPTIONS);
  currentLayer$ = this._store.select(apiElasticStateLayer);
  public data: Partial<IGeojsonProperties>;
  enableEditingInline$ = this._store.select(confShowEditingInline);
  public feature: CGeojsonLineStringFeature;
  poiId: number;
  track: ITrack;

  constructor(private _modalCtrl: ModalController, private _store: Store) {}

  onLocationHover(event: ITrackElevationChartHoverElements | any) {
    this.trackElevationChartHover.emit(event);
  }

  open() {
    // this._modalCtrl
    //   .create({
    //     component: ModalGalleryComponent,
    //     cssClass: 'modal-gallery-class',
    //     componentProps: {
    //       gallery: [this.data.featureImage],
    //     },
    //   })
    //   .then(modal => {
    //     modal.present();
    //   });
  }

  // openGeohub(): void {
  //   const id = this.track && this.track.properties && this.track.properties.id;
  //   if (id != null) {
  //     const url = `https://geohub.webmapp.it/resources/ec-tracks/${id}/edit?viaResource&viaResourceId&viaRelationship`;
  //     window.open(url, '_blank').focus();
  //   }
  // }

  triggerDismiss() {
    this.dismiss.emit();
  }

  /**
   * Get the track geojson and initialize all the data to show
   *
   * @returns
   */
  private async _initializeFeature(): Promise<void> {
    if (!this.track) {
      this.data = undefined;
      return;
    }
    if (this.track) {
      // this.data = {...this.track.properties};
    }
  }
}
