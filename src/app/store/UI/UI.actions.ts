import {createAction, props} from '@ngrx/store';

export const setCurrentLayer = createAction(
  '[UI] Set current layer',
  props<{currentLayer: ILAYER}>(),
);
export const loadConfFail = createAction('[UI] Set current layer Success Fail');
