import {HttpClient, HttpClientModule} from '@angular/common/http';
import {IonicModule, IonicRouteStrategy} from '@ionic/angular';
import {LOCALE_ID, NgModule} from '@angular/core';
import {TranslateLoader, TranslateModule} from '@ngx-translate/core';

import {AppComponent} from './app.component';
import {AppRoutingModule} from './app-routing.module';
import {BrowserModule} from '@angular/platform-browser';
import {ConfEffects} from './store/conf/conf.effects';
import {EffectsModule} from '@ngrx/effects';
import {MetaComponent} from './meta.component';
import {PoisEffects} from './store/pois/pois.effects';
import {RouteReuseStrategy} from '@angular/router';
import {StoreDevtoolsModule} from '@ngrx/store-devtools';
import {StoreModule} from '@ngrx/store';
import {TranslateHttpLoader} from '@ngx-translate/http-loader';
import {UIReducer} from './store/UI/UI.reducer';
import {confReducer} from './store/conf/conf.reducer';
import {environment} from 'src/environments/environment';
import localeIt from '@angular/common/locales/it';
import {poisReducer} from './store/pois/pois.reducer';
import {registerLocaleData} from '@angular/common';
import {WmCoreModule} from './shared/wm-core/wm-core.module';

registerLocaleData(localeIt);

@NgModule({
  declarations: [AppComponent, MetaComponent],
  entryComponents: [],
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    WmCoreModule,
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
        UI: UIReducer,
        pois: poisReducer,
      },
      {},
    ),
    EffectsModule.forRoot([ConfEffects, PoisEffects]),
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
