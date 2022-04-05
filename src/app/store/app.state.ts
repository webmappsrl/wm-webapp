import {IConfRootState} from './conf/conf.reducer';
import {IElasticAllRootState, IElasticSearchRootState} from './elastic/elastic.reducer';

export type AppState =
  | IConfRootState
  | IElasticSearchRootState
  | IElasticAllRootState; /* & OtherRootState  & ... */
