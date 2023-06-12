import {DOCUMENT} from '@angular/common';
import {Component, Inject, Renderer2} from '@angular/core';
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
  `,
})
export class MetaComponent {
  APP$: Observable<any> = this._store.select(confAPP);
  confGeohubId$: Observable<number> = this._store.select(confGeohubId);

  constructor(
    private _store: Store<any>,
    @Inject(DOCUMENT) private _document: Document,
    private _renderer2: Renderer2,
  ) {
    this.confGeohubId$
      .pipe(
        filter(p => p != null),
        take(1),
      )
      .subscribe(id => {
        if (id) {
          const styleLink: any = this._renderer2.createElement('link') as HTMLLinkElement;
          this._renderer2.setProperty(styleLink, 'rel', 'stylesheet');
          this._renderer2.setProperty(styleLink, 'href', `theme/${id}.css`);
          this._renderer2.setProperty(styleLink, 'id', 'client-theme');
          this._renderer2.appendChild(this._document.head, styleLink);
        }
      });
  }
}
