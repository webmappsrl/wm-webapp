import {applyWhere, applyFilter} from 'src/app/shared/wm-core/api/pois/pois.actions';
import {ActivatedRoute, Router} from '@angular/router';
import {BehaviorSubject, Observable, merge, of, zip, combineLatest} from 'rxjs';
import {
  AfterContentInit,
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Output,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import {confAPP, confHOME, confPOISFilter} from 'src/app/shared/wm-core/api/conf/conf.selector';
import {filter, map, switchMap, tap, debounceTime, withLatestFrom} from 'rxjs/operators';
import {setCurrentPoi} from 'src/app/store/UI/UI.actions';

import {IUIRootState} from 'src/app/store/UI/UI.reducer';
import {InnerHtmlComponent} from '../project/project.page.component';
import {ModalController, NavController} from '@ionic/angular';
import {Store} from '@ngrx/store';
import {
  featureCollection,
  featureCollectionCount,
  showPoisResult,
} from 'src/app/shared/wm-core/api/pois/pois.selector';
import {
  addActivities,
  inputTyped,
  query,
  removeActivities,
  setLayer,
} from 'src/app/shared/wm-core/api/api.actions';
import {
  apiElasticState,
  apiElasticStateLayer,
  queryApi,
  apiElasticStateLoading,
} from 'src/app/shared/wm-core/api/api.selector';
import {IElasticSearchRootState} from 'src/app/shared/wm-core/api/api.reducer';
import {FiltersComponent} from '../../shared/wm-core/filters/filters.component';
import {SearchComponent} from './search/search.component';
import {DomSanitizer} from '@angular/platform-browser';

@Component({
  selector: 'webmapp-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class HomeComponent implements AfterContentInit {
  private _hasPois: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  @Output() selectedFiltersEVT: EventEmitter<string[]> = new EventEmitter<string[]>();
  @ViewChild('filterCmp') filterCmp: FiltersComponent;
  @ViewChild('searchCmp') searchCmp: SearchComponent;

  cards$: Observable<IHIT[]> = of([]);
  confAPP$: Observable<IAPP> = this._store.select(confAPP);
  confHOME$: Observable<IHOME[]> = this._store.select(confHOME);

  currentLayer$ = this._store.select(apiElasticStateLayer);
  currentSearch$: BehaviorSubject<string> = new BehaviorSubject<string>('');
  elasticSeachLoading$: Observable<boolean> = this._store.select(apiElasticStateLoading);
  elasticSearch$: Observable<IHIT[]> = this._store.select(queryApi);
  filterSelected$: BehaviorSubject<string[]> = new BehaviorSubject<string[]>([]);
  filterShowed$ = this._store.select(apiElasticState).pipe(
    tap(state => {
      if (state.layer == null && state.activities.length === 0 && state.inputTypes === '')
        this.showResultTracks$.next(false);
    }),
    map(state => state.activities),
  );
  isTyping$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  poiCards$: Observable<any[]>;
  showResultTracks$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  showResultPois$: Observable<boolean> = this._store.select(showPoisResult);
  showResult$: Observable<boolean> = combineLatest([
    this.showResultTracks$,
    this.showResultPois$,
  ]).pipe(map(([a, b]) => a || b));
  showResultType$: BehaviorSubject<string> = new BehaviorSubject<string>('pois');
  featureCollectionCount$: Observable<number> = this._store.select(featureCollectionCount);
  featureCollection$: Observable<any> = this._store.select(featureCollection);

  constructor(
    private _store: Store,
    private _router: Router,
    private _route: ActivatedRoute,
    private _modalCtrl: ModalController,
    private _navCtrl: NavController,
    public sanitizer: DomSanitizer,
  ) {
    const allPois: Observable<any[]> = this._store.select(featureCollection).pipe(
      filter(p => p != null),
      map(p => ((p as any).features || []).map(p => (p as any).properties || [])),
    );
    this.poiCards$ = merge(this.currentSearch$, this.filterSelected$).pipe(
      switchMap(_ => allPois),
      tap(f => this._hasPois.next(f != null && f.length > 0)),
    );
  }

  changeResultType(event): void {
    this.showResultType$.next(event.target.value);
  }

  goToHome(): void {
    this.setLayer(null);
    this.showResultTracks$.next(false);
    this.setCurrentFilters([]);
    this.searchCmp.reset();
    this._router.navigate([], {
      relativeTo: this._route,
      queryParams: {layer: null, filter: null},
      queryParamsHandling: 'merge',
    });
  }

  ngAfterContentInit(): void {
    this.confHOME$
      .pipe(
        filter(h => h != null),
        withLatestFrom(this._route.queryParams),
        debounceTime(1800),
      )
      .subscribe(([home, params]) => {
        if (params.layer != null && home[params.layer] != null) {
          const layerBox: ILAYERBOX = home[+params.layer] as ILAYERBOX;
          this.setLayer(layerBox.layer);
        } else if (params.filter != null && home[params.filter] != null) {
          const filterBox: IPOITYPEFILTERBOX = home[+params.filter] as IPOITYPEFILTERBOX;
          this.toggleFilter(filterBox);
        }
        if (params.slug != null && home[params.slug] != null) {
          const slugBox: ISLUGBOX = home[+params.slug] as ISLUGBOX;
          this.openSlug(slugBox.slug);
        }
      });
  }

  openExternalUrl(url: string): void {
    window.open(url);
  }

  openSlug(slug: string, idx?: number): void {
    if (slug === 'project') {
      this._modalCtrl
        .create({
          component: InnerHtmlComponent,
          cssClass: 'wm-modal',
          backdropDismiss: true,
          keyboardClose: true,
        })
        .then(modal => {
          modal.present();
          if (idx) {
            this._router.navigate([], {
              relativeTo: this._route,
              queryParams: {slug: idx},
              queryParamsHandling: 'merge',
            });
          }
        });
    } else {
      this._navCtrl.navigateForward(slug);
    }
  }

  removeFilter(identifier: string): void {
    this._store.dispatch(removeActivities({activities: [identifier]}));
    this.filterSelected$.next(this.filterSelected$.value.filter(f => f != identifier));
    this.selectedFiltersEVT.emit(this.filterSelected$.value);
  }

  removeLayer(layer: any): void {
    this.setLayer(null);
    this.removeLayerFilter(layer);
    this.showResultTracks$.next(false);
  }

  removeLayerFilter(layer: any): void {
    const taxonomyWhereIdentifier = layer.taxonomy_wheres
      .filter(t => t.identifier != null)
      .map(t => `where_${t.identifier}`);
    const currentFilter = this.filterSelected$.value;
    const expectedFilter = currentFilter.filter(f => taxonomyWhereIdentifier.indexOf(f) < 0);
    this.setCurrentFilters(expectedFilter);
  }

  searchCard(id: string | number): void {
    this._router.navigate([], {
      relativeTo: this._route,
      queryParams: {track: id ? id : null},
      queryParamsHandling: 'merge',
    });
  }

  setActivities(activities: string[]): void {
    this._store.dispatch(addActivities({activities}));
    this.showResultTracks$.next(true);
    activities = [...this.filterSelected$.value, ...activities];
    this.setCurrentFilters(activities);
  }

  setCurrentFilters(filters: string[]): void {
    this.filterSelected$.next(filters);
    this.selectedFiltersEVT.emit(filters);
  }

  setLayer(layer: ILAYER | null | any, idx?: number): void {
    if (layer != null && layer.id != null) {
      this._store.dispatch(setLayer({layer}));
      this.showResultTracks$.next(true);
    } else {
      this.showResultTracks$.next(false);
      this._store.dispatch(setLayer(null));
      this._store.dispatch(applyWhere({where: null}));
      this._store.dispatch(applyFilter({filters: null}));
    }
    if (idx) {
      this._router.navigate([], {
        relativeTo: this._route,
        queryParams: {layer: idx},
        queryParamsHandling: 'merge',
      });
    }
    if (layer && layer.taxonomy_wheres != null) {
      const taxonomyWhereIdentifier = layer.taxonomy_wheres
        .filter(t => t.identifier != null)
        .map(t => `where_${t.identifier}`);
      this.setCurrentFilters(taxonomyWhereIdentifier);
      this._store.dispatch(applyWhere({where: taxonomyWhereIdentifier}));
    }
  }

  setPoi(currentPoi: any): void {
    this._store.dispatch(setCurrentPoi({currentPoi: currentPoi}));
  }

  setSearch(value: string): void {
    this.currentSearch$.next(value);
    this._store.dispatch(inputTyped({inputTyped: value}));
    this.showResultTracks$.next(value != '' ? true : false);
  }

  toggleFilter(filter: IPOITYPEFILTERBOX, idx?: number): void {
    this.filterCmp && this.filterCmp.addPoisFilter(filter);
    this.setCurrentFilters([filter.identifier]);
    this._store.dispatch(query({activities: [filter.identifier]}));
    if (idx) {
      this._router.navigate([], {
        relativeTo: this._route,
        queryParams: {filter: idx},
        queryParamsHandling: 'merge',
      });
    }
  }
}
