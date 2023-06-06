import {
  AfterContentInit,
  ChangeDetectionStrategy,
  Component,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import {DomSanitizer} from '@angular/platform-browser';
import {ActivatedRoute, Router} from '@angular/router';
import {ModalController, NavController} from '@ionic/angular';
import {Store} from '@ngrx/store';
import {BehaviorSubject, Observable} from 'rxjs';
import {debounceTime, filter, map, withLatestFrom} from 'rxjs/operators';
import {
  inputTyped,
  resetActivities,
  resetPoiFilters,
  setLayer,
  togglePoiFilter,
  toggleTrackFilter,
} from 'src/app/shared/wm-core/store/api/api.actions';
import {
  apiElasticStateLayer,
  apiElasticStateLoading,
  apiTrackFilters,
  featureCollection,
  featureCollectionCount,
  poiFilters,
  queryApi,
  showResult,
} from 'src/app/shared/wm-core/store/api/api.selector';
import {confAPP, confHOME} from 'src/app/shared/wm-core/store/conf/conf.selector';
import {setCurrentPoi} from 'src/app/store/UI/UI.actions';
import {FiltersComponent} from '../../shared/wm-core/filters/filters.component';
import {InnerHtmlComponent} from '../project/project.page.component';
import {SearchComponent} from './search/search.component';

@Component({
  selector: 'webmapp-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class HomeComponent implements AfterContentInit {
  @ViewChild('filterCmp') filterCmp: FiltersComponent;
  @ViewChild('searchCmp') searchCmp: SearchComponent;

  confAPP$: Observable<IAPP> = this._store.select(confAPP);
  confHOME$: Observable<IHOME[]> = this._store.select(confHOME);
  currentLayer$ = this._store.select(apiElasticStateLayer);
  currentSearch$: BehaviorSubject<string> = new BehaviorSubject<string>('');
  elasticSeachLoading$: Observable<boolean> = this._store.select(apiElasticStateLoading);
  elasticSearchTracks$: Observable<IHIT[]> = this._store.select(queryApi);
  isTyping$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  poiCards$: Observable<any[]> = this._store.select(featureCollection).pipe(
    filter(p => p != null),
    map(p => ((p as any).features || []).map(p => (p as any).properties || [])),
  );
  poiFeatureCollectionCount$: Observable<number> = this._store.select(featureCollectionCount);
  poiFilters$: Observable<any> = this._store.select(poiFilters);
  selectedTrackFilters$: Observable<any> = this._store.select(apiTrackFilters);
  showResult$ = this._store.select(showResult);
  showResultType$: BehaviorSubject<string> = new BehaviorSubject<string>('pois');

  constructor(
    private _store: Store,
    private _router: Router,
    private _route: ActivatedRoute,
    private _modalCtrl: ModalController,
    private _navCtrl: NavController,
    public sanitizer: DomSanitizer,
  ) {}

  changeResultType(event): void {
    this.showResultType$.next(event.target.value);
  }

  goToHome(): void {
    this.setLayer(null);
    this._store.dispatch(resetPoiFilters());
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

  removeFilter(filterIdentifier: string): void {
    this._store.dispatch(toggleTrackFilter({filterIdentifier}));
  }

  removeLayer(_: any): void {
    this.setLayer(null);
    this._router.navigate([], {
      relativeTo: this._route,
      queryParams: {layer: null},
      queryParamsHandling: 'merge',
    });
  }

  removePoiFilter(filterIdentifier: string): void {
    this._store.dispatch(togglePoiFilter({filterIdentifier}));
  }

  searchCard(id: string | number): void {
    this._router.navigate([], {
      relativeTo: this._route,
      queryParams: {track: id ? id : null},
      queryParamsHandling: 'merge',
    });
  }

  setActivities(filterIdentifier: string): void {
    this._store.dispatch(toggleTrackFilter({filterIdentifier}));
  }

  setFilter(filterIdentifier: string): void {
    if (filterIdentifier == null) return;
    if (filterIdentifier.indexOf('poi_') >= 0) {
      this._store.dispatch(togglePoiFilter({filterIdentifier}));
    } else {
      this.setActivities(filterIdentifier);
    }
  }

  setLayer(layer: ILAYER | null | any, idx?: number): void {
    if (layer != null && layer.id != null) {
      this._store.dispatch(setLayer({layer}));
    } else {
      this._store.dispatch(setLayer(null));
      this._store.dispatch(resetActivities());
    }
    if (idx) {
      this._router.navigate([], {
        relativeTo: this._route,
        queryParams: {layer: idx},
        queryParamsHandling: 'merge',
      });
    }
  }

  setPoi(currentPoi: any): void {
    this._store.dispatch(setCurrentPoi({currentPoi: null}));
    setTimeout(() => {
      this._store.dispatch(setCurrentPoi({currentPoi: currentPoi}));
    }, 200);
  }

  setSearch(value: string): void {
    this.currentSearch$.next(value);
    this._store.dispatch(inputTyped({inputTyped: value}));
  }

  toggleFilter(filter: IPOITYPEFILTERBOX, idx?: number): void {
    this.setFilter(filter.identifier);
    if (idx) {
      this._router.navigate([], {
        relativeTo: this._route,
        queryParams: {filter: idx},
        queryParamsHandling: 'merge',
      });
    }
  }
}
