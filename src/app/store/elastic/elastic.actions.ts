import {createAction, props} from '@ngrx/store';

export const searchElastic = createAction('[elastic] Search', props<{inputTyped: string}>());
export const searchElasticSuccess = createAction(
  '[elastic] Search Success',
  props<{search: IELASTIC}>(),
);
export const searchElasticFail = createAction('[elastic] Search Fail');

export const allElastic = createAction('[elastic] All');
export const allElasticSuccess = createAction('[elastic] All Success', props<{all: IELASTIC}>());
export const allElasticFail = createAction('[elastic] All Fail');

export const layerTracksElastic = createAction(
  '[elastic] get all tracks of layer',
  props<{layer: number; inputTyped: string}>(),
);
export const layerTracksElasticSuccess = createAction(
  '[elastic] get all tracks of layer Success',
  props<{tracks: IELASTIC}>(),
);
export const layerTracksElasticFail = createAction('[elastic] get all tracks of layer Fail');
