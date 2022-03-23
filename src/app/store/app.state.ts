import {IConfRootState} from './conf/conf.reducer';
import {IElasticRootState} from './elastic/elastic.reducer';

export type AppState = IConfRootState | IElasticRootState; /* & OtherRootState  & ... */
