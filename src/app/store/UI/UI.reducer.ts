import {createReducer, on} from '@ngrx/store';
import {ILAYER} from '@wm-core/types/config';
import {WmFeature} from '@wm-types/feature';
import {Point} from 'geojson';
import {enabledDrawTrack, setCurrentFilters, setCurrentLayer, setCurrentPoi} from './UI.actions';

export const featureKey = 'UI';
export interface IUIRootState {
  [featureKey]: {
    currentLayer?: ILAYER;
    currentPoi?: WmFeature<Point>;
    currentFilters?: any[];
  } | null;
}
const initialUIState: IUIRootState = null;
export const UIReducer = createReducer(
  initialUIState,
  on(setCurrentLayer, (state, {currentLayer}) => {
    return {
      ...state,
      ...{currentLayer},
    };
  }),
  on(setCurrentPoi, (state, {currentPoi}) => {
    return {
      ...state,
      ...{currentPoi},
    };
  }),
  on(setCurrentFilters, (state, {currentFilters}) => {
    return {
      ...state,
      ...{currentFilters},
    };
  }),
  on(enabledDrawTrack, (state, {drawTrack}) => {
    return {
      ...state,
      ...{drawTrack},
    };
  }),
);
