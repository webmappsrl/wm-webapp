import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { IonContent, ModalController } from '@ionic/angular';
import { CGeojsonLineStringFeature } from 'src/app/classes/features/cgeojson-line-string-feature';
import { GeohubService } from 'src/app/services/geohub.service';
import { ILocaleString, IWmImage } from 'src/app/types/model';
import { ITrackElevationChartHoverElements } from 'src/app/types/track-elevation-chart';
import { ModalGalleryComponent } from './modal-gallery/modal-gallery.component';

@Component({
  selector: 'webmapp-track-details',
  templateUrl: './track-details.component.html',
  styleUrls: ['./track-details.component.scss'],
})
export class TrackDetailsComponent implements OnInit {
  @ViewChild('content') content: IonContent;

  @Input('id') set id(value: number) {
    this._id = value;
    this._initializeFeature();
  }

  @Output('trackElevationChartHover')
  trackElevationChartHover: EventEmitter<ITrackElevationChartHoverElements> = new EventEmitter<ITrackElevationChartHoverElements>();

  @Output('dismiss') dismiss: EventEmitter<any> = new EventEmitter<any>();

  public feature: CGeojsonLineStringFeature;
  public data: {
    name?: string | ILocaleString;
    description?: string | ILocaleString;
    gallery?: Array<IWmImage>;
    featureImage?: IWmImage;
    activity?: any[];
  };

  private _id: number;

  constructor(
    private _geohubService: GeohubService,
    private _modalController: ModalController
  ) { }

  ngOnInit() { }

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
        .then((modal) => {
          modal.present();
        });
  }

  /**
   * Get the track geojson and initialize all the data to show
   *
   * @returns
   */
  private async _initializeFeature(): Promise<void> {
    if (!this._id) {
      this.data = undefined;
      return;
    }
    this.feature = await this._geohubService.getEcTrack(this._id);

    this.data = {};
    if (this.feature?.properties) {
      this.data.name = this.feature.properties?.name;
      this.data.description = this.feature.properties?.description;
      this.data.gallery = this.feature.properties?.image_gallery;
      this.data.featureImage = this.feature.properties?.feature_image;
      this.data.activity = this.feature.properties.taxonomy.activity;
    }

    if (this.content) {
      this.content.scrollToTop();
    }
  }
}
