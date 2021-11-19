import { CGeojsonLineStringFeature } from '../classes/features/cgeojson-line-string-feature';
import { ILocation } from './location';

export interface ITrackElevationChartStyle {
  backgroundColor: string;
}

export interface ITrackElevationChartHoverElements {
  location: ILocation;
  track?: CGeojsonLineStringFeature;
}
