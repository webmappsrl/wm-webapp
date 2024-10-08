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

import {IGeojsonProperties} from 'src/app/types/model';
import {ITrackElevationChartHoverElements} from 'src/app/types/track-elevation-chart';
import {ModalGalleryComponent} from './modal-gallery/modal-gallery.component';
import {Store} from '@ngrx/store';
import {confShowEditingInline} from 'wm-core/store/conf/conf.selector';
import {apiElasticStateLayer} from 'wm-core/store/api/api.selector';
import {Feature} from 'geojson';

@Component({
  selector: 'webmapp-track-details',
  templateUrl: './track-details.component.html',
  styleUrls: ['./track-details.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class TrackDetailsComponent {
  @Input('poi') set setPoi(id: number | 'reset') {
    if (typeof id === 'number') {
      this.poiId = id;
    }
  }

  @Input('track') set setTrack(track: Feature) {
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
  public feature: Feature;
  poiId: number;
  track: Feature;

  constructor(private _modalController: ModalController, private _store: Store) {}

  onLocationHover(event: ITrackElevationChartHoverElements | any) {
    this.trackElevationChartHover.emit(event);
  }

  open() {
    this._modalController
      .create({
        component: ModalGalleryComponent,
        cssClass: 'modal-gallery-class',
        componentProps: {
          gallery: [this.data.featureImage],
        },
      })
      .then(modal => {
        modal.present();
      });
  }

  openGeohub(): void {
    const id = this.track && this.track.properties && this.track.properties.id;
    if (id != null) {
      const url = `https://geohub.webmapp.it/resources/ec-tracks/${id}/edit?viaResource&viaResourceId&viaRelationship`;
      window.open(url, '_blank').focus();
    }
  }

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
    if (this.track?.properties) {
      this.data = {...this.track.properties};
    }
  }
}
