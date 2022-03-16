import {createFeatureSelector, createSelector} from '@ngrx/store';
import {confFeatureKey, IConfRootState} from './conf.reducer';
import {IConfState} from './model';

const confFeature = createFeatureSelector<IConfRootState, IConfState>(confFeatureKey);

export const confAPP = createSelector(confFeature, state => state.APP);
export const confTHEME = createSelector(confFeature, state => state.THEME);
