import {createAction, props} from '@ngrx/store';
import {IConf} from './model';

export const loadConf = createAction('[conf] Load configuration');
export const loadConfSuccess = createAction(
  '[conf] Load configuration Success',
  props<{conf: IConf}>(),
);
export const loadConfFail = createAction('[conf] Load configuration Fail');
