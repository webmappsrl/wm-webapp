import {ActivatedRoute, Router} from '@angular/router';
import {BehaviorSubject, Observable, merge, of, zip} from 'rxjs';
import {
  AfterContentInit,
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Output,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import {confHOME, confPOISFilter} from 'src/app/store/conf/conf.selector';
import {filter, map, switchMap, tap, debounceTime, withLatestFrom} from 'rxjs/operators';
import {setCurrentLayer, setCurrentPoi} from 'src/app/store/UI/UI.actions';

import {IConfRootState} from 'src/app/store/conf/conf.reducer';
import {IUIRootState} from 'src/app/store/UI/UI.reducer';
import {InnerHtmlComponent} from '../project/project.page.component';
import {ModalController, NavController} from '@ionic/angular';
import {Store} from '@ngrx/store';
import {pois} from 'src/app/store/pois/pois.selector';
import {fromHEXToColor} from 'src/app/shared/map-core/src/utils/styles';
import {UICurrentLAyer} from 'src/app/store/UI/UI.selector';
import {query} from 'src/app/shared/wm-core/api/api.actions';
import {queryApi} from 'src/app/shared/wm-core/api/api.selector';
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
  private _hasLayer: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private _hasPois: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private _hasTracks: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

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
  currentLayer$ = this._storeUi
    .select(UICurrentLAyer)
    .pipe(tap(f => this._hasLayer.next(f != null)));
  currentSearch$: BehaviorSubject<string> = new BehaviorSubject<string>('');
  currentSelectedFilter$: Observable<any>;
  currentSelectedIndentiFierFilter$: BehaviorSubject<string | null> = new BehaviorSubject<
    string | null
  >(null);
  currentTab$: BehaviorSubject<string> = new BehaviorSubject<string>('');
  elasticSearch$: Observable<IHIT[]> = this._storeSearch
    .select(queryApi)
    .pipe(tap(f => this._hasTracks.next(f != null && f.length > 0)));
  isTyping$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  poiCards$: Observable<any[]>;
  selectedFilters$: BehaviorSubject<string[]> = new BehaviorSubject<string[]>([]);
  showSearch = true;

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
    const selectedPois = zip(this.currentSearch$, allPois, this.selectedFilters$).pipe(
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
    this.poiCards$ = merge(this.currentSearch$, this.selectedFilters$).pipe(
      switchMap(_ => selectedPois),
      tap(f => this._hasPois.next(f != null && f.length > 0)),
    );

    this.currentSelectedFilter$ = this.currentSelectedIndentiFierFilter$.asObservable().pipe(
      withLatestFrom(this.confPOISFilter$),
      map(([identifier, filters]) => {
        const filterKeys = Object.keys(filters);
        for (let i = 0; i < filterKeys.length; i++) {
          const filterKey = filterKeys[i];
          for (let j = 0; j < filters[filterKey].length; j++) {
            const filter = filters[filterKey][j];
            if (filter.identifier === identifier) {
              return filter;
            }
          }
        }
        return null;
      }),
    );
  }

  checkTab(check: boolean): void {
    setTimeout(() => {
      if (this._hasTracks.value && this._hasLayer.value) {
        this.currentTab$.next('tracks');
      } else if (this._hasPois.value) {
        this.currentTab$.next('pois');
      } else {
        this.currentTab$.next('');
      }
    }, 400);
  }

  goToHome(): void {
    this.setLayer(null);
    this.setCurrentFilters([]);
    this.currentTab$.next('');
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

  searchCard(id: string | number): void {
    this._router.navigate([], {
      relativeTo: this._route,
      queryParams: {track: id ? id : null},
      queryParamsHandling: 'merge',
    });
  }

  segmentChanged(ev: any) {
    this.currentTab$.next(ev.detail.value);
  }

  setCurrentFilters(filters: string[]): void {
    this.selectedFilters$.next(filters);
    this.selectedFiltersEVT.emit(filters);
    if (filters.length === 1) {
      this.currentSelectedIndentiFierFilter$.next(filters[0]);
    } else {
      this.currentSelectedIndentiFierFilter$.next(null);
    }
    if (filters.length > 0) {
      this.currentTab$.next('pois');
    }
    if (filters.length === 0) {
      this.currentTab$.next('');
    }
  }

  setLayer(layer: ILAYER | null | any, idx?: number): void {
    console.log(layer);
    this._storeUi.dispatch(setCurrentLayer({currentLayer: layer}));
    if (layer != null && layer.id != null) {
      this._storeSearch.dispatch(query({layer: layer.id}));
    }
    this.currentTab$.next('tracks');
    if (idx) {
      this._router.navigate([], {
        relativeTo: this._route,
        queryParams: {layer: idx},
        queryParamsHandling: 'merge',
      });
    }
  }

  setPoi(currentPoi: any): void {
    this._storeUi.dispatch(setCurrentPoi({currentPoi: currentPoi}));
  }

  toggleFilter(identifier: string, idx?: number): void {
    this.filterCmp && this.filterCmp.setFilter(identifier);
    this.currentSelectedIndentiFierFilter$.next(identifier);
    this.setCurrentFilters([identifier]);
    if (idx) {
      this._router.navigate([], {
        relativeTo: this._route,
        queryParams: {filter: idx},
        queryParamsHandling: 'merge',
      });
    }
  }
}
