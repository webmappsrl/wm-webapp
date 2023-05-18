import {ActivatedRoute, Router} from '@angular/router';
import {BehaviorSubject, Observable, merge, of, zip} from 'rxjs';
import {
  AfterContentInit,
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Output,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import {confHOME, confPOISFilter} from 'src/app/store/conf/conf.selector';
import {
  filter,
  map,
  switchMap,
  tap,
  debounceTime,
  withLatestFrom,
  startWith,
  distinctUntilChanged,
} from 'rxjs/operators';
import {setCurrentPoi} from 'src/app/store/UI/UI.actions';

import {IConfRootState} from 'src/app/store/conf/conf.reducer';
import {IUIRootState} from 'src/app/store/UI/UI.reducer';
import {InnerHtmlComponent} from '../project/project.page.component';
import {ModalController, NavController} from '@ionic/angular';
import {Store} from '@ngrx/store';
import {pois} from 'src/app/store/pois/pois.selector';
import {fromHEXToColor} from 'src/app/shared/map-core/src/utils/styles';
import {
  addActivities,
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
import {FilterComponent} from './filter/filter.component';
import {SearchComponent} from './search/search.component';

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
  @ViewChild('filterCmp') filterCmp: FilterComponent;
  @ViewChild('searchCmp') searchCmp: SearchComponent;

  cards$: Observable<IHIT[]> = of([]);
  confHOME$: Observable<IHOME[]> = this._storeConf.select(confHOME);
  confPOISFilter$: Observable<any> = this._storeConf.select(confPOISFilter).pipe(
    filter(p => p != null),
    map(p => {
      if (p.poi_type != null) {
        let poi_type = p.poi_type.map(p => {
          if (p.icon != null && p.color != null) {
            const namedPoiColor = fromHEXToColor[p.color] || 'darkorange';
            return {...p, ...{icon: p.icon.replaceAll('darkorange', namedPoiColor)}};
          }
          return p;
        });
        let res = {};
        if (p.where) {
          res = {where: p.where};
        }
        if (poi_type) {
          res = {...res, ...{poi_type}};
        }
        return res;
      }
      return p;
    }),
  );
  currentLayer$ = this._storeSearch.select(apiElasticStateLayer);
  currentSearch$: BehaviorSubject<string> = new BehaviorSubject<string>('');

  filterSelected$: BehaviorSubject<string[]> = new BehaviorSubject<string[]>([]);
  filterShowed$ = this._storeSearch.select(apiElasticState).pipe(
    tap(state => {
      if (state.layer == null && state.activities.length === 0) this.showResult$.next(false);
    }),
    map(state => state.activities),
  );
  isTyping$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  poiCards$: Observable<any[]>;
  sardegnaActivities: any = {
    box_type: 'base',
    items: [
      {
        title: 'hiking',
        track_id: 'hiking',
        image_url: 'https://www.riglar.it/wp-content/uploads/2013/02/Escursionismo.jpg',
      },
      {
        title: 'horse',
        track_id: 'horse',
        image_url:
          'https://www.csttropea.it/wp-content/uploads/2015/05/big_9ceefcf8-cf0b-4c90-9213-b63b81b7abff-530x353.jpg',
      },
      {
        title: 'nordic-walking',
        track_id: 'nordic-walking',
        image_url:
          'https://qui-montagna.com/wp-content/uploads/2021/03/cose-e-come-si-pratica-il-nordic-walking.jpg',
      },
      {
        title: 'mtb',
        track_id: 'mtb',
        image_url:
          'https://www.agnata.com/wp-content/uploads/2016/04/0000_Mountain-Bike-Agnata-03.jpg',
      },
      {
        title: 'cycling',
        track_id: 'cycling',
        image_url: 'https://momentummag.com/wp-content/uploads/2022/05/womancycling.jpg',
      },
    ],
  };
  showResult$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  showResultType$: BehaviorSubject<string> = new BehaviorSubject<string>('tracks');
  showSearch = true;
  elasticSearch$: Observable<IHIT[]> = this._storeSearch.select(queryApi);
  elasticSeachLoading$: Observable<boolean> = this._storeSearch.select(apiElasticStateLoading);
  constructor(
    private _storeSearch: Store<IElasticSearchRootState>,
    private _storeConf: Store<IConfRootState>,
    private _storeUi: Store<IUIRootState>,
    private _router: Router,
    private _route: ActivatedRoute,
    private _modalCtrl: ModalController,
    private _navCtrl: NavController,
  ) {
    const allPois: Observable<any[]> = this._storeUi.select(pois).pipe(
      filter(p => p != null),
      map(p => ((p as any).features || []).map(p => (p as any).properties || [])),
    );
    const selectedPois = zip(this.currentSearch$, allPois, this.filterSelected$).pipe(
      map(([search, features, filters]) => {
        const isSearch = search.length > 0 || filters.length > 0;
        const whereFilters = filters.filter(f => f.indexOf('where_') >= 0);
        const poiTypeFilters = filters.filter(f => f.indexOf('poi_type_') >= 0);
        let whereCondition = true;
        let poiTypeCondition = true;
        return features.filter(f => {
          const nameCondition = JSON.stringify(f.name).toLowerCase().includes(search.toLowerCase());
          if (filters.length > 0) {
            whereCondition =
              whereFilters.length > 0
                ? f.taxonomyIdentifiers.filter(v => whereFilters.indexOf(v) >= 0).length > 0
                : true;
            poiTypeCondition =
              poiTypeFilters.length > 0
                ? f.taxonomyIdentifiers.filter(v => poiTypeFilters.indexOf(v) >= 0).length > 0
                : true;
          }
          return nameCondition && whereCondition && poiTypeCondition && isSearch;
        }) as any[];
      }),
    );
    this.poiCards$ = merge(this.currentSearch$, this.filterSelected$).pipe(
      switchMap(_ => selectedPois),
      tap(f => this._hasPois.next(f != null && f.length > 0)),
    );
  }

  changeResultType(event): void {
    this.showResultType$.next(event.target.value);
  }

  goToHome(): void {
    this.setLayer(null);
    this.showResult$.next(false);
    this.setCurrentFilters([]);
    this.searchCmp.reset();
    this._storeSearch.dispatch(setLayer(null));
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
          this.toggleFilter(filterBox.identifier);
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
    this._storeSearch.dispatch(removeActivities({activities: [identifier]}));
    this.filterSelected$.next(this.filterSelected$.value.filter(f => f != identifier));
    this.selectedFiltersEVT.emit(this.filterSelected$.value);
  }

  removeLayer(layer: any): void {
    this.setLayer(null);
    this.removeLayerFilter(layer);
    this.showResult$.next(false);
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

  setActivities(activities: string[]) {
    this._storeSearch.dispatch(addActivities({activities}));
    this.showResult$.next(true);
    activities = [...this.filterSelected$.value, ...activities];
    this.setCurrentFilters(activities);
  }

  setCurrentFilters(filters: string[]): void {
    this.filterSelected$.next(filters);
    this.selectedFiltersEVT.emit(filters);
  }

  setLayer(layer: ILAYER | null | any, idx?: number): void {
    if (layer != null && layer.id != null) {
      this._storeSearch.dispatch(setLayer({layer}));
      this.showResult$.next(true);
    } else {
      this.showResult$.next(false);
      this._storeSearch.dispatch(setLayer(null));
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
      this.filterCmp && this.filterCmp.setFilter(taxonomyWhereIdentifier[0]);
      this.setCurrentFilters(taxonomyWhereIdentifier);
    }
  }

  setPoi(currentPoi: any): void {
    this._storeUi.dispatch(setCurrentPoi({currentPoi: currentPoi}));
  }

  toggleFilter(identifier: string, idx?: number): void {
    this.filterCmp && this.filterCmp.setFilter(identifier);
    this.setCurrentFilters([identifier]);
    this._storeSearch.dispatch(query({activities: [identifier]}));
    if (idx) {
      this._router.navigate([], {
        relativeTo: this._route,
        queryParams: {filter: idx},
        queryParamsHandling: 'merge',
      });
    }
  }
}
