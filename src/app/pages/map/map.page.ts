import {ActivatedRoute, Router} from '@angular/router';
import {BehaviorSubject, Observable, combineLatest, from, merge, of} from 'rxjs';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  ViewEncapsulation,
} from '@angular/core';
import {UICurrentFilters, UICurrentLAyer, UICurrentPoiId} from 'src/app/store/UI/UI.selector';
import {
  catchError,
  filter,
  map,
  shareReplay,
  startWith,
  switchMap,
  tap,
  withLatestFrom,
} from 'rxjs/operators';

import {CGeojsonLineStringFeature} from 'src/app/classes/features/cgeojson-line-string-feature';
import {GeohubService} from 'src/app/services/geohub.service';
import {ITrackElevationChartHoverElements} from 'src/app/types/track-elevation-chart';
import {Store} from '@ngrx/store';
import {confMAP} from 'src/app/store/conf/conf.selector';
import {loadPois} from 'src/app/store/pois/pois.actions';
import {pois} from 'src/app/store/pois/pois.selector';

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
  confMap$: Observable<any> = this._store.select(confMAP).pipe(
    tap(c => {
      if (c != null && c.pois != null && c.pois.apppoisApiLayer == true) {
        this._store.dispatch(loadPois());
      }
    }),
  );
  drawTrackEnable$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  disableLayers$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  currentLayer$ = this._store.select(UICurrentLAyer);
  currentFilters$ = this._store.select(UICurrentFilters);
  currentPoiIDFromHome$ = this._store.select(UICurrentPoiId);
  currentPoi$: Observable<any>;
  currentPoiID$: BehaviorSubject<number> = new BehaviorSubject<number>(-1);
  currentPoiIDToMap$: Observable<number | null>;
  currentRelatedPoiID$: BehaviorSubject<number> = new BehaviorSubject<number>(-1);
  isMobile$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  leftPadding$: Observable<number>;
  mapPadding$: BehaviorSubject<number[]> = new BehaviorSubject<number[]>(initPadding);
  poiIDs$: BehaviorSubject<number[]> = new BehaviorSubject<number[]>([]);
  pois$: Observable<any> = this._store.select(pois);
  popupCloseEVT$: EventEmitter<null> = new EventEmitter<null>();
  resizeEVT: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  showMenu$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(initMenuOpened);
  trackElevationChartHoverElements$: BehaviorSubject<ITrackElevationChartHoverElements | null> =
    new BehaviorSubject<ITrackElevationChartHoverElements | null>(null);

  currentCustomTrack$: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  reloadCustomTracks$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(null);

  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _geohubService: GeohubService,
    private _cdr: ChangeDetectorRef,
    private _store: Store,
  ) {
    if (window.innerWidth < maxWidth) {
      this.isMobile$.next(true);
      this.mapPadding$.next([initPadding[0], initPadding[1], initPadding[2], menuCloseLeft]);
      this.resizeEVT.next(!this.resizeEVT.value);
    }
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
    const currentRelatedPoi = combineLatest([this.currentRelatedPoiID$, relatedPois$]).pipe(
      map(([id, pois]) => {
        const relatedPois = pois.filter(poi => {
          const poiProperties = poi.properties;
          return +poiProperties.id === +id;
        });
        const relatedPoi = relatedPois[0] ?? null;
        return relatedPoi;
      }),
      catchError(e => of(null)),
      shareReplay(),
    );
    const currentPoi = merge(this.currentPoiID$, this.currentPoiIDFromHome$).pipe(
      withLatestFrom(this.pois$.pipe(filter(p => p != null))),
      map(([id, pois]) => {
        const relatedPois = pois.features.filter(poi => {
          const poiProperties = poi.properties;
          return +poiProperties.id === +id;
        });
        const relatedPoi = relatedPois[0] ?? null;
        const properties = {...relatedPoi.properties};
        return {...relatedPoi, properties};
      }),
      catchError(e => of(null)),
      shareReplay(),
    );
    this.currentPoi$ = merge(currentRelatedPoi, currentPoi, this.popupCloseEVT$);
    this.currentPoiIDToMap$ = merge(
      this.currentRelatedPoiID$,
      this.currentPoiID$,
      this.currentPoiIDFromHome$,
      this.popupCloseEVT$,
    ).pipe(map(val => val ?? -1));
  }

  next(): void {
    const currentRelatedPoiID = this.currentRelatedPoiID$.value;
    const poiIDs = this.poiIDs$.value;
    const indexOfCurrentID = poiIDs.indexOf(currentRelatedPoiID);
    const nextIndex = (indexOfCurrentID + 1) % poiIDs.length;
    this.setCurrentRelatedPoi(poiIDs[nextIndex]);
  }
  setCustomTrackEnabled(): void {
    console.log('ffff');
  }
  prev(): void {
    console.log('prreee');
    const currentRelatedPoiID = this.currentRelatedPoiID$.value;
    const poiIDs = this.poiIDs$.value;
    const indexOfCurrentID = poiIDs.indexOf(currentRelatedPoiID);
    const prevIndex = (indexOfCurrentID - 1) % poiIDs.length;
    this.setCurrentRelatedPoi(poiIDs.slice(prevIndex)[0]);
  }

  selectTrack(trackid: any = -1) {
    this.updateUrl(trackid);
  }

  setCurrentPoi(id) {
    if (id !== this.currentPoiID$.value) {
      this.currentPoiID$.next(id);
    }
    this._cdr.detectChanges();
  }
  reloadCustomTrack(): void {
    console.log(
      'reload',
      !this.reloadCustomTracks$.value,
      !this.reloadCustomTracks$.value ?? false,
    );
    this.reloadCustomTracks$.next(!this.reloadCustomTracks$.value ?? false);
  }
  setCurrentRelatedPoi(id) {
    if (id !== this.currentRelatedPoiID$.value) {
      this.currentRelatedPoiID$.next(id);
    }
    this._cdr.detectChanges();
  }

  setTrackElevationChartHoverElements(elements?: ITrackElevationChartHoverElements): void {
    if (elements != null) {
      this.trackElevationChartHoverElements$.next(elements);
    }
  }

  toggleDetails(trackid: number = -1) {
    this.updateUrl(trackid);
  }

  toggleMenu() {
    this.showMenu$.next(!this.showMenu$.value);
    if (!this.isMobile$.value) {
      this.mapPadding$.next([
        initPadding[0],
        initPadding[1],
        initPadding[2],
        this.showMenu$.value ? menuOpenLeft : menuCloseLeft,
      ]);
    } else {
      this.resizeEVT.next(!this.resizeEVT.value);
    }
  }

  unselectPOI(): void {
    // this.setCurrentRelatedPoi(-1);
    this.popupCloseEVT$.emit(null);
  }

  updateUrl(trackid: number) {
    this._router.navigate([], {
      relativeTo: this._route,
      queryParams: {track: trackid ? trackid : null},
      queryParamsHandling: 'merge',
    });
  }

  saveCurrentCustomTrack(track: any) {
    console.log(track);
    const clonedTrack = JSON.parse(JSON.stringify(track));
    this.currentCustomTrack$.next(clonedTrack);
  }

  toggleDrawTrackEnabled(): void {
    const currentValue = this.drawTrackEnable$.value;
    this.currentCustomTrack$.next(null);
    this.drawTrackEnable$.next(!currentValue);
  }
}
