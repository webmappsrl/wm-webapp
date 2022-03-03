import {ChangeDetectionStrategy, Component} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';

import {BehaviorSubject, from, Observable} from 'rxjs';
import {filter, map, startWith, switchMap} from 'rxjs/operators';

import {CGeojsonLineStringFeature} from 'src/app/classes/features/cgeojson-line-string-feature';
import {GeohubService} from 'src/app/services/geohub.service';
import {ITrackElevationChartHoverElements} from 'src/app/types/track-elevation-chart';

const menuOpenLeft = 420;
const menuCloseLeft = 20;
const initPadding = [20, 50, 20, menuOpenLeft];
const initMenuOpened = true;
@Component({
  selector: 'webmapp-map-page',
  templateUrl: './map.page.html',
  styleUrls: ['./map.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MapPage {
  showMenu$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(initMenuOpened);
  mapPadding$: BehaviorSubject<number[]> = new BehaviorSubject<number[]>(initPadding);
  caretOutLine$: Observable<'caret-back-outline' | 'caret-forward-outline'>;

  readonly trackid$: Observable<number>;
  readonly track$: Observable<CGeojsonLineStringFeature>;

  trackElevationChartHoverElements$: BehaviorSubject<ITrackElevationChartHoverElements | null> =
    new BehaviorSubject<ITrackElevationChartHoverElements | null>(null);
  currentPoiFromMap$: BehaviorSubject<number> = new BehaviorSubject<number>(-1);
  currentPoiToMap$: BehaviorSubject<number> = new BehaviorSubject<number>(-1);

  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _geohubService: GeohubService,
  ) {
    this.trackid$ = this._route.queryParams.pipe(
      filter(params => params != null && params.track != null),
      map(params => +params.track),
      startWith(-1),
    );
    this.track$ = this.trackid$.pipe(
      filter(trackid => trackid > -1),
      switchMap(trackid => from(this._geohubService.getEcTrack(trackid))),
    );

    this.caretOutLine$ = this.showMenu$.pipe(
      map(showMenu => (showMenu ? 'caret-back-outline' : 'caret-forward-outline')),
    );
  }

  toggleDetails(trackid: number = -1) {
    this.updateUrl(trackid);
  }

  updateCurrentPoi(id) {
    this.currentPoiFromMap$.next(id);
  }

  setCurrentPoi(id) {
    this.currentPoiToMap$.next(id);
  }

  selectTrack(trackid: number = -1) {
    this.updateUrl(trackid);
  }

  updateUrl(trackid: number) {
    this._router.navigate([], {
      relativeTo: this._route,
      queryParams: {track: trackid ? trackid : null},
      queryParamsHandling: 'merge',
    });
  }

  setTrackElevationChartHoverElements(elements?: ITrackElevationChartHoverElements): void {
    if (elements != null) {
      this.trackElevationChartHoverElements$.next(elements);
    }
  }

  toggleMenu() {
    this.showMenu$.next(!this.showMenu$.value);
    this.mapPadding$.next([
      initPadding[0],
      initPadding[1],
      initPadding[2],
      this.showMenu$.value ? menuOpenLeft : menuCloseLeft,
    ]);
  }
}
