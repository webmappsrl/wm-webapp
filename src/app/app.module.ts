import * as Sentry from '@sentry/angular';

import {APP_INITIALIZER, ErrorHandler, LOCALE_ID, NgModule} from '@angular/core';
import {HttpClient, HttpClientModule} from '@angular/common/http';
import {IonicModule, IonicRouteStrategy} from '@ionic/angular';
import {RouteReuseStrategy, Router} from '@angular/router';
import {TranslateLoader, TranslateModule} from '@ngx-translate/core';
import {elasticAllReducer, elasticSearchReducer} from './store/elastic/elastic.reducer';

import {AppComponent} from './app.component';
import {AppRoutingModule} from './app-routing.module';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserTracing} from '@sentry/tracing';
import {ConfEffects} from './store/conf/conf.effects';
import {EffectsModule} from '@ngrx/effects';
import {ElasticEffects} from './store/elastic/elastic.effects';
import {MetaComponent} from './meta.component';
import {PoisEffects} from './store/pois/pois.effects';
import {StoreDevtoolsModule} from '@ngrx/store-devtools';
import {StoreModule} from '@ngrx/store';
import {TranslateHttpLoader} from '@ngx-translate/http-loader';
import {UIReducer} from './store/UI/UI.reducer';
import {confReducer} from './store/conf/conf.reducer';
import {enableProdMode} from '@angular/core';
import {environment} from 'src/environments/environment';
import localeIt from '@angular/common/locales/it';
import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';
import {poisReducer} from './store/pois/pois.reducer';
import {registerLocaleData} from '@angular/common';

registerLocaleData(localeIt);

Sentry.init({
  dsn: 'https://e2a23f791e164c2598a2381904455296@o4504020145930240.ingest.sentry.io/4504020148027392',
  integrations: [
    new BrowserTracing({
      tracingOrigins: ['localhost', 'https://yourserver.io/api'],
      routingInstrumentation: Sentry.routingInstrumentation,
    }),
  ],

  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: 1.0,
});
enableProdMode();

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
        UI: UIReducer,
        pois: poisReducer,
      },
      {},
    ),
    EffectsModule.forRoot([ConfEffects, ElasticEffects, PoisEffects]),
    StoreDevtoolsModule.instrument({
      maxAge: 25, // Retains last 25 states
      logOnly: environment.production, // Restrict extension to log-only mode
    }),
  ],
  providers: [
    {provide: RouteReuseStrategy, useClass: IonicRouteStrategy},
    {provide: LOCALE_ID, useValue: 'it'},
    {
      provide: ErrorHandler,
      useValue: Sentry.createErrorHandler({
        showDialog: false,
      }),
    },
    {
      provide: Sentry.TraceService,
      deps: [Router],
    },
    {
      provide: APP_INITIALIZER,
      useFactory: () => () => {},
      deps: [Sentry.TraceService],
      multi: true,
    },
  ],
  bootstrap: [AppComponent, MetaComponent],
})
export class AppModule {}

platformBrowserDynamic()
  .bootstrapModule(AppModule)
  .then(success => console.log(`Bootstrap success`))
  .catch(err => console.error(err));
