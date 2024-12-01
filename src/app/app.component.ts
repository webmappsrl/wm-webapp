import {activableUgc} from '@wm-core/store/features/ugc/ugc.selector';
import {DOCUMENT} from '@angular/common';
import {Component, Inject, OnInit, ViewEncapsulation} from '@angular/core';
import {Store} from '@ngrx/store';
import {interval, Observable} from 'rxjs';
import {filter, skip, switchMap, take, takeUntil} from 'rxjs/operators';
import {queryEc} from '@wm-core/store/features/ec/ec.actions';
import {loadConf} from '@wm-core/store/conf/conf.actions';
import {confAPP, confTHEMEVariables, confWEBAPP} from '@wm-core/store/conf/conf.selector';
import appPackage from 'package.json';
import wmCorePackage from './shared/wm-core/package.json';
import mapCorePackage from './shared/map-core/package.json';
import {IAPP, IWEBAPP} from '@wm-core/types/config';
import {loadAuths} from '@wm-core/store/auth/auth.actions';
import {syncUgc} from '@wm-core/store/features/ugc/ugc.actions';
@Component({
  selector: 'webmapp-app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class AppComponent implements OnInit {
  activableUgc$: Observable<boolean> = this._store.select(activableUgc);
  confAPP$: Observable<any> = this._store.select(confAPP);
  confTHEMEVariables$: Observable<any> = this._store.select(confTHEMEVariables);
  confWEBAPP$: Observable<any> = this._store.select(confWEBAPP);

  constructor(@Inject(DOCUMENT) private _document: Document, private _store: Store<any>) {
    this._store.dispatch(loadConf());
    this._store.dispatch(loadAuths());
    this._store.dispatch(queryEc({init: true}));
    this.confTHEMEVariables$.pipe(take(2)).subscribe(css => this._setGlobalCSS(css));
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
    this.activableUgc$
      .pipe(
        filter(activable => activable),
        switchMap(() =>
          interval(2000).pipe(takeUntil(this.activableUgc$.pipe(filter(activable => !activable)))),
        ),
      )
      .subscribe(() => {
        this._store.dispatch(syncUgc()); // Dispatch dell'azione
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
