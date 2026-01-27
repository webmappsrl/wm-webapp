import {ScriptComponent} from './script.component';
import {
  HttpClientModule,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpResponse,
} from '@angular/common/http';
import {inject, Injectable, LOCALE_ID, NgModule, provideAppInitializer} from '@angular/core';
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
import {
  APP_TRANSLATION,
  APP_VERSION,
  POSTHOG_CLIENT,
  POSTHOG_CONFIG,
} from '@wm-core/store/conf/conf.token';
import packageJson from 'package.json';
import posthogConfig from './config/posthog.json';
import {EnvironmentService} from '@wm-core/services/environment.service';
import {MetaComponent} from '@wm-core/meta/meta.component';
import {Capacitor} from '@capacitor/core';
import {PosthogCapacitorClient} from '@wm-core/services/posthog-capacitor.client';
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
    {
      provide: APP_VERSION,
      useValue: packageJson.version,
    },
    {provide: RouteReuseStrategy, useClass: IonicRouteStrategy},
    {provide: APP_TRANSLATION, useValue: {}},
    {provide: LOCALE_ID, useValue: 'it'},
    {
      provide: POSTHOG_CONFIG,
      useValue: {
        apiKey: posthogConfig.POSTHOG_KEY,
        host: posthogConfig.POSTHOG_HOST,
        enabled: true,
      },
    },
    PosthogCapacitorClient,
    {provide: POSTHOG_CLIENT, useExisting: PosthogCapacitorClient},
    provideAppInitializer(async () => {
      const envSvc = inject(EnvironmentService);
      const posthogClient = inject(PosthogCapacitorClient);

      console.log('[APP_INITIALIZER] Starting initialization...');

      try {
        // Inizializza EnvironmentService
        envSvc.init(environment);
        // Aspetta che EnvironmentService sia pronto
        await envSvc.readyPromise;
        console.log('[APP_INITIALIZER] EnvironmentService initialized');

        // Prepara le proprietà super di PostHog con controlli e valori di default
        const appId = envSvc.appId;
        const shardName = envSvc.shardName;
        const appVersion = packageJson.version;
        const appBuild = packageJson.version;
        const appPlatform = Capacitor.getPlatform();

        // Log per identificare valori undefined
        if (appId === undefined || appId === null) {
          console.error('[PostHog] app_id is undefined/null!', {appId, envSvc});
        }
        if (shardName === undefined || shardName === null) {
          console.error('[PostHog] shard_name is undefined/null!', {shardName, envSvc});
        }
        if (appVersion === undefined || appVersion === null) {
          console.error('[PostHog] app_version is undefined/null!', {appVersion, packageJson});
        }
        if (appBuild === undefined || appBuild === null) {
          console.error('[PostHog] app_build is undefined/null!', {appBuild, packageJson});
        }
        if (appPlatform === undefined || appPlatform === null) {
          console.error('[PostHog] app_platform is undefined/null!', {appPlatform});
        }

        // Assicurati che tutti i valori siano definiti
        // Il plugin PostHog accetta 'any' come tipo, quindi manteniamo i tipi originali
        const posthogProps: Record<string, string | number> = {};

        // app_id deve essere un numero valido (non 0) - manteniamo come numero
        if (appId !== undefined && appId !== null && appId !== 0) {
          posthogProps['app_id'] = appId; // Mantieni come numero
        } else {
          console.warn('[PostHog] app_id is invalid, skipping:', appId);
        }

        // shard_name deve essere una stringa non vuota
        if (shardName && typeof shardName === 'string' && shardName.trim() !== '') {
          posthogProps['shard_name'] = shardName;
        } else {
          console.warn('[PostHog] shard_name is invalid, skipping:', shardName);
        }

        // app_version deve essere una stringa non vuota
        if (appVersion && typeof appVersion === 'string' && appVersion.trim() !== '') {
          posthogProps['app_version'] = appVersion;
        } else {
          console.warn('[PostHog] app_version is invalid, skipping:', appVersion);
        }

        // app_build deve essere una stringa non vuota
        if (appBuild && typeof appBuild === 'string' && appBuild.trim() !== '') {
          posthogProps['app_build'] = appBuild;
        } else {
          console.warn('[PostHog] app_build is invalid, skipping:', appBuild);
        }

        // app_platform deve essere una stringa non vuota e valida
        if (
          appPlatform &&
          typeof appPlatform === 'string' &&
          appPlatform.trim() !== '' &&
          appPlatform !== 'unknown'
        ) {
          posthogProps['app_platform'] = appPlatform;
        } else {
          console.warn('[PostHog] app_platform is invalid, skipping:', appPlatform);
        }

        console.log('[PostHog] Registering properties with values:', posthogProps);
        console.log('[PostHog] Number of valid properties:', Object.keys(posthogProps).length);

        // Inizializza e registra le proprietà super di PostHog in un'unica chiamata
        if (Object.keys(posthogProps).length > 0) {
          await posthogClient.initAndRegister(posthogProps);
        } else {
          console.warn('[PostHog] No valid properties to register, skipping initAndRegister call');
        }

        // Test: cattura un evento di test per verificare che PostHog funzioni
        console.log('[PostHog] Sending test event to verify API calls...');
        try {
          await posthogClient.capture('app_initialized', {
            test: true,
            timestamp: new Date().toISOString(),
          });
          console.log('[PostHog] Test event sent successfully');
        } catch (error) {
          console.error('[PostHog] Failed to send test event:', error);
        }

        console.log('[APP_INITIALIZER] Initialization completed successfully');
      } catch (error) {
        console.error('[APP_INITIALIZER] Initialization failed:', error);
        // Non rilanciare l'errore per permettere all'app di avviarsi comunque
      }
    }),
    /*     {
          provide: HTTP_INTERCEPTORS,
          useClass: MyHttpInterceptor,
          multi: true,
        }, */
  ],
  bootstrap: [AppComponent, ScriptComponent, MetaComponent],
})
export class AppModule {}
