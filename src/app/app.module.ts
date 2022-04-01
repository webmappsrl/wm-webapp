import {LOCALE_ID, NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {RouteReuseStrategy} from '@angular/router';

import {IonicModule, IonicRouteStrategy} from '@ionic/angular';

import {AppComponent} from './app.component';
import {AppRoutingModule} from './app-routing.module';
import {HttpClient, HttpClientModule} from '@angular/common/http';
import {TranslateLoader, TranslateModule} from '@ngx-translate/core';
import {TranslateHttpLoader} from '@ngx-translate/http-loader';
import {registerLocaleData} from '@angular/common';
import localeIt from '@angular/common/locales/it';
import {confReducer} from './store/conf/conf.reducer';
import {StoreModule} from '@ngrx/store';
import {EffectsModule} from '@ngrx/effects';
import {ConfEffects} from './store/conf/conf.effects';
import {StoreDevtoolsModule} from '@ngrx/store-devtools';
import {environment} from 'src/environments/environment';
import {MetaComponent} from './meta.component';
import {elasticAllReducer, elasticSearchReducer} from './store/elastic/elastic.reducer';
import {ElasticEffects} from './store/elastic/elastic.effects';

registerLocaleData(localeIt);

@NgModule({
  declarations: [AppComponent, MetaComponent],
  entryComponents: [],
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    HttpClientModule,
    AppRoutingModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: (http: HttpClient) => {
          return new TranslateHttpLoader(http, './assets/i18n/', '.json');
        },
        deps: [HttpClient],
      },
    }),
    StoreModule.forRoot(
      {
        conf: confReducer,
        search: elasticSearchReducer,
        all: elasticAllReducer,
      },
      {},
    ),
    EffectsModule.forRoot([ConfEffects, ElasticEffects]),
    StoreDevtoolsModule.instrument({
      maxAge: 25, // Retains last 25 states
      logOnly: environment.production, // Restrict extension to log-only mode
    }),
  ],
  providers: [
    {provide: RouteReuseStrategy, useClass: IonicRouteStrategy},
    {provide: LOCALE_ID, useValue: 'it'},
  ],
  bootstrap: [AppComponent, MetaComponent],
})
export class AppModule {}
