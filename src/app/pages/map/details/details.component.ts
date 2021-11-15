import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { IonContent } from '@ionic/angular';
import { CGeojsonFeature } from 'src/app/classes/features/cgeojson-feature';
import { GeohubService } from 'src/app/services/geohub.service';

@Component({
  selector: 'webmapp-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss'],
})
export class DetailsComponent implements OnInit {
  @ViewChild('content') content: IonContent;

  @Input('id') set id(value: number) {
    this._id = value;
    this._initializeFeature();
  }

  private _id: number;
  private _feature: CGeojsonFeature;

  public data: Array<[string, string]>;

  constructor(private _geohubService: GeohubService) {}

  ngOnInit() {}

  private async _initializeFeature() {
    if (!this._id) {
      this.data = undefined;
      return;
    }
    this._feature = await this._geohubService.getEcTrack(this._id);

    this.data = [];
    if (this._feature?.properties) {
      for (let i in this._feature.properties) {
        this.data.push([i, JSON.stringify(this._feature.properties[i])]);
      }
    }

    if (this.content) {
      this.content.scrollToTop();
    }
  }
}
