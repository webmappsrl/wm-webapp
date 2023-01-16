import {createReducer, on} from '@ngrx/store';
import {
  allElasticSuccess,
  searchElasticSuccess,
  layerTracksElasticSuccess,
} from './elastic.actions';

export const searchKey = 'search';
export const allKey = 'all';
export interface IElasticSearchRootState {
  [searchKey]: IELASTIC;
}
export interface IElasticAllRootState {
  [allKey]: IELASTIC;
}
const initialConfState: IELASTIC = {};
export const elasticSearchReducer = createReducer(
  initialConfState,
  on(searchElasticSuccess, (state, {search}) => ({state, ...search})),
);
export const elasticAllReducer = createReducer(
  initialConfState,
  on(allElasticSuccess, (state, {all}) => ({state, ...all})),
);
export const elasticLayerTracksReducer = createReducer(
  initialConfState,
  on(layerTracksElasticSuccess, (state, {tracks}) => {
    return {state, ...tracks};
  }),
);
