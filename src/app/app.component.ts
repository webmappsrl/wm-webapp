import {DOCUMENT} from '@angular/common';
import {Component, Inject, ViewEncapsulation} from '@angular/core';
import {Store} from '@ngrx/store';
import {Observable} from 'rxjs';
import {take} from 'rxjs/operators';
import {query} from 'wm-core/store/api/api.actions';
import {loadConf} from 'wm-core/store/conf/conf.actions';
import {confTHEMEVariables} from 'wm-core/store/conf/conf.selector';
@Component({
  selector: 'webmapp-app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class AppComponent {
  confTHEMEVariables$: Observable<any> = this._storeConf.select(confTHEMEVariables);

  constructor(@Inject(DOCUMENT) private _document: Document, private _storeConf: Store<any>) {
    this._storeConf.dispatch(loadConf());
    this._storeConf.dispatch(query({init: true}));
    this.confTHEMEVariables$.pipe(take(2)).subscribe(css => this._setGlobalCSS(css));
  }

  private _setGlobalCSS(css: {[name: string]: string | number}) {
    const rootDocument = this._document.querySelector(':root');
    Object.keys(css).forEach(element => {
      (rootDocument as any).style.setProperty(element, `${css[element]}`);
    });
  }
}
