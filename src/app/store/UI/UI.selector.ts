import {createFeatureSelector, createSelector} from '@ngrx/store';

import {featureKey} from './UI.reducer';

const feature = createFeatureSelector<{
  currentLayer?: ILAYER;
  currentPoiId?: number;
} | null>(featureKey);

export const UICurrentLAyer = createSelector(feature, state =>
  state && state.currentLayer ? state.currentLayer : null,
);
export const UICurrentPoiId = createSelector(feature, state =>
  state && state.currentPoiId ? state.currentPoiId : null,
);
