import {createAction, props} from '@ngrx/store';
import {ILAYER} from 'src/app/shared/map-core/src/types/layer';

export const setCurrentLayer = createAction(
  '[UI] Set current layer',
  props<{currentLayer: ILAYER}>(),
);
export const setCurrentPoi = createAction('[UI] Set current poi', props<{currentPoi: any}>());
export const setCurrentFilters = createAction(
  '[UI] Set current Filters',
  props<{currentFilters: any[]}>(),
);
export const enabledDrawTrack = createAction(
  '[UI] Enable draw track',
  props<{drawTrack: boolean}>(),
);
export const loadConfFail = createAction('[UI] Set current layer Success Fail');
