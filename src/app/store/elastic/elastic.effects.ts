import {Injectable} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {of} from 'rxjs';
import {catchError, map, switchMap} from 'rxjs/operators';
import {loadConf, loadConfFail, loadConfSuccess} from './elastic.actions';
import {ElasticService} from './elastic.service';

@Injectable({
  providedIn: 'root',
})
export class ConfEffects {
  loadConf$ = createEffect(() =>
    this._actions$.pipe(
      ofType(loadConf),
      switchMap(() =>
        this._elasticSVC.getConf().pipe(
          map(conf => loadConfSuccess({conf})),
          catchError(() => of(loadConfFail())),
        ),
      ),
    ),
  );

  constructor(private _elasticSVC: ElasticService, private _actions$: Actions) {}
}
