import {createReducer, on} from '@ngrx/store';
import {setCurrentFilters, setCurrentLayer, setCurrentPoiId} from './UI.actions';

export const featureKey = 'UI';
export interface IUIRootState {
  [featureKey]: {
    currentLayer?: ILAYER;
    currentPoiId?: number;
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
  on(setCurrentPoiId, (state, {currentPoiId}) => {
    return {
      ...state,
      ...{currentPoiId},
    };
  }),
  on(setCurrentFilters, (state, {currentFilters}) => {
    return {
      ...state,
      ...{currentFilters},
    };
  }),
);
