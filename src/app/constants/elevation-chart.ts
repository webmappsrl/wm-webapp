import {ITrackElevationChartStyle} from '../types/track-elevation-chart';
import {ETrackElevationChartSurface} from '../types/etrack-elevation-chart.enum';

export const TRACK_ELEVATION_CHART_SLOPE_EASY: [number, number, number] = [67, 227, 9];
export const TRACK_ELEVATION_CHART_SLOPE_MEDIUM_EASY: [number, number, number] = [195, 255, 0];
export const TRACK_ELEVATION_CHART_SLOPE_MEDIUM: [number, number, number] = [255, 239, 10];
export const TRACK_ELEVATION_CHART_SLOPE_MEDIUM_HARD: [number, number, number] = [255, 174, 0];
export const TRACK_ELEVATION_CHART_SLOPE_HARD: [number, number, number] = [196, 30, 4];

export const TRACK_ELEVATION_CHART_SURFACE: {
  [id in ETrackElevationChartSurface]: ITrackElevationChartStyle;
} = {
  [ETrackElevationChartSurface.ASPHALT]: {
    // backgroundColor: '55, 52, 60',
    backgroundColor: '186, 189, 194',
  },
  [ETrackElevationChartSurface.CONCRETE]: {
    // backgroundColor: '134, 130, 140',
    backgroundColor: '186, 189, 194',
  },
  [ETrackElevationChartSurface.DIRT]: {
    // backgroundColor: '125, 84, 62',
    backgroundColor: '186, 189, 194',
  },
  [ETrackElevationChartSurface.GRASS]: {
    // backgroundColor: '143, 176, 85',
    backgroundColor: '186, 189, 194',
  },
  [ETrackElevationChartSurface.GRAVEL]: {
    // backgroundColor: '5, 56, 85',
    backgroundColor: '186, 189, 194',
  },
  [ETrackElevationChartSurface.PAVED]: {
    // backgroundColor: '116, 140, 172',
    backgroundColor: '186, 189, 194',
  },
  [ETrackElevationChartSurface.SAND]: {
    // backgroundColor: '245, 213, 56',
    backgroundColor: '186, 189, 194',
  },
};
