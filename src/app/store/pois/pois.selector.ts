import {createFeatureSelector, createSelector} from '@ngrx/store';
import {confFeatureKey} from './pois.reducer';
import {IGeojsonFeature} from 'src/app/types/model';

export const poisFeature = createFeatureSelector<IGeojsonFeature>(confFeatureKey);
export const pois = createSelector(poisFeature, state => state);
