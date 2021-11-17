import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { IonContent } from '@ionic/angular';
import { CGeojsonLineStringFeature } from 'src/app/classes/features/cgeojson-line-string-feature';
import { GeohubService } from 'src/app/services/geohub.service';
import { ILocaleString } from 'src/app/types/model';

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

  @Output('dismiss') dismiss: EventEmitter<any> = new EventEmitter<any>();

  public feature: CGeojsonLineStringFeature;
  public data: {
    name?: string | ILocaleString;
  };

  private _id: number;

  constructor(private _geohubService: GeohubService) {}

  ngOnInit() {}

  triggerDismiss() {
    this.dismiss.emit();
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
    }

    if (this.content) {
      this.content.scrollToTop();
    }
  }
}
