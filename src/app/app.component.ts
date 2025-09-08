import {DOCUMENT} from '@angular/common';
import {Component, Inject, OnInit, ViewEncapsulation} from '@angular/core';
import {Store} from '@ngrx/store';
import {Observable} from 'rxjs';
import {filter, skip, switchMap, take, takeUntil} from 'rxjs/operators';
import {ecTracks} from '@wm-core/store/features/ec/ec.actions';
import {loadConf} from '@wm-core/store/conf/conf.actions';
import {
  confAPP,
  confPRIVACY,
  confTHEMEVariables,
  confWEBAPP,
} from '@wm-core/store/conf/conf.selector';
import appPackage from 'package.json';
import wmCorePackage from './shared/wm-core/package.json';
import mapCorePackage from './shared/map-core/package.json';
import {IAPP, IWEBAPP} from '@wm-core/types/config';
import {loadAuths} from '@wm-core/store/auth/auth.actions';
import {leftPadding, padding} from '@map-core/store/map-core.actions';
import {syncUgc} from '@wm-core/store/features/ugc/ugc.actions';
import {WmInnerHtmlComponent} from '@wm-core/inner-html/inner-html.component';
import {ModalController} from '@ionic/angular';
import {loadIcons} from '@wm-core/store/icons/icons.actions';
@Component({
  selector: 'webmapp-app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class AppComponent implements OnInit {
  confAPP$: Observable<any> = this._store.select(confAPP);
  confTHEMEVariables$: Observable<any> = this._store.select(confTHEMEVariables);
  confWEBAPP$: Observable<any> = this._store.select(confWEBAPP);
  private _confPRIVACY$: Observable<any> = this._store.select(confPRIVACY);
  constructor(
    @Inject(DOCUMENT) private _document: Document,
    private _store: Store<any>,
    private _modalCtrl: ModalController,
  ) {
    this._store.dispatch(loadConf());
    this._store.dispatch(loadAuths());
    this._store.dispatch(loadIcons());
    this._store.dispatch(ecTracks({init: true}));
    this._store.dispatch(padding({padding: [100, 100, 100, 100]}));
    this._store.dispatch(leftPadding({leftPadding: 400}));
    this._store.dispatch(syncUgc());
    this.confTHEMEVariables$.pipe(take(2)).subscribe(css => this._setGlobalCSS(css));
    const privacyAccepted = localStorage.getItem('privacy-accepted');
    if (!privacyAccepted) {
      this._confPRIVACY$
        .pipe(
          filter(f => f != null),
          take(1),
          switchMap(privacy => {
            const appendText = `<bold>Chiudendo questo popup dichiaro di accettare termini e condizioni</bold>`;
            const html = Object.keys(privacy.html).reduce((acc, key) => {
              acc[key] = privacy.html[key] + appendText;
              return acc;
            }, {} as Record<string, string>);
            return this._modalCtrl.create({
              component: WmInnerHtmlComponent,
              componentProps: {
                html,
              },
              swipeToClose: true,
              mode: 'ios',
            });
          }),
          switchMap(modal => {
            modal.present();
            return modal.onWillDismiss();
          }),
        )
        .subscribe(dis => {
          localStorage.setItem('privacy-accepted', 'true');
        });
    }

    console.table({
      'app': appPackage.version,
      'map-core': mapCorePackage.version,
      'wm-core': wmCorePackage.version,
    });
  }

  ngOnInit(): void {
    this.confWEBAPP$
      .pipe(
        skip(1),
        filter((c: IWEBAPP) => c.splash_screen_show),
        switchMap(() => this.confAPP$),
        take(1),
      )
      .subscribe((conf: IAPP) => {
        this.setSplashScreenImage(conf);
        this.hideSplashScreen();
      });
  }

  private _setGlobalCSS(css: {[name: string]: string | number}) {
    const rootDocument = this._document.querySelector(':root');
    Object.keys(css).forEach(element => {
      (rootDocument as any).style.setProperty(element, `${css[element]}`);
    });
  }

  private hideSplashScreen() {
    setTimeout(() => {
      const splashScreen = document.getElementById('splash-screen');
      if (splashScreen) {
        splashScreen.style.opacity = '0';
        splashScreen.style.transition = 'opacity 0.5s ease-out';
        setTimeout(() => {
          splashScreen.remove();
        }, 500);
      }
    }, 3000); // Attendi 3 secondi prima di nascondere la splash screen
  }

  private setSplashScreenImage(conf: IAPP) {
    const bodyElement = document.body;
    if (bodyElement && conf.geohubId) {
      const splashScreen = document.createElement('div') as HTMLImageElement;
      splashScreen.id = 'splash-screen';
      const img = document.createElement('img');
      img.id = 'splash-screen-img';
      img.alt = 'Logo';
      img.src = `https://geohub.webmapp.it/storage/api/app/${conf.geohubId}/resources/splash.png`;
      splashScreen.appendChild(img);
      bodyElement.appendChild(splashScreen);
    }
  }
}
