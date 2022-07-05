import {IConfRootState} from './conf/conf.reducer';
import {IElasticAllRootState, IElasticSearchRootState} from './elastic/elastic.reducer';
import {IpoisRootState} from './pois/pois.reducer';

export type AppState =
  | IConfRootState
  | IElasticSearchRootState
  | IElasticAllRootState
  | IpoisRootState; /* & OtherRootState  & ... */
