import {createAction, props} from '@ngrx/store';
import {IGeojsonFeature} from 'src/app/types/model';

export const loadPois = createAction('[pois] Load pois');
export const loadPoisSuccess = createAction(
  '[pois] Load pois Success',
  props<{pois: IGeojsonFeature}>(),
);
export const loadPoisFail = createAction('[pois] Load pois Fail');
