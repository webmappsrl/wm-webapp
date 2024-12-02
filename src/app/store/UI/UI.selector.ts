import {createFeatureSelector, createSelector} from '@ngrx/store';
import {ILAYER} from '@wm-core/types/config';
import {WmFeature} from '@wm-types/feature';
import {Point} from 'geojson';
import {featureKey} from './UI.reducer';

const feature = createFeatureSelector<{
  currentLayer?: ILAYER;
  currentPoi?: WmFeature<Point>;
  currentFilters?: string[];
  drawTrack: boolean;
} | null>(featureKey);

export const UICurrentPoi = createSelector(feature, state =>
  state && state.currentPoi ? state.currentPoi : null,
);
export const UICurrentPoiId = createSelector(
  UICurrentPoi,
  UICurrentPoi => UICurrentPoi?.properties?.id ?? null,
);

export const enabledDrawTrack = createSelector(feature, state =>
  state && state.drawTrack ? state.drawTrack : false,
);
