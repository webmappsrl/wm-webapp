import {createFeatureSelector, createSelector} from '@ngrx/store';
import {featureKey} from './UI.reducer';

const feature = createFeatureSelector<{
  currentLayer?: ILAYER;
} | null>(featureKey);

export const UICurrentLAyer = createSelector(feature, state =>
  state && state.currentLayer ? state.currentLayer : null,
);
