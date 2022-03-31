import {createReducer, on} from '@ngrx/store';
import {loadElasticSuccess} from './elastic.actions';

export const featureKey = 'elastic';
export interface IElasticRootState {
  [featureKey]: IELASTIC;
}
const initialConfState: IELASTIC = {};
export const elasticReducer = createReducer(
  initialConfState,
  on(loadElasticSuccess, (state, {elastic}) => ({state, ...elastic})),
);
