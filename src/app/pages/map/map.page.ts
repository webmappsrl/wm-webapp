import {
  setLastFilterType,
  updateTrackFilter,
  togglePoiFilter,
  toggleTrackFilter,
  resetPoiFilters,
  setLayer,
  loadEcPois,
} from '@wm-core/store/features/ec/ec.actions';
import {
  apiElasticState,
  apiElasticStateLayer,
  poiFilterIdentifiers,
  ecPois,
  apiGoToHome,
  countSelectedFilters,
  poisInitFeatureCollection,
} from '@wm-core/store/features/ec/ec.selector';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {FeatureCollection, LineString, Point} from 'geojson';
import {select, Store} from '@ngrx/store';
import {BehaviorSubject, combineLatest, from, merge, Observable, of, Subscription} from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged,
  filter,
  map,
  share,
  skip,
  startWith,
  switchMap,
  tap,
  take,
  shareReplay,
} from 'rxjs/operators';
import {HomeComponent} from 'src/app/components/home/home.component';
import {GeohubService} from 'src/app/services/geohub.service';

import {
  confAUTHEnable,
  confGeohubId,
  confHOME,
  confJIDOUPDATETIME,
  confLANGUAGES,
  confMAP,
  confMAPLAYERS,
  confOPTIONS,
  confShowDrawTrack,
} from '@wm-core/store/conf/conf.selector';

import {UICurrentPoiId} from 'src/app/store/UI/UI.selector';
import {ITrackElevationChartHoverElements} from 'src/app/types/track-elevation-chart';
import {environment} from 'src/environments/environment';
import {WmLoadingService} from '@wm-core/services/loading.service';
import {
  Filter,
  IHOME,
  ILAYER,
  IOPTIONS,
  SelectFilterOption,
  SliderFilter,
} from '@wm-core/types/config';
import {LangService} from '@wm-core/localization/lang.service';
import {FiltersComponent} from '@wm-core/filters/filters.component';
import {ModalController} from '@ionic/angular';
import {isLogged} from '@wm-core/store/auth/auth.selectors';
import {getUgcTrack} from '@wm-core/utils/localForage';
import {WmFeature} from 'src/app/shared/wm-types/src';
import {concatMap} from 'rxjs/operators';
import {ProfileAuthComponent} from '@wm-core/profile/profile-auth/profile-auth.component';
import {IDATALAYER} from '@map-core/types/layer';
import {WmMapTrackRelatedPoisDirective} from '@map-core/directives';
import {hitMapFeatureCollection} from '@map-core/store/map-core.selector';
import {ugcPoisFeatures, ugcTracksFeatures} from '@wm-core/store/features/ugc/ugc.selector';
import {inputTyped, ugcOpened} from '@wm-core/store/user-activity/user-activity.selector';
import {openUgc, resetTrackFilters} from '@wm-core/store/user-activity/user-activity.action';
const menuOpenLeft = 400;
const menuCloseLeft = 0;
const initPadding = [100, 100, 100, menuOpenLeft];
const initMenuOpened = true;
const maxWidth = 600;
@Component({
  selector: 'webmapp-map-page',
  templateUrl: './map.page.html',
  styleUrls: ['./map.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  providers: [LangService],
})
export class MapPage implements OnDestroy {
  private _confMAPLAYERS$: Observable<ILAYER[]> = this._store.select(confMAPLAYERS);

  readonly ecTrack$: Observable<WmFeature<LineString> | null>;
  readonly ecTrackID$: BehaviorSubject<number | string> = new BehaviorSubject<number | string>(
    null,
  );
  readonly track$: Observable<WmFeature<LineString> | null>;
  readonly trackColor$: BehaviorSubject<string> = new BehaviorSubject<string>('#caaf15');
  readonly ugcOpened$: Observable<boolean> = this._store.select(ugcOpened);
  readonly ugcTrack$: Observable<WmFeature<LineString> | null>;
  readonly ugcTrackID$: BehaviorSubject<number | string> = new BehaviorSubject<number | string>(
    null,
  );

  @ViewChild(WmMapTrackRelatedPoisDirective)
  WmMapTrackRelatedPoisDirective: WmMapTrackRelatedPoisDirective;
  @ViewChild('filterCmp') filterCmp: FiltersComponent;
  @ViewChild(HomeComponent) homeCmp: HomeComponent;

  apiElasticState$: Observable<any> = this._store.select(apiElasticState);
  apiGoToHome$: Observable<boolean> = this._store.select(apiGoToHome);
  apiSearchInputTyped$: Observable<string> = this._store.select(inputTyped);
  authEnable$: Observable<boolean> = this._store.select(confAUTHEnable);
  caretOutLine$: Observable<'caret-back-outline' | 'caret-forward-outline'>;
  confHOME$: Observable<IHOME[]> = this._store.select(confHOME);
  confJIDOUPDATETIME$: Observable<any> = this._store.select(confJIDOUPDATETIME);
  confMap$: Observable<any> = this._store.select(confMAP).pipe(
    tap(c => {
      if (c != null && c.pois != null && c.pois.apppoisApiLayer == true) {
        this._store.dispatch(loadEcPois());
      }
    }),
  );
  confOPTIONS$: Observable<IOPTIONS> = this._store.select(confOPTIONS);
  currentCustomTrack$: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  currentLayer$ = this._store.select(apiElasticStateLayer);
  currentPoi$: BehaviorSubject<WmFeature<Point>> = new BehaviorSubject<WmFeature<Point> | null>(
    null,
  );
  currentPoiID$: BehaviorSubject<number> = new BehaviorSubject<number>(-1);
  currentPoiIDFromHome$ = this._store.select(UICurrentPoiId);
  currentPoiIDToMap$: Observable<number | null>;
  currentPoiNextID$: BehaviorSubject<number> = new BehaviorSubject<number>(-1);
  currentPoiPrevID$: BehaviorSubject<number> = new BehaviorSubject<number>(-1);
  currentRelatedPoi$: BehaviorSubject<WmFeature<Point>> =
    new BehaviorSubject<WmFeature<Point> | null>(null);
  currentUgcPoi$: BehaviorSubject<WmFeature<Point>> = new BehaviorSubject<WmFeature<Point> | null>(
    null,
  );
  currentUgcPoiIDToMap$: Observable<number | null>;
  dataLayerUrls$: Observable<IDATALAYER>;
  disableLayers$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  drawTrackEnable$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  enableDrawTrack$ = this._store.select(confShowDrawTrack);
  geohubId$ = this._store.select(confGeohubId);
  goToHomeSub$: Subscription = Subscription.EMPTY;
  graphhopperHost$: Observable<string> = of(environment.graphhopperHost);
  isLogged$: Observable<boolean> = this._store.pipe(select(isLogged));
  langs$ = this._store.select(confLANGUAGES).pipe(
    tap(l => {
      if (l && l.default) {
        this._langService.initLang(l.default);
      }
    }),
  );
  leftPadding$: Observable<number>;
  mapPadding$: BehaviorSubject<number[]> = new BehaviorSubject<number[]>(initPadding);
  mapPrintDetails$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  mapPrintPadding$: BehaviorSubject<number[]> = new BehaviorSubject<number[]>([0, 0, 0, 0]);
  mergedPoi$: Observable<any> = combineLatest([
    merge(
      this.currentPoi$.pipe(
        distinctUntilChanged(),
        map(p => {
          if (p == null) return null;
          if (this.WmMapTrackRelatedPoisDirective) {
            this.WmMapTrackRelatedPoisDirective.setPoi = -1;
          }
          return p;
        }),
      ),
      this.currentRelatedPoi$.pipe(
        distinctUntilChanged(),
        map(p => {
          if (p == null) return null;
          return p;
        }),
      ),
      this.currentUgcPoi$.pipe(
        distinctUntilChanged(),
        map(p => {
          if (p == null) return null;
          return p;
        }),
      ),
    ),
  ]).pipe(
    map(([poi]) => {
      if (poi == null) return null;

      if (poi.properties.id !== undefined) {
        this._router.navigate([], {
          relativeTo: this._route,
          queryParams: {poi: poi.properties.id},
          queryParamsHandling: 'merge',
        });
      }

      return poi;
    }),
  );
  overlayFeatureCollections$ = this._store.select(hitMapFeatureCollection);
  poiFilterIdentifiers$: Observable<string[]> = this._store.select(poiFilterIdentifiers);
  poiIDs$: BehaviorSubject<number[]> = new BehaviorSubject<number[]>([]);
  pois$: Observable<FeatureCollection> = this._store.select(ecPois);
  refreshLayer$: Observable<any>;
  reloadCustomTracks$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(null);
  resetSelectedPoi$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  resetSelectedUgcPoi$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  resizeEVT: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  setCurrentPoiSub$: Subscription = Subscription.EMPTY;
  showMenu$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(initMenuOpened);
  toggleLayerDirective$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
  togglePoisDirective$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
  trackElevationChartHoverElements$: BehaviorSubject<ITrackElevationChartHoverElements | null> =
    new BehaviorSubject<ITrackElevationChartHoverElements | null>(null);
  translationCallback: (any) => string = value => {
    if (value == null) return '';
    return this._langService.instant(value);
  };
  ugcPois$: Observable<WmFeature<Point>[]> = this._store.select(ugcPoisFeatures);
  ugcTracks$: Observable<WmFeature<LineString>[]> = this._store.select(ugcTracksFeatures);
  wmHomeEnable$ = combineLatest([
    this.drawTrackEnable$,
    this.currentCustomTrack$,
    this.authEnable$,
  ]).pipe(
    map(([drawTrackEnabled, hasCustomTrack, isAuth]) => {
      // return (!isAuth && !drawTrackEnabled) || (isAuth && !(drawTrackEnabled && hasCustomTrack))
      if (!isAuth) {
        return !drawTrackEnabled;
      }
      return !(drawTrackEnabled && hasCustomTrack);
    }),
  );
  wmMapFeatureCollectionOverlay$: BehaviorSubject<any | null> = new BehaviorSubject<any | null>(
    null,
  );
  wmMapHitMapUrl$: Observable<string | null> = this.confMap$.pipe(map(conf => conf?.hitMapUrl));
  wmMapLayerDisableLayers$: Observable<boolean>;
  wmMapUgcPoisDisableLayers$: Observable<boolean>;
  wmMapUgcTracksDisableLayers$: Observable<boolean>;

  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _geohubService: GeohubService,
    private _cdr: ChangeDetectorRef,
    private _store: Store,
    private _langService: LangService,
    private _loadingSvc: WmLoadingService,
    private _modalCtrl: ModalController,
  ) {
    this.refreshLayer$ = this._store.select(countSelectedFilters);
    if (window.innerWidth < maxWidth) {
      this.mapPadding$.next([initPadding[0], initPadding[1], initPadding[2], menuCloseLeft]);
      this.resizeEVT.next(!this.resizeEVT.value);
    }
    this.dataLayerUrls$ = this.geohubId$.pipe(
      filter(g => g != null),
      map(geohubId => {
        return {
          low: `https://wmpbf.s3.eu-central-1.amazonaws.com/${geohubId}/{z}/{x}/{y}.pbf`,
          high: `https://wmpbf.s3.eu-central-1.amazonaws.com/${geohubId}/{z}/{x}/{y}.pbf`,
        } as IDATALAYER;
      }),
    );
    this.setCurrentPoiSub$ = this._store
      .select(poisInitFeatureCollection)
      .pipe(
        filter(p => p != null),
        tap(() => this._loadingSvc.close('Loading pois...')),
        switchMap(_ => this._route.queryParams),
        filter(params => params != null),
        debounceTime(500),
      )
      .subscribe(params => {
        this.setCurrentPoi(params.poi);
      });
    const queryParams$ = this._route.queryParams.pipe(shareReplay(1));
    queryParams$.subscribe(params => {
      this.ugcTrackID$.next(params.ugc_track || null);
      this.ecTrackID$.next(params.track || null);
    });

    this.ecTrack$ = this.ecTrackID$.pipe(
      distinctUntilChanged((prev, curr) => {
        return prev === curr;
      }),
      switchMap(trackid => {
        return trackid != null ? from(this._geohubService.getEcTrack(+trackid)) : of(null);
      }),
      tap(track => {
        if (track != null) {
          const poiIDs = (track.properties?.related_pois || []).map(poi => poi.properties.id);
          this.poiIDs$.next(poiIDs);
        } else {
          this.poiIDs$.next([]);
        }
      }),
    );
    this.ugcTrack$ = this.ugcTrackID$.pipe(
      switchMap(ugcTrackID$ => from(getUgcTrack(`${ugcTrackID$}`))),
    );
    this.track$ = combineLatest([this.ecTrack$, this.ugcTrack$]).pipe(
      map(([ecTrack, ugcTrack]) => ugcTrack ?? ecTrack),
      distinctUntilChanged(),
      share(),
    );
    this.caretOutLine$ = this.showMenu$.pipe(
      map(showMenu => (showMenu ? 'caret-back-outline' : 'caret-forward-outline')),
    );
    this.leftPadding$ = this.showMenu$.pipe(map(showMenu => (showMenu ? menuOpenLeft : 0)));

    this.currentPoiIDToMap$ = combineLatest([
      merge(this.currentPoiID$, this.currentPoiIDFromHome$),
    ]).pipe(
      map(([val]) => val ?? -1),
      distinctUntilChanged((prev, curr) => +prev === +curr),
    );
    this.currentUgcPoiIDToMap$ = combineLatest([
      merge(this.currentPoiID$, this.currentPoiIDFromHome$),
    ]).pipe(
      map(([val]) => {
        const poiID = val ?? -1;
        return poiID;
      }),
      distinctUntilChanged((prev, curr) => `${prev}` === `${curr}`),
    );
    this.goToHomeSub$ = this.apiGoToHome$.pipe(skip(1)).subscribe(_ => {
      this.unselectPOI();
    });
    this.wmMapLayerDisableLayers$ = combineLatest([
      this.drawTrackEnable$,
      this.toggleLayerDirective$,
      this.currentLayer$,
    ]).pipe(
      map(([drawTrackEnable, toggleLayerDirective, currentLayer]) => {
        return drawTrackEnable || (!toggleLayerDirective && currentLayer == null);
      }),
    );
    this.wmMapUgcPoisDisableLayers$ = combineLatest([this.drawTrackEnable$, this.isLogged$]).pipe(
      map(([drawTrackEnable, isLogged]) => {
        return drawTrackEnable || !isLogged;
      }),
    );
  }

  ngOnDestroy(): void {
    this.goToHomeSub$.unsubscribe();
    this.setCurrentPoiSub$.unsubscribe();
  }

  next(): void {
    this.WmMapTrackRelatedPoisDirective.poiNext();
  }

  openPopup(popup: {name: string; html: string}): void {
    this.homeCmp.popup$.next(popup);
  }

  prev(): void {
    this.WmMapTrackRelatedPoisDirective.poiPrev();
  }

  printPage(): void {
    window.print();
    let element = document.getElementById('print-page');
    element = null;
    if (element) {
      let printer = window.open('', 'PRINT', 'height=600,width=1800');
      printer.document.write('<html><head>');
      printer.document.write('<title>' + document.title + '</title>');
      printer.document.write('</head><body>');
      printer.document.write(``);
      printer.document.write('<div>' + element.innerHTML + '</div>');
      printer.document.write('</body></html>');
      printer.document.close();
      printer.focus();
      printer.print();
    }
  }

  reloadCustomTrack(): void {
    this.currentCustomTrack$.next(null);
    this.reloadCustomTracks$.next(!this.reloadCustomTracks$.value ?? false);
  }

  removeActivityFilter(activity: string): void {
    //  this.homeCmp.removeFilter(activity);
  }

  removeTrackFilter(filter: Filter): void {
    this._store.dispatch(toggleTrackFilter({filter}));
  }

  resetFilters(): void {
    this.homeCmp.goToHome();
  }

  saveCurrentCustomTrack(track: any): void {
    const clonedTrack = JSON.parse(JSON.stringify(track));
    this.currentCustomTrack$.next(clonedTrack);
  }

  selectDirective(directive: string): void {
    console.log(directive);
  }

  selectedLayer(layer: any): void {
    this.homeCmp.setLayer(layer);
  }

  selectedLayerById(id: number): void {
    this._confMAPLAYERS$
      .pipe(
        take(1),
        filter(l => l != null),
        map(layers => {
          const layer = layers.filter(l => +l.id === id);
          return layer.length === 1 ? layer[0] : null;
        }),
      )
      .subscribe(layer => {
        this.selectedLayer(layer);
      });
  }

  setCurrentPoi(id): void {
    if (id !== this.currentPoiID$.value) {
      this.currentPoiID$.next(id);
    }
    this._cdr.detectChanges();
  }

  setCurrentRelatedPoi(poi: WmFeature<Point> | null | number): void {
    if (poi != null && poi != -1) {
      this.currentRelatedPoi$.next(poi as WmFeature<Point>);
      this.WmMapTrackRelatedPoisDirective.setPoi = (poi as WmFeature<Point>).id as number;
    }
  }

  setLoader(event: string): void {
    console.log(event);
    switch (event) {
      case 'rendering:layer_start':
        this._loadingSvc.show('Rendering Layer');
        break;
      case 'rendering:layer_done':
        this._loadingSvc.close('Rendering Layer');
        break;
      case 'rendering:pois_start':
        this._loadingSvc.show('Rendering Pois');
        break;
      case 'rendering:pois_done':
        this._loadingSvc.close('Rendering Pois');
        break;
      default:
        this._loadingSvc.close();
    }
  }

  setPoi(poi: any): void {
    this.resetSelectedUgcPoi$.next(!this.resetSelectedUgcPoi$.value);
    this.currentPoi$.next(poi);
  }

  setTrackElevationChartHoverElements(elements?: ITrackElevationChartHoverElements): void {
    if (elements != null) {
      this.trackElevationChartHoverElements$.next(elements);
    }
  }

  setUgcPoi(poi: WmFeature<Point>): void {
    this.resetSelectedPoi$.next(!this.resetSelectedPoi$.value);
    this.currentUgcPoi$.next(poi);
  }

  setWmMapFeatureCollection(overlay: any): void {
    try {
      this.homeCmp.setLayer(null);
    } catch (_) {}
    this.wmMapFeatureCollectionOverlay$.next(overlay);
  }

  toggleDirective(data: {type: 'layers' | 'pois'; toggle: boolean}): void {
    switch (data.type) {
      case 'layers':
        this.toggleLayerDirective$.next(data.toggle);
        break;
      case 'pois':
        this.togglePoisDirective$.next(data.toggle);
        break;
    }
  }

  toggleDrawTrackEnabled(): void {
    const currentValue = this.drawTrackEnable$.value;
    combineLatest([this.authEnable$, this.isLogged$])
      .pipe(
        take(1),
        switchMap(([authEnabled, isLogged]) => {
          if (authEnabled) {
            if (isLogged) {
              this.drawTrackEnable$.next(!currentValue);
              this.currentCustomTrack$.next(null);
              this._store.dispatch(setLayer(null));
              this._store.dispatch(resetPoiFilters());
              this._store.dispatch(resetTrackFilters());
              this.updateEcTrack();
            } else {
              return from(
                this._modalCtrl.create({
                  component: ProfileAuthComponent,
                  componentProps: {
                    slide1: 'assets/images/profile/logged_out_slide_1.svg',
                    slide2: 'assets/images/profile/logged_out_slide_2.svg',
                  },
                  id: 'wm-profile-auth-modal',
                }),
              ).pipe(concatMap(modal => from(modal.present())));
            }
          } else {
            this.drawTrackEnable$.next(!currentValue);
            this.currentCustomTrack$.next(null);
          }
        }),
      )
      .subscribe();
  }

  toggleMenu(): void {
    this.showMenu$.next(!this.showMenu$.value);
    this.resizeEVT.next(!this.resizeEVT.value);
  }

  unselectPOI(): void {
    this.currentPoi$.next(null);
    this.currentRelatedPoi$.next(null);
    this.currentUgcPoi$.next(null);
    this.WmMapTrackRelatedPoisDirective.setPoi = -1;
    this.resetSelectedPoi$.next(!this.resetSelectedPoi$.value);
    this.resetSelectedUgcPoi$.next(!this.resetSelectedUgcPoi$.value);
    this._router.navigate([], {
      relativeTo: this._route,
      queryParams: {poi: undefined},
      queryParamsHandling: 'merge',
    });
  }

  updateEcTrack(track = undefined): void {
    this._router.navigate([], {
      relativeTo: this._route,
      queryParams: {ugc_track: undefined, track},
      queryParamsHandling: 'merge',
    });
  }

  updateLastFilterType(filter: 'tracks' | 'pois'): void {
    this._store.dispatch(setLastFilterType({filter}));
  }

  updatePoiFilter(filter: SelectFilterOption | SliderFilter | Filter): void {
    this._store.dispatch(togglePoiFilter({filterIdentifier: filter.identifier}));
  }

  updateTrackFilter(filterGeneric: SelectFilterOption | SliderFilter | Filter): void {
    let filter = filterGeneric as Filter;
    if (filter.type === 'slider') {
      this._store.dispatch(updateTrackFilter({filter}));
    } else {
      this._store.dispatch(toggleTrackFilter({filter}));
    }
  }

  updateUgcTrack(ugc_track = undefined): void {
    this._store.dispatch(openUgc());
    this.homeCmp.setTrack(ugc_track);
    this._router.navigate([], {
      relativeTo: this._route,
      queryParams: {track: undefined, ugc_track},
      queryParamsHandling: 'merge',
    });
  }
}
