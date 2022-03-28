import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Output,
  ViewEncapsulation,
} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {Store} from '@ngrx/store';
import {Observable, of} from 'rxjs';
import {startWith, tap} from 'rxjs/operators';
import {IElasticRootState} from 'src/app/store/elastic/elastic.reducer';
import {elasticHits} from 'src/app/store/elastic/elastic.selector';

@Component({
  selector: 'webmapp-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class HomeComponent {
  @Output('searchId') searchIdEvent: EventEmitter<number> = new EventEmitter<number>();

  cards$: Observable<IHIT[]> = of([]);
  elasticHits$: Observable<IHIT[]> = this._store.select(elasticHits);

  public isBackAvailable: boolean = false;
  public showSearch: boolean = true;
  public title: string;
  public searchString: string;

  constructor(
    private _store: Store<IElasticRootState>,
    private _router: Router,
    private _route: ActivatedRoute,
  ) {
    this.elasticHits$.subscribe(sad => console.log(sad));
    this.cards$ = this.elasticHits$.pipe(
      tap(d => console.table(d)),
      startWith([]),
    );
  }

  searchCard(id: string | number) {
    this._router.navigate([], {
      relativeTo: this._route,
      queryParams: {track: id ? id : null},
      queryParamsHandling: 'merge',
    });
  }
}
