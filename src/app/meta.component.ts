import {DOCUMENT} from '@angular/common';
import {Component, Inject} from '@angular/core';
import {Store} from '@ngrx/store';
import {Observable} from 'rxjs';
import {filter, take} from 'rxjs/operators';
import {confAPP, confGeohubId} from './shared/wm-core/store/conf/conf.selector';

@Component({
  selector: 'webmapp-meta',
  template: `
    <meta charset="utf-8" />
    <title>{{(APP$|async).name}}</title>

    <base href="#" />

    <meta name="color-scheme" content="light" />
    <meta
      name="viewport"
      content="viewport-fit=cover, width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no"
    />
    <meta name="format-detection" content="telephone=no" />
    <meta name="msapplication-tap-highlight" content="no" />

    <link rel="icon" type="image/png" href="assets/icon/favicon.png" />

    <script src="https://openlayers.org/en/v6.9.0/examples/resources/mapbox-streets-v6-style.js"></script>

    <!-- add to homescreen for ios -->
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black" />
    <link id="client-theme" rel="stylesheet" type="text/css'" href="/theme/0.scss" />
  `,
})
export class MetaComponent {
  APP$: Observable<any> = this._store.select(confAPP);
  confGeohubId$: Observable<number> = this._store.select(confGeohubId);

  constructor(private _store: Store<any>, @Inject(DOCUMENT) private _document: Document) {
    this.confGeohubId$
      .pipe(
        filter(p => p != null),
        take(1),
      )
      .subscribe(id => {
        if (id) {
          const styleLink: any = this._document.getElementById('client-theme');
          styleLink.href = `/theme/${id}.scss`;
        }
      });
  }
}
