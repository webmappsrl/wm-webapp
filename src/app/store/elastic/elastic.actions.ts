import {createAction, props} from '@ngrx/store';

export const loadElastic = createAction('[elastic] Load', props<{inputTyped: string}>());
export const loadElasticSuccess = createAction(
  '[elastic] Load Success',
  props<{elastic: IELASTIC}>(),
);
export const loadElasticFail = createAction('[elastic] Load Fail');
