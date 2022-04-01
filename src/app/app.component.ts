import {DOCUMENT} from '@angular/common';
import {Component, Inject, ViewEncapsulation} from '@angular/core';
import {Store} from '@ngrx/store';
import {Observable} from 'rxjs';
import {take} from 'rxjs/operators';
import {LanguagesService} from './services/languages.service';
import {loadConf} from './store/conf/conf.actions';
import {IConfRootState} from './store/conf/conf.reducer';
import {confTHEMEVariables} from './store/conf/conf.selector';
import {allElastic} from './store/elastic/elastic.actions';
import {IElasticAllRootState} from './store/elastic/elastic.reducer';
@Component({
  selector: 'webmapp-app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class AppComponent {
  confTHEMEVariables$: Observable<any> = this._storeConf.select(confTHEMEVariables);

  constructor(
    @Inject(DOCUMENT) private _document: Document,
    private _languagesService: LanguagesService,
    private _storeConf: Store<IConfRootState>,
    private _storeElasticAll: Store<IElasticAllRootState>,
  ) {
    this._languagesService.initialize();
    this._storeConf.dispatch(loadConf());
    this._storeElasticAll.dispatch(allElastic());
    this.confTHEMEVariables$.pipe(take(2)).subscribe(css => this._setGlobalCSS(css));
  }

  private _setGlobalCSS(css: {[name: string]: string | number}) {
    const rootDocument = this._document.querySelector(':root');
    Object.keys(css).forEach(element => {
      (rootDocument as any).style.setProperty(element, `${css[element]}`);
    });
  }
}
