import {IConfRootState} from './conf/conf.reducer';
import {IElasticAllRootState, ApiRootState} from './elastic/elastic.reducer';
import {IpoisRootState} from './pois/pois.reducer';

export type AppState =
  | IConfRootState
  | ApiRootState
  | IElasticAllRootState
  | IpoisRootState; /* & OtherRootState  & ... */
