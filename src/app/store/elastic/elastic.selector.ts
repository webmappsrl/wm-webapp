import {createFeatureSelector, createSelector} from '@ngrx/store';
import {SearchResponse} from 'elasticsearch';
export const elasticSearchFeature = createFeatureSelector<IELASTIC>('search');
export const elasticAllFeature = createFeatureSelector<IELASTIC>('all');
export const elasticSearch = createSelector(elasticSearchFeature, (state: SearchResponse<IHIT>) =>
  state != null && state.hits && state.hits.hits ? state.hits.hits.map(hit => hit._source) : [],
);
export const elasticAll = createSelector(elasticAllFeature, (state: SearchResponse<IHIT>) =>
  state != null && state.hits && state.hits.hits ? state.hits.hits.map(hit => hit._source) : [],
);
