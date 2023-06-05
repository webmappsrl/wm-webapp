import {createFeatureSelector, createSelector} from '@ngrx/store';
import {featureKey} from './UI.reducer';

const feature = createFeatureSelector<{
  currentLayer?: ILAYER;
  currentPoi?: any;
  currentFilters?: string[];
  drawTrack: boolean;
} | null>(featureKey);

export const UICurrentPoi = createSelector(feature, state =>
  state && state.currentPoi ? state.currentPoi : null,
);
export const UICurrentPoiId = createSelector(UICurrentPoi, state =>
  state && state.id ? state.id : null,
);

export const enabledDrawTrack = createSelector(feature, state =>
  state && state.drawTrack ? state.drawTrack : false,
);
