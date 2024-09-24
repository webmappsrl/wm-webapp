import {
  setLastFilterType,
  updateTrackFilter,
  loadPois,
  togglePoiFilter,
  toggleTrackFilter,
} from 'wm-core/store/api/api.actions';
import {
  apiSearchInputTyped,
  apiElasticState,
  apiElasticStateLayer,
  poiFilterIdentifiers,
  pois,
  apiGoToHome,
  countSelectedFilters,
  poisInitFeatureCollection,
} from 'wm-core/store/api/api.selector';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {Store} from '@ngrx/store';
import {Feature, FeatureCollection} from 'geojson';
import {BehaviorSubject, from, merge, Observable, of, Subscription} from 'rxjs';
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
} from 'rxjs/operators';
import {HomeComponent} from 'src/app/components/home/home.component';
import {GeohubService} from 'src/app/services/geohub.service';
import {WmMapTrackRelatedPoisDirective} from 'src/app/shared/map-core/src/directives/track.related-pois.directive';
import {IDATALAYER} from 'src/app/shared/map-core/src/types/layer';

import {
  confGeohubId,
  confHOME,
  confJIDOUPDATETIME,
  confLANGUAGES,
  confMAP,
  confMAPLAYERS,
  confOPTIONS,
  confShowDrawTrack,
} from 'wm-core/store/conf/conf.selector';

import {IGeojsonFeature} from 'wm-core/types/model';
import {UICurrentPoiId} from 'src/app/store/UI/UI.selector';
import {ITrackElevationChartHoverElements} from 'src/app/types/track-elevation-chart';
import {environment} from 'src/environments/environment';
import {WmLoadingService} from 'wm-core/services/loading.service';
import {
  Filter,
  IHOME,
  ILAYER,
  IOPTIONS,
  SelectFilterOption,
  SliderFilter,
} from 'wm-core/types/config';
import {LangService} from 'wm-core/localization/lang.service';
import {FiltersComponent} from 'wm-core/filters/filters.component';
import { hitMapFeatureCollection } from 'src/app/shared/map-core/src/store/map-core.selector';
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

  readonly track$: Observable<Feature>;
  readonly trackColor$: BehaviorSubject<string> = new BehaviorSubject<string>('#caaf15');
  readonly trackid$: Observable<number>;

  @ViewChild(WmMapTrackRelatedPoisDirective)
  WmMapTrackRelatedPoisDirective: WmMapTrackRelatedPoisDirective;
  @ViewChild('filterCmp') filterCmp: FiltersComponent;
  @ViewChild(HomeComponent) homeCmp: HomeComponent;

  apiElasticState$: Observable<any> = this._store.select(apiElasticState);
  apiGoToHome$: Observable<boolean> = this._store.select(apiGoToHome);
  apiSearchInputTyped$: Observable<string> = this._store.select(apiSearchInputTyped);
  caretOutLine$: Observable<'caret-back-outline' | 'caret-forward-outline'>;
  confHOME$: Observable<IHOME[]> = this._store.select(confHOME);
  confJIDOUPDATETIME$: Observable<any> = this._store.select(confJIDOUPDATETIME);
  confMap$: Observable<any> = this._store.select(confMAP).pipe(
    tap(c => {
      if (c != null && c.pois != null && c.pois.apppoisApiLayer == true) {
        this._store.dispatch(loadPois());
      }
    }),
  );
  confOPTIONS$: Observable<IOPTIONS> = this._store.select(confOPTIONS);
  currentCustomTrack$: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  currentLayer$ = this._store.select(apiElasticStateLayer);
  currentPoi$: BehaviorSubject<IGeojsonFeature> = new BehaviorSubject<IGeojsonFeature | null>(null);
  currentPoiID$: BehaviorSubject<number> = new BehaviorSubject<number>(-1);
  currentPoiIDFromHome$ = this._store.select(UICurrentPoiId);
  currentPoiIDToMap$: Observable<number | null>;
  currentPoiNextID$: BehaviorSubject<number> = new BehaviorSubject<number>(-1);
  currentPoiPrevID$: BehaviorSubject<number> = new BehaviorSubject<number>(-1);
  currentRelatedPoi$: BehaviorSubject<IGeojsonFeature> =
    new BehaviorSubject<IGeojsonFeature | null>(null);
  dataLayerUrls$: Observable<IDATALAYER>;
  disableLayers$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  drawTrackEnable$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  enableDrawTrack$ = this._store.select(confShowDrawTrack);
  enableOverLay$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  geohubId$ = this._store.select(confGeohubId);
  goToHomeSub$: Subscription = Subscription.EMPTY;
  graphhopperHost$: Observable<string> = of(environment.graphhopperHost);
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
  mergedPoi$: Observable<any> = merge(
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
  ).pipe(
    tap(poi => {
      if (poi != null) {
        this._router.navigate([], {
          relativeTo: this._route,
          queryParams: {poi: poi.id ?? poi.properties.id},
          queryParamsHandling: 'merge',
        });
      }
    }),
  );
  overlayFeatureCollections$ = this._store.select(hitMapFeatureCollection);
  poiFilterIdentifiers$: Observable<string[]> = this._store.select(poiFilterIdentifiers);
  poiIDs$: BehaviorSubject<number[]> = new BehaviorSubject<number[]>([]);
  pois$: Observable<FeatureCollection> = this._store.select(pois);
  refreshLayer$: Observable<any>;
  reloadCustomTracks$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(null);
  resetSelectedPoi$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
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
  wmMapFeatureCollectionOverlay$: BehaviorSubject<any | null> = new BehaviorSubject<any | null>(
    null,
  );
  wmMapHitMapUrl$: Observable<string | null> = this.confMap$.pipe(map(conf => conf?.hitMapUrl));

  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _geohubService: GeohubService,
    private _cdr: ChangeDetectorRef,
    private _store: Store,
    private _langService: LangService,
    private _loadingSvc: WmLoadingService,
  ) {
    this.refreshLayer$ = this._store.select(countSelectedFilters);
    if (window.innerWidth < maxWidth) {
      this.mapPadding$.next([initPadding[0], initPadding[1], initPadding[2], menuCloseLeft]);
      this.resizeEVT.next(!this.resizeEVT.value);
    }
    this.dataLayerUrls$ = this.geohubId$.pipe(
      filter(g => g != null),
      map(geohubId => {
        if (geohubId == 13) {
          this.enableOverLay$.next(true);
        }

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

    this.trackid$ = this._route.queryParams.pipe(
      filter(params => params != null && params.track != null),
      map(params => +params.track),
      startWith(-1),
    );
    this.track$ = this.trackid$.pipe(
      distinctUntilChanged((prev, curr) => {
        return prev === curr;
      }),
      switchMap(trackid =>
        trackid > -1 ? from(this._geohubService.getEcTrack(trackid)) : of(null),
      ),
      tap(track => {
        if (track != null) {
          const poiIDs = (track.properties.related_pois || []).map(poi => poi.properties.id);
          this.poiIDs$.next(poiIDs);
        } else {
          this.poiIDs$.next([]);
        }
      }),
      share(),
    );

    this.caretOutLine$ = this.showMenu$.pipe(
      map(showMenu => (showMenu ? 'caret-back-outline' : 'caret-forward-outline')),
    );
    this.leftPadding$ = this.showMenu$.pipe(map(showMenu => (showMenu ? menuOpenLeft : 0)));
    this.currentPoiIDToMap$ = merge(this.currentPoiID$, this.currentPoiIDFromHome$).pipe(
      map(val => val ?? -1),
      distinctUntilChanged((prev, curr) => +prev === +curr),
    );

    this.goToHomeSub$ = this.apiGoToHome$.pipe(skip(1)).subscribe(_ => {
      this.unselectPOI();
    });
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

  printPage() {
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

  selectDirective(directive: string) {
    console.log(directive);
  }

  selectTrack(trackid: any = -1): void {
    this.updateUrl(trackid);
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

  setCurrentRelatedPoi(poi: IGeojsonFeature | null | number): void {
    if (poi != null && poi != -1) {
      this.currentRelatedPoi$.next(poi as IGeojsonFeature);
      this.WmMapTrackRelatedPoisDirective.setPoi = (poi as any).id as number;
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
    this.currentPoi$.next(poi);
  }

  setTrackElevationChartHoverElements(elements?: ITrackElevationChartHoverElements): void {
    if (elements != null) {
      this.trackElevationChartHoverElements$.next(elements);
    }
  }

  setWmMapFeatureCollection(overlay: any): void {
    try {
      this.homeCmp.setLayer(null);
    } catch (_) {}
    this.wmMapFeatureCollectionOverlay$.next(overlay);
    this.overlayFeatureCollections$.pipe(take(1)).subscribe(feature => {
      if (overlay['featureType'] != null && feature[overlay['featureType']] != null) {
        this.wmMapFeatureCollectionOverlay$.next({
          ...overlay,
          ...{url: feature[overlay['featureType']]},
        });
      }
    });
  }

  toggleDetails(trackid?): void {
    if (trackid == null) {
      trackid = -1;
    }
    this.updateUrl(trackid);
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
    this.currentCustomTrack$.next(null);
    this.drawTrackEnable$.next(!currentValue);
  }

  toggleMenu(): void {
    this.showMenu$.next(!this.showMenu$.value);
    this.resizeEVT.next(!this.resizeEVT.value);
  }

  unselectPOI(): void {
    this.currentPoi$.next(null);
    this.currentRelatedPoi$.next(null);
    this.WmMapTrackRelatedPoisDirective.setPoi = -1;
    this.resetSelectedPoi$.next(!this.resetSelectedPoi$.value);
    this._router.navigate([], {
      relativeTo: this._route,
      queryParams: {poi: undefined},
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

  updateUrl(trackid: number): void {
    this._router.navigate([], {
      relativeTo: this._route,
      queryParams: {track: trackid ? trackid : null},
      queryParamsHandling: 'merge',
    });
  }
}
