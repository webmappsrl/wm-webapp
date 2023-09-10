import {DOCUMENT} from '@angular/common';
import {Component, ElementRef, Inject, ViewEncapsulation} from '@angular/core';
import {Store} from '@ngrx/store';
import {Observable} from 'rxjs';
import {take} from 'rxjs/operators';
import {query} from './shared/wm-core/store/api/api.actions';
import {loadConf} from './shared/wm-core/store/conf/conf.actions';
import {confTHEMEVariables} from './shared/wm-core/store/conf/conf.selector';
import {ApiService} from './shared/wm-core/store/api/api.service';
import {ConfService} from './shared/wm-core/store/conf/conf.service';
@Component({
  selector: 'wm-webapp',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class AppComponent {
  confTHEMEVariables$: Observable<any> = this._storeConf.select(confTHEMEVariables);

  constructor(
    @Inject(DOCUMENT) private _document: Document,
    private _storeConf: Store<any>,
    private _el: ElementRef,
    private _apiScv: ApiService,
    private _confSvc: ConfService,
  ) {
    this._storeConf.dispatch(loadConf());
    this._storeConf.dispatch(query({init: true}));
    this.confTHEMEVariables$.pipe(take(2)).subscribe(css => this._setGlobalCSS(css));
    const geohubId = this._el.nativeElement.getAttribute('geohubId');
    if (geohubId) {
      this._confSvc.geohubId = geohubId;
      this._apiScv.geohubId = geohubId;
    }
  }

  private _setGlobalCSS(css: {[name: string]: string | number}) {
    const rootDocument = this._document.querySelector(':root');
    Object.keys(css).forEach(element => {
      (rootDocument as any).style.setProperty(element, `${css[element]}`);
    });
  }
}
