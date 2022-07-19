import {createReducer, on} from '@ngrx/store';
import {setCurrentLayer, setCurrentPoiId} from './UI.actions';

export const featureKey = 'UI';
export interface IUIRootState {
  [featureKey]: {
    currentLayer?: ILAYER;
    currentPoiId?: number;
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
);
