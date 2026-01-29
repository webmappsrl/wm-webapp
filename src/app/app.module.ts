import {ScriptComponent} from './script.component';
import {
  HttpClientModule,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpResponse,
} from '@angular/common/http';
import {Injectable, LOCALE_ID, NgModule} from '@angular/core';
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
import {tap} from 'rxjs/operators';
import {WmCoreModule} from '@wm-core/wm-core.module';
import packageJson from 'package.json';
import posthogConfig from './config/posthog.json';
import {MetaComponent} from '@wm-core/meta/meta.component';
import { WmTranslations } from '@wm-types/language';
import { appIT } from 'src/assets/i18n/it';
import { appEN } from 'src/assets/i18n/en';
import { appDE } from 'src/assets/i18n/de';
import { appFR } from 'src/assets/i18n/fr';
import { appES } from 'src/assets/i18n/es';
import { appPR } from 'src/assets/i18n/pr';
import { appSQ } from 'src/assets/i18n/sq';
registerLocaleData(localeIt);
export const langs: WmTranslations = {
  'de': appDE,
  'en': appEN,
  'es': appES,
  'fr': appFR,
  'it': appIT,
  'pr': appPR,
  'sq': appSQ,
};
@Injectable()
export class MyHttpInterceptor implements HttpInterceptor {
  constructor() {}

  intercept(request: HttpRequest<any>, next: HttpHandler) {
    console.log('Chiamata HTTP in corso:', request.url);

    return next.handle(request).pipe(
      tap(event => {
        if (event instanceof HttpResponse) {
          console.log('Chiamata HTTP completata:', request.url);
        }
      }),
    );
  }
}
@NgModule({
  declarations: [AppComponent, ScriptComponent],
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    HttpClientModule,
    AppRoutingModule,
    WmCoreModule,
    StoreModule.forRoot(),
    EffectsModule.forRoot(),
    StoreDevtoolsModule.instrument({
      maxAge: 25,
      logOnly: environment.production, // Restrict extension to log-only mode
    }),
  ],
  providers: [
    {provide: LOCALE_ID, useValue: 'it'},
    {provide: RouteReuseStrategy, useClass: IonicRouteStrategy},
    ...WmCoreModule.forRoot({
      appVersion: packageJson.version,
      environment: environment,
      translations: langs,
      posthog: {
        apiKey: posthogConfig.POSTHOG_KEY,
        host: posthogConfig.POSTHOG_HOST,
        enabled: true,
      },
    }).providers!,
    /*     {
          provide: HTTP_INTERCEPTORS,
          useClass: MyHttpInterceptor,
          multi: true,
        }, */
  ],
  bootstrap: [AppComponent, ScriptComponent, MetaComponent],
})
export class AppModule {}
