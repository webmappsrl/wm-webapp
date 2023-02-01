import {LangService} from './shared/wm-core/localization/lang.service';
import {webEN} from './../assets/i18n/en';
import {webIT} from './../assets/i18n/it';
import {DOCUMENT} from '@angular/common';
import {Component, Inject, ViewEncapsulation} from '@angular/core';
import {Store} from '@ngrx/store';
import {Observable} from 'rxjs';
import {take} from 'rxjs/operators';
import {loadConf} from './store/conf/conf.actions';
import {IConfRootState} from './store/conf/conf.reducer';
import {confTHEMEVariables} from './store/conf/conf.selector';
@Component({
  selector: 'webmapp-app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [LangService],
})
export class AppComponent {
  confTHEMEVariables$: Observable<any> = this._storeConf.select(confTHEMEVariables);

  constructor(
    @Inject(DOCUMENT) private _document: Document,
    private _storeConf: Store<IConfRootState>,
    private _langService: LangService,
  ) {
    this._storeConf.dispatch(loadConf());
    this.confTHEMEVariables$.pipe(take(2)).subscribe(css => this._setGlobalCSS(css));
    this._langService.setTranslation('it', webIT, true);
    this._langService.setTranslation('en', webEN, true);
  }

  private _setGlobalCSS(css: {[name: string]: string | number}) {
    const rootDocument = this._document.querySelector(':root');
    Object.keys(css).forEach(element => {
      (rootDocument as any).style.setProperty(element, `${css[element]}`);
    });
  }
}
