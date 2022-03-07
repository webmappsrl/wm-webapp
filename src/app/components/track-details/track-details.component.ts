import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';

import {IonContent, ModalController} from '@ionic/angular';

import {CGeojsonLineStringFeature} from 'src/app/classes/features/cgeojson-line-string-feature';
import {IGeojsonProperties} from 'src/app/types/model';
import {ITrackElevationChartHoverElements} from 'src/app/types/track-elevation-chart';

import {ModalGalleryComponent} from './modal-gallery/modal-gallery.component';

@Component({
  selector: 'webmapp-track-details',
  templateUrl: './track-details.component.html',
  styleUrls: ['./track-details.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class TrackDetailsComponent implements OnInit {
  @ViewChild('content') content: IonContent;
  @Output('poi-click') poiClick: EventEmitter<number> = new EventEmitter<number>();

  @Input('track') set setTrack(track: CGeojsonLineStringFeature) {
    if (track != null) {
      this.track = track;
      this._initializeFeature();
    }
  }

  @Input('poi') set setPoi(id: number) {
    this.poiId = id;
  }

  @Output('trackElevationChartHover')
  trackElevationChartHover: EventEmitter<ITrackElevationChartHoverElements> = new EventEmitter<ITrackElevationChartHoverElements>();

  @Output('dismiss') dismiss: EventEmitter<any> = new EventEmitter<any>();

  public feature: CGeojsonLineStringFeature;
  public data: Partial<IGeojsonProperties>;

  track: CGeojsonLineStringFeature;
  poiId: number;

  constructor(private _modalController: ModalController) {}

  ngOnInit() {}

  onLocationHover(event: ITrackElevationChartHoverElements) {
    this.trackElevationChartHover.emit(event);
  }

  triggerDismiss() {
    this.dismiss.emit();
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

    if (this.content) {
      this.content.scrollToTop();
    }
  }
}
