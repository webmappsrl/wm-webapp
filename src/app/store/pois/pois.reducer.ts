import {createReducer, on} from '@ngrx/store';
import {IGeojsonFeature} from 'src/app/types/model';
import {loadPoisSuccess} from './pois.actions';

export const confFeatureKey = 'pois';
export interface IpoisRootState {
  [confFeatureKey]: IGeojsonFeature;
}
const initialPoisState: IGeojsonFeature = null as unknown as IGeojsonFeature;
export const poisReducer = createReducer(
  initialPoisState,
  on(loadPoisSuccess, (state, {pois}) => {
    return {
      state,
      ...pois,
    };
  }),
);
