import {
  apiSearchInputTyped,
  apiTrackFilters,
  poiFilterIdentifiers,
  poiFilters,
  pois,
  stats,
} from './../../shared/wm-core/store/api/api.selector';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {Store} from '@ngrx/store';
import {FeatureCollection} from 'geojson';
import {BehaviorSubject, combineLatest, from, merge, Observable, of} from 'rxjs';
import {distinctUntilChanged, filter, map, share, startWith, switchMap, tap} from 'rxjs/operators';
import {CGeojsonLineStringFeature} from 'src/app/classes/features/cgeojson-line-string-feature';
import {HomeComponent} from 'src/app/components/home/home.component';
import {GeohubService} from 'src/app/services/geohub.service';
import {WmMapTrackRelatedPoisDirective} from 'src/app/shared/map-core/src/directives/track.related-pois.directive';
import {IDATALAYER} from 'src/app/shared/map-core/src/types/layer';
import {FiltersComponent} from 'src/app/shared/wm-core/filters/filters.component';
import {LangService} from 'src/app/shared/wm-core/localization/lang.service';
import {
  loadPois,
  togglePoiFilter,
  toggleTrackFilter,
} from 'src/app/shared/wm-core/store/api/api.actions';
import {
  apiElasticState,
  apiTrackFilter,
  apiElasticStateLayer,
} from 'src/app/shared/wm-core/store/api/api.selector';
import {
  confFILTERS,
  confGeohubId,
  confHOME,
  confJIDOUPDATETIME,
  confLANGUAGES,
  confMAP,
  confOPTIONS,
  confShowDrawTrack,
} from 'src/app/shared/wm-core/store/conf/conf.selector';

import {IGeojsonFeature} from 'src/app/shared/wm-core/types/model';
import {UICurrentPoiId} from 'src/app/store/UI/UI.selector';
import {ITrackElevationChartHoverElements} from 'src/app/types/track-elevation-chart';
import {environment} from 'src/environments/environment';

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
export class MapPage {
  readonly track$: Observable<CGeojsonLineStringFeature | null>;
  readonly trackColor$: BehaviorSubject<string> = new BehaviorSubject<string>('#caaf15');
  readonly trackid$: Observable<number>;

  @ViewChild(WmMapTrackRelatedPoisDirective)
  WmMapTrackRelatedPoisDirective: WmMapTrackRelatedPoisDirective;
  @ViewChild('filterCmp') filterCmp: FiltersComponent;
  @ViewChild(HomeComponent) homeCmp: HomeComponent;

  apiElasticState$: Observable<any> = this._store.select(apiElasticState);
  apiSearchInputTyped$: Observable<string> = this._store.select(apiSearchInputTyped);
  caretOutLine$: Observable<'caret-back-outline' | 'caret-forward-outline'>;
  confFILTERS$: Observable<any> = this._store.select(confFILTERS);
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
  );
  poiFilterIdentifiers$: Observable<string[]> = this._store.select(poiFilterIdentifiers);
  poiFilters$: Observable<any> = this._store.select(poiFilters);
  poiIDs$: BehaviorSubject<number[]> = new BehaviorSubject<number[]>([]);
  pois$: Observable<FeatureCollection> = this._store.select(pois);
  poisStats$: Observable<{
    [name: string]: {[identifier: string]: any};
  }> = this._store.select(stats);
  refreshLayer$: Observable<any>;
  reloadCustomTracks$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(null);
  resetSelectedPoi$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  resizeEVT: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  selectedTrackFilters$: Observable<any> = this._store.select(apiTrackFilters);
  showMenu$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(initMenuOpened);
  trackElevationChartHoverElements$: BehaviorSubject<ITrackElevationChartHoverElements | null> =
    new BehaviorSubject<ITrackElevationChartHoverElements | null>(null);
  translationCallback: (any) => string = value => {
    if (value == null) return '';
    return this._langService.instant(value);
  };
  wmMapFeatureCollectionUrl$: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(
    null,
  );

  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _geohubService: GeohubService,
    private _cdr: ChangeDetectorRef,
    private _store: Store,
    private _langService: LangService,
  ) {
    this.refreshLayer$ = combineLatest(
      this._store.select(apiTrackFilter),
      this.poiFilterIdentifiers$,
    );
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
          low: `https://jidotile.webmapp.it/?x={x}&y={y}&z={z}&index=geohub_app_low_${geohubId}`,
          high: `https://jidotile.webmapp.it/?x={x}&y={y}&z={z}&index=geohub_app_high_${geohubId}`,
        } as IDATALAYER;
      }),
    );
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
  }

  next(): void {
    this.WmMapTrackRelatedPoisDirective.poiNext();
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
    this.homeCmp.removeFilter(activity);
  }

  resetFilters(): void {
    this.homeCmp.goToHome();
  }

  saveCurrentCustomTrack(track: any): void {
    const clonedTrack = JSON.parse(JSON.stringify(track));
    this.currentCustomTrack$.next(clonedTrack);
  }

  selectTrack(trackid: any = -1): void {
    this.updateUrl(trackid);
  }

  selectedLayer(layer: any): void {
    this.homeCmp.setLayer(layer);
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

  setCustomTrackEnabled(): void {}

  setPoi(poi: any): void {
    this.currentPoi$.next(poi);
  }

  setTrackElevationChartHoverElements(elements?: ITrackElevationChartHoverElements): void {
    if (elements != null) {
      this.trackElevationChartHoverElements$.next(elements);
    }
  }

  setWmMapFeatureCollectionUrl(url: any): void {
    this.wmMapFeatureCollectionUrl$.next(url);
  }

  toggleDetails(trackid?): void {
    if (trackid == null) {
      trackid = -1;
    }
    this.updateUrl(trackid);
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
  }

  updatePoiFilter(filterIdentifier: string): void {
    this._store.dispatch(togglePoiFilter({filterIdentifier}));
  }

  updateTrackFilter(filterIdentifier: string): void {
    this._store.dispatch(toggleTrackFilter({filterIdentifier}));
  }

  updateUrl(trackid: number): void {
    this._router.navigate([], {
      relativeTo: this._route,
      queryParams: {track: trackid ? trackid : null},
      queryParamsHandling: 'merge',
    });
  }
}
