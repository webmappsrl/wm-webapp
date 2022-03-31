import {Injectable} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {of} from 'rxjs';
import {catchError, map, switchMap} from 'rxjs/operators';
import {loadElastic, loadElasticFail, loadElasticSuccess} from './elastic.actions';
import {ElasticService} from './elastic.service';

@Injectable({
  providedIn: 'root',
})
export class ElasticEffects {
  loadElastic$ = createEffect(() =>
    this._actions$.pipe(
      ofType(loadElastic),
      switchMap(action =>
        this._elasticSVC.getSearch((action as any).search).pipe(
          map(elastic => loadElasticSuccess({elastic})),
          catchError(e => {
            console.log(e);
            return of(loadElasticFail());
          }),
        ),
      ),
    ),
  );

  constructor(private _elasticSVC: ElasticService, private _actions$: Actions) {}
}
