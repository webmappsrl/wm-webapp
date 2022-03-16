import {Component} from '@angular/core';
import {Store} from '@ngrx/store';
import {Observable} from 'rxjs';
import {LanguagesService} from './services/languages.service';
import {loadConf} from './store/conf.actions';
import {IConfRootState} from './store/conf.reducer';
import {confAPP, confTHEME} from './store/conf.selector';

@Component({
  selector: 'webmapp-app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  APP$: Observable<any> = this._store.select(confAPP);
  THEME$: Observable<any> = this._store.select(confTHEME);
  constructor(private _languagesService: LanguagesService, private _store: Store<IConfRootState>) {
    this._languagesService.initialize();
    this._store.dispatch(loadConf());

    this.APP$.subscribe(asd => {
      console.log(asd);
    });
    this.THEME$.subscribe(asd => {
      console.log(asd);
    });
  }
}
