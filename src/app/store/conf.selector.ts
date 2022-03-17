import {createFeatureSelector, createSelector} from '@ngrx/store';
import {getCSSVariables} from '../functions/theme';
import {confFeatureKey} from './conf.reducer';

const confFeature = createFeatureSelector<ICONF>(confFeatureKey);
export const confAPP = createSelector(confFeature, state => state.APP);
export const confTHEME = createSelector(confFeature, state => state.THEME);
export const confLANGUAGES = createSelector(confFeature, state => state.LANGUAGES);
export const confHOME = createSelector(confFeature, state => state.HOME);

export const confTHEMEVariables = createSelector(confTHEME, (theme: ITHEME) =>
  getCSSVariables(theme),
);
