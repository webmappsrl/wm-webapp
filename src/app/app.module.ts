import {ScriptComponent} from './script.component';
import {
  HttpClientModule,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpResponse,
  HTTP_INTERCEPTORS,
} from '@angular/common/http';
import {Injectable, Injector, LOCALE_ID, NgModule} from '@angular/core';
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
import {UIReducer} from './store/UI/UI.reducer';
import {tap} from 'rxjs/operators';
import {createCustomElement} from '@angular/elements';
import {WmCoreModule} from 'wm-core/wm-core.module';
import {APP_ID, ENVIRONMENT_CONFIG} from 'wm-core/store/conf/conf.token';
import { ConfigService } from './services/config.service';

registerLocaleData(localeIt);
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
  declarations: [AppComponent, MetaComponent, ScriptComponent],
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
      maxAge: 25,
      logOnly: environment.production, // Restrict extension to log-only mode
    }),
  ],
  providers: [
    {provide: ENVIRONMENT_CONFIG, useValue: environment},
    {provide: RouteReuseStrategy, useClass: IonicRouteStrategy},
    {
      provide: APP_ID,
      useFactory: (configService: ConfigService) => configService.geohubAppId,
      deps: [ConfigService]
    },
    {provide: LOCALE_ID, useValue: 'it'},
    /*     {
          provide: HTTP_INTERCEPTORS,
          useClass: MyHttpInterceptor,
          multi: true,
        }, */
  ],
  bootstrap: [ScriptComponent, AppComponent, MetaComponent],
})
export class AppModule {
  constructor(injector: Injector) {
    // TODO: VA SCOMMENTATO SOLO SE SI FA UN WEB COMPONENT
    //  const webAppElement = createCustomElement(AppComponent, {injector});
    //  customElements.define('webmapp-app-root', webAppElement);
  }
}
