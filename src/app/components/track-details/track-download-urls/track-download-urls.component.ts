import {Component, Input, OnInit} from '@angular/core';
import {CGeojsonLineStringFeature} from 'src/app/classes/features/cgeojson-line-string-feature';

@Component({
  selector: 'webmapp-track-download-urls',
  templateUrl: './track-download-urls.component.html',
  styleUrls: ['./track-download-urls.component.scss'],
})
export class TrackDownloadUrlsComponent implements OnInit {
  @Input('feature') set feature(value: CGeojsonLineStringFeature) {
    this._feature = value;
    this._initializeDownloadUrls();
  }

  gpx: string;
  kml: string;
  geojson: string;
  osm: string;

  private _feature: CGeojsonLineStringFeature;

  constructor() {}

  ngOnInit() {}

  private _initializeDownloadUrls(): void {
    this.gpx = this._feature?.properties?.gpx_url;
    this.kml = this._feature?.properties?.kml_url;
    this.geojson = this._feature?.properties?.geojson_url;
    this.osm = this._feature?.properties?.osm_url;
  }
}
