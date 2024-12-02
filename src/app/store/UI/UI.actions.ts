import {createAction, props} from '@ngrx/store';
import {ILAYER} from '@wm-core/types/config';
import {WmFeature} from '@wm-types/feature';
import {Point} from 'geojson';

export const setCurrentLayer = createAction(
  '[UI] Set current layer',
  props<{currentLayer: ILAYER}>(),
);
export const setCurrentPoi = createAction(
  '[UI] Set current poi',
  props<{currentPoi: WmFeature<Point>}>(),
);
export const setCurrentFilters = createAction(
  '[UI] Set current Filters',
  props<{currentFilters: any[]}>(),
);
export const enabledDrawTrack = createAction(
  '[UI] Enable draw track',
  props<{drawTrack: boolean}>(),
);
export const loadConfFail = createAction('[UI] Set current layer Success Fail');
