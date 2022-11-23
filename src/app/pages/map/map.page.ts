import {ActivatedRoute, Router} from '@angular/router';
import {BehaviorSubject, Observable, combineLatest, from, merge, of} from 'rxjs';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ViewEncapsulation,
} from '@angular/core';
import {UICurrentFilters, UICurrentLAyer, UICurrentPoiId} from 'src/app/store/UI/UI.selector';
import {
  catchError,
  distinctUntilChanged,
  filter,
  map,
  shareReplay,
  startWith,
  switchMap,
  tap,
  withLatestFrom,
} from 'rxjs/operators';
import {
  confGeohubId,
  confJIDOUPDATETIME,
  confMAP,
  confShowDrawTrack,
} from 'src/app/store/conf/conf.selector';

import {CGeojsonLineStringFeature} from 'src/app/classes/features/cgeojson-line-string-feature';
import {GeohubService} from 'src/app/services/geohub.service';
import {IDATALAYER} from 'src/app/shared/map-core/types/layer';
import {ITrackElevationChartHoverElements} from 'src/app/types/track-elevation-chart';
import {Store} from '@ngrx/store';
import {environment} from 'src/environments/environment';
import {loadPois} from 'src/app/store/pois/pois.actions';
import {pois} from 'src/app/store/pois/pois.selector';
import { setCurrentPoi } from 'src/app/store/UI/UI.actions';

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
})
export class MapPage {
  readonly track$: Observable<CGeojsonLineStringFeature | null>;
  readonly trackid$: Observable<number>;

  caretOutLine$: Observable<'caret-back-outline' | 'caret-forward-outline'>;
  confJIDOUPDATETIME$: Observable<any> = this._store.select(confJIDOUPDATETIME);
  confMap$: Observable<any> = this._store.select(confMAP).pipe(
    tap(c => {
      if (c != null && c.pois != null && c.pois.apppoisApiLayer == true) {
        this._store.dispatch(loadPois());
      }
    }),
  );
  currentCustomTrack$: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  currentFilters$ = this._store.select(UICurrentFilters);
  currentLayer$ = this._store.select(UICurrentLAyer);
  currentPoi$: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  currentPoiID$: BehaviorSubject<number> = new BehaviorSubject<number>(-1);
  currentPoiIDFromHome$ = this._store.select(UICurrentPoiId);
  currentPoiIDToMap$: Observable<number | null>;
  currentRelatedPoi$: Observable<any>;
  currentRelatedPoiID$: BehaviorSubject<number> = new BehaviorSubject<number>(-1);
  dataLayerUrls$: Observable<IDATALAYER>;
  disableLayers$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  drawTrackEnable$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  enableDrawTrack$ = this._store.select(confShowDrawTrack);
  enableOverLay$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  geohubId$ = this._store.select(confGeohubId);
  graphhopperHost$: Observable<string> = of(environment.graphhopperHost);
  leftPadding$: Observable<number>;
  mapPadding$: BehaviorSubject<number[]> = new BehaviorSubject<number[]>(initPadding);
  poiIDs$: BehaviorSubject<number[]> = new BehaviorSubject<number[]>([]);
  pois$: Observable<any> = this._store.select(pois);
  reloadCustomTracks$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(null);
  resizeEVT: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  showMenu$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(initMenuOpened);
  trackElevationChartHoverElements$: BehaviorSubject<ITrackElevationChartHoverElements | null> =
    new BehaviorSubject<ITrackElevationChartHoverElements | null>(null);

  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _geohubService: GeohubService,
    private _cdr: ChangeDetectorRef,
    private _store: Store,
  ) {
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
    );

    this.caretOutLine$ = this.showMenu$.pipe(
      map(showMenu => (showMenu ? 'caret-back-outline' : 'caret-forward-outline')),
    );
    this.leftPadding$ = this.showMenu$.pipe(map(showMenu => (showMenu ? menuOpenLeft : 0)));
    const relatedPois$ = this.track$.pipe(
      map(track => (track != null && track.properties != null ? track.properties : null)),
      filter(p => p != null),
      map(properties =>
        properties != null && properties.related_pois != null ? properties.related_pois : [],
      ),
      catchError(e => of([])),
      shareReplay(1),
    );
    this.currentRelatedPoi$ = combineLatest([this.currentRelatedPoiID$, relatedPois$]).pipe(
      map(([id, pois]) => {
        if (id != -1) {
          const relatedPois = pois.filter(poi => {
            const poiProperties = poi.properties;
            return +poiProperties.id === +id;
          });
          const relatedPoi = relatedPois[0] ?? null;
          return relatedPoi;
        }
        return null;
      }),
      catchError(e => of(null)),
      shareReplay(),
    );

    this.currentPoiIDToMap$ = merge(
      this.currentRelatedPoiID$,
      this.currentPoiID$,
      this.currentPoiIDFromHome$,
    ).pipe(
      map(val => val ?? -1),
      distinctUntilChanged((prev, curr) => +prev === +curr),
    );
  }

  next(): void {
    const currentRelatedPoiID = this.currentRelatedPoiID$.value;
    const poiIDs = this.poiIDs$.value;
    const indexOfCurrentID = poiIDs.indexOf(currentRelatedPoiID);
    const nextIndex = (indexOfCurrentID + 1) % poiIDs.length;
    this.setCurrentRelatedPoi(poiIDs[nextIndex]);
  }

  prev(): void {
    const currentRelatedPoiID = this.currentRelatedPoiID$.value;
    const poiIDs = this.poiIDs$.value;
    const indexOfCurrentID = poiIDs.indexOf(currentRelatedPoiID);
    const prevIndex = (indexOfCurrentID - 1) % poiIDs.length;
    this.setCurrentRelatedPoi(poiIDs.slice(prevIndex)[0]);
  }

  reloadCustomTrack(): void {
    this.reloadCustomTracks$.next(!this.reloadCustomTracks$.value ?? false);
  }

  saveCurrentCustomTrack(track: any): void {
    const clonedTrack = JSON.parse(JSON.stringify(track));
    this.currentCustomTrack$.next(clonedTrack);
  }

  selectTrack(trackid: any = -1): void {
    this.updateUrl(trackid);
  }

  setCurrentPoi(id): void {
    if (id !== this.currentPoiID$.value) {
      this.currentPoiID$.next(id);
    }
    this._cdr.detectChanges();
  }

  setCurrentRelatedPoi(id): void {
    this.currentPoiID$.next(-1);
    if (id !== this.currentRelatedPoiID$.value) {
      this.currentRelatedPoiID$.next(id);
    }
    this._cdr.detectChanges();
  }

  setCustomTrackEnabled(): void {
    console.log('ffff');
  }

  setPoi(poi:any): void {
    this.currentPoi$.next(poi);
  }

  setTrackElevationChartHoverElements(elements?: ITrackElevationChartHoverElements): void {
    if (elements != null) {
      this.trackElevationChartHoverElements$.next(elements);
    }
  }

  toggleDetails(trackid: number = -1): void {
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
    this.currentPoiID$.next(-1);
    this.currentRelatedPoiID$.next(-1);
    this.currentPoi$.next(null);
  }

  updateUrl(trackid: number): void {
    this._router.navigate([], {
      relativeTo: this._route,
      queryParams: {track: trackid ? trackid : null},
      queryParamsHandling: 'merge',
    });
  }
}
