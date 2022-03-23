import {createFeatureSelector, createSelector} from '@ngrx/store';
import {featureKey} from './elastic.reducer';
import {SearchResponse} from 'elasticsearch';
export const elasticFeature = createFeatureSelector<IELASTIC>(featureKey);
export const elasticHits = createSelector(elasticFeature, (state: SearchResponse<IHIT>) =>
  state.hits && state.hits.hits ? state.hits.hits.map(hit => hit._source) : [],
);
