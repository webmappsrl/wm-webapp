import {createReducer, on} from '@ngrx/store';
import {setCurrentLayer} from './UI.actions';

export const featureKey = 'UI';
export interface IUIRootState {
  [featureKey]: {
    currentLayer?: ILAYER;
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
);
