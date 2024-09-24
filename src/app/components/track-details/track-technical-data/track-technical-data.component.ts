import {Component, Input, OnInit, ViewEncapsulation} from '@angular/core';

import {ILocaleString} from 'src/app/types/model';
import {UtilsService} from 'src/app/services/utils.service';
import { Feature } from 'geojson';

@Component({
  selector: 'webmapp-track-technical-data',
  templateUrl: './track-technical-data.component.html',
  styleUrls: ['./track-technical-data.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class TrackTechnicalDataComponent implements OnInit {
  private _feature: Feature;

  @Input('feature') set feature(value: Feature) {
    this._feature = value;
    this.technicalData = this._initializeTechnicalData();
  }

  public technicalData?: Array<{
    icon: string;
    label: string | ILocaleString;
    value: string | ILocaleString;
  }>;

  constructor(private _utilsService: UtilsService) {}

  ngOnInit() {}

  private _initializeTechnicalData(): Array<{
    icon: string;
    label: string | ILocaleString;
    value: string;
  }> {
    const technicalData: Array<{
      icon: string;
      label: string | ILocaleString;
      value: string;
    }> = [];
    const technicalDataLabelPrefix: string = '';

    // difficulty
    if (this?._feature?.properties?.difficulty) {
      technicalData.push({
        icon: 'icon-outline-difficulty',
        label: 'difficulty',
        value: this._feature.properties.difficulty as any,
      });
    }
    // Distance
    if (this?._feature?.properties?.distance) {
      technicalData.push({
        icon: 'icon-outline-distance',
        label: technicalDataLabelPrefix + 'distance',
        value: this._utilsService.formatDistance(this._feature.properties.distance),
      });
    }

    // Duration forward
    if (this?._feature?.properties?.duration_forward) {
      technicalData.push({
        icon: 'icon-outline-duration',
        label: technicalDataLabelPrefix + 'duration_forward',
        value: this._utilsService.formatDuration(this._feature.properties.duration_forward),
      });
    }
    // Duration backward
    if (
      this?._feature?.properties?.duration_backward &&
      this?._feature?.properties?.roundtrip === false
    ) {
      technicalData.push({
        icon: 'icon-outline-duration',
        label: technicalDataLabelPrefix + 'duration_backward',
        value: this._utilsService.formatDuration(this._feature.properties.duration_backward),
      });
    }

    // Ascent
    if (this?._feature?.properties?.ascent) {
      technicalData.push({
        icon: 'icon-outline-dislivello-positivo',
        label: technicalDataLabelPrefix + 'ascent',
        value: this._utilsService.formatAscent(this._feature.properties.ascent),
      });
    }
    // Descent
    if (this?._feature?.properties?.descent && this?._feature?.properties?.roundtrip === false) {
      technicalData.push({
        icon: 'icon-outline-dislivello-negativo',
        label: technicalDataLabelPrefix + 'descent',
        value: this._utilsService.formatDescent(this._feature.properties.descent),
      });
    }
    // Ele from
    if (this?._feature?.properties?.ele_from) {
      technicalData.push({
        icon: 'icon-fill-starting-point',
        label: technicalDataLabelPrefix + 'ele_from',
        value: this._utilsService.formatElevation(this._feature.properties.ele_from),
      });
    }
    // Ele to
    if (this?._feature?.properties?.ele_to && this?._feature?.properties?.roundtrip === false) {
      technicalData.push({
        icon: 'icon-fill-flag',
        label: technicalDataLabelPrefix + 'ele_to',
        value: this._utilsService.formatElevation(this._feature.properties.ele_to),
      });
    }
    // Ele min
    if (this?._feature?.properties?.ele_min) {
      technicalData.push({
        icon: 'icon-outline-minus',
        label: technicalDataLabelPrefix + 'ele_min',
        value: this._utilsService.formatElevation(this._feature.properties.ele_min),
      });
    }
    // Ele max
    if (this?._feature?.properties?.ele_max) {
      technicalData.push({
        icon: 'icon-outline-plus',
        label: technicalDataLabelPrefix + 'ele_max',
        value: this._utilsService.formatElevation(this._feature.properties.ele_max),
      });
    }

    return technicalData;
  }
}
