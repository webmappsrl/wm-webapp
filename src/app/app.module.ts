import {HttpClientModule} from '@angular/common/http';
import {LOCALE_ID, NgModule} from '@angular/core';
import {IonicModule, IonicRouteStrategy} from '@ionic/angular';

import {registerLocaleData} from '@angular/common';
import localeIt from '@angular/common/locales/it';
import {BrowserModule} from '@angular/platform-browser';
import {RouteReuseStrategy} from '@angular/router';
import {EffectsModule} from '@ngrx/effects';
import {StoreModule} from '@ngrx/store';
import {StoreDevtoolsModule} from '@ngrx/store-devtools';
import {environment} from 'src/environments/environment';
import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {MetaComponent} from './meta.component';
import {WmCoreModule} from './shared/wm-core/wm-core.module';
import {UIReducer} from './store/UI/UI.reducer';
registerLocaleData(localeIt);

@NgModule({
  declarations: [AppComponent, MetaComponent],
  entryComponents: [],
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    HttpClientModule,
    AppRoutingModule,
    WmCoreModule,
    StoreModule.forRoot(
      {
        UI: UIReducer,
      },
      {},
    ),
    EffectsModule.forRoot(),
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
