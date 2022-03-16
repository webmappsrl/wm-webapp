import {createFeatureSelector, createSelector} from '@ngrx/store';
import {BehaviorSubject} from 'rxjs';
import {getCSSVariables} from '../functions/theme';
import {confFeatureKey, IConfRootState} from './conf.reducer';
import {IConfState} from './model';

const confFeature = createFeatureSelector<IConfState>(confFeatureKey);
export const confAPP = createSelector(confFeature, state => state.APP);
export const confTHEME = createSelector(confFeature, state => state.THEME);
export const confTHEMEVariables = createSelector(confTHEME, (theme: ITHEME) =>
  getCSSVariables(theme),
);
