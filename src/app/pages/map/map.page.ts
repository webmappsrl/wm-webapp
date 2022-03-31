import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';

import {BehaviorSubject, from, Observable} from 'rxjs';
import {
  distinctUntilChanged,
  filter,
  map,
  startWith,
  switchMap,
  tap,
  withLatestFrom,
} from 'rxjs/operators';

import {CGeojsonLineStringFeature} from 'src/app/classes/features/cgeojson-line-string-feature';
import {GeohubService} from 'src/app/services/geohub.service';
import {ITrackElevationChartHoverElements} from 'src/app/types/track-elevation-chart';

const menuOpenLeft = 400;
const menuCloseLeft = 0;
const initPadding = [20, 50, 20, menuOpenLeft];
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
  readonly track$: Observable<CGeojsonLineStringFeature>;
  readonly trackid$: Observable<number>;
  caretOutLine$: Observable<'caret-back-outline' | 'caret-forward-outline'>;
  currentPoi$: Observable<any>;
  currentPoiFromMap$: BehaviorSubject<number> = new BehaviorSubject<number>(-1);
  currentPoiID$: BehaviorSubject<number> = new BehaviorSubject<number>(-1);
  currentPoiToMap$: BehaviorSubject<number> = new BehaviorSubject<number>(-1);
  leftPadding$: Observable<number>;
  mapPadding$: BehaviorSubject<number[]> = new BehaviorSubject<number[]>(initPadding);
  poiIDs$: BehaviorSubject<number[]> = new BehaviorSubject<number[]>([]);
  showMenu$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(initMenuOpened);
  trackElevationChartHoverElements$: BehaviorSubject<ITrackElevationChartHoverElements | null> =
    new BehaviorSubject<ITrackElevationChartHoverElements | null>(null);
  isMobile$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  resizeEVT: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _geohubService: GeohubService,
    private _cdr: ChangeDetectorRef,
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
      filter(trackid => trackid > -1),
      switchMap(trackid => from(this._geohubService.getEcTrack(trackid))),
      tap(track => {
        const poiIDs = (track.properties.related_pois || []).map(poi => poi.properties.id);
        this.poiIDs$.next(poiIDs);
      }),
    );

    this.caretOutLine$ = this.showMenu$.pipe(
      map(showMenu => (showMenu ? 'caret-back-outline' : 'caret-forward-outline')),
    );
    this.leftPadding$ = this.showMenu$.pipe(map(showMenu => (showMenu ? menuOpenLeft : 0)));

    const relatedPois$ = this.track$.pipe(
      map(track => track.properties),
      map(properties => properties.related_pois || []),
      distinctUntilChanged((a, b) => JSON.stringify(a) !== JSON.stringify(b)),
    );

    this.currentPoi$ = this.currentPoiToMap$.pipe(
      withLatestFrom(relatedPois$),
      map(([id, pois]) => {
        const relatedPoi = pois.filter(poi => {
          const poiProperties = poi.properties;
          return +poiProperties.id === +id;
        });
        return relatedPoi.length > 0 ? relatedPoi[0] : null;
      }),
      tap(currentPoi => {
        this.currentPoiID$.next(currentPoi?.properties?.id || -1);
      }),
      distinctUntilChanged(),
    );
  }

  public next(): void {
    const currentPoiID = this.currentPoiID$.value;
    const poiIDs = this.poiIDs$.value;
    const indexOfCurrentID = poiIDs.indexOf(currentPoiID);
    const nextIndex = (indexOfCurrentID + 1) % poiIDs.length;
    this.setCurrentPoi(poiIDs[nextIndex]);
  }

  public prev(): void {
    const currentPoiID = this.currentPoiID$.value;
    const poiIDs = this.poiIDs$.value;
    const indexOfCurrentID = poiIDs.indexOf(currentPoiID);
    const prevIndex = (indexOfCurrentID - 1) % poiIDs.length;
    this.setCurrentPoi(poiIDs.slice(prevIndex)[0]);
  }

  public selectTrack(trackid: number = -1) {
    this.updateUrl(trackid);
  }

  public setCurrentPoi(id) {
    this._cdr.detectChanges();
    if (id !== this.currentPoiToMap$.value) {
      this.currentPoiToMap$.next(id);
    }
  }

  public setTrackElevationChartHoverElements(elements?: ITrackElevationChartHoverElements): void {
    if (elements != null) {
      this.trackElevationChartHoverElements$.next(elements);
    }
  }

  public toggleDetails(trackid: number = -1) {
    this.updateUrl(trackid);
  }

  public toggleMenu() {
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

  public unselectPOI(): void {
    this.setCurrentPoi(-1);
  }

  public updateCurrentPoi(id) {
    if (id !== this.currentPoiToMap$.value) {
      this.currentPoiToMap$.next(id);
    }
  }

  public updateUrl(trackid: number) {
    this._router.navigate([], {
      relativeTo: this._route,
      queryParams: {track: trackid ? trackid : null},
      queryParamsHandling: 'merge',
    });
  }
}
