import { Component, Input, OnInit } from '@angular/core';
import { CGeojsonLineStringFeature } from 'src/app/classes/features/cgeojson-line-string-feature';
import { UtilsService } from 'src/app/services/utils.service';
import { ILocaleString } from 'src/app/types/model';

@Component({
  selector: 'webmapp-track-technical-data',
  templateUrl: './track-technical-data.component.html',
  styleUrls: ['./track-technical-data.component.scss'],
})
export class TrackTechnicalDataComponent implements OnInit {
  @Input('feature') set feature(value: CGeojsonLineStringFeature) {
    this._feature = value;
    this.technicalData = this._initializeTechnicalData();
  }

  public technicalData?: Array<{
    label: string | ILocaleString;
    value: string;
  }>;

  private _feature: CGeojsonLineStringFeature;

  constructor(private _utilsService: UtilsService) {}

  ngOnInit() {}

  private _initializeTechnicalData(): Array<{
    label: string | ILocaleString;
    value: string;
  }> {
    const technicalData: Array<{
      label: string | ILocaleString;
      value: string;
    }> = [];
    const technicalDataLabelPrefix: string = 'trackDetails.technicalData.';

    // Ascent
    if (this?._feature?.properties?.ascent) {
      technicalData.push({
        label: technicalDataLabelPrefix + 'ascent',
        value: this._utilsService.formatAscent(this._feature.properties.ascent),
      });
    }
    // Descent
    if (this?._feature?.properties?.descent) {
      technicalData.push({
        label: technicalDataLabelPrefix + 'descent',
        value: this._utilsService.formatDescent(
          this._feature.properties.descent
        ),
      });
    }
    // Ele from
    if (this?._feature?.properties?.ele_from) {
      technicalData.push({
        label: technicalDataLabelPrefix + 'ele_from',
        value: this._utilsService.formatElevation(
          this._feature.properties.ele_from
        ),
      });
    }
    // Ele to
    if (this?._feature?.properties?.ele_to) {
      technicalData.push({
        label: technicalDataLabelPrefix + 'ele_to',
        value: this._utilsService.formatElevation(
          this._feature.properties.ele_to
        ),
      });
    }
    // Ele min
    if (this?._feature?.properties?.ele_min) {
      technicalData.push({
        label: technicalDataLabelPrefix + 'ele_min',
        value: this._utilsService.formatElevation(
          this._feature.properties.ele_min
        ),
      });
    }
    // Ele max
    if (this?._feature?.properties?.ele_max) {
      technicalData.push({
        label: technicalDataLabelPrefix + 'ele_max',
        value: this._utilsService.formatElevation(
          this._feature.properties.ele_max
        ),
      });
    }
    // Duration forward
    if (this?._feature?.properties?.duration_forward) {
      technicalData.push({
        label: technicalDataLabelPrefix + 'duration_forward',
        value: this._utilsService.formatDuration(
          this._feature.properties.duration_forward
        ),
      });
    }
    // Duration backward
    if (this?._feature?.properties?.duration_backward) {
      technicalData.push({
        label: technicalDataLabelPrefix + 'duration_backward',
        value: this._utilsService.formatDuration(
          this._feature.properties.duration_backward
        ),
      });
    }
    // Distance
    if (this?._feature?.properties?.distance) {
      technicalData.push({
        label: technicalDataLabelPrefix + 'distance',
        value: this._utilsService.formatDistance(
          this._feature.properties.distance
        ),
      });
    }

    return technicalData;
  }
}
