import {currentEcPoiId} from '@wm-core/store/features/ec/ec.selector';
import {currentEcTrack} from '@wm-core/store/features/ec/ec.selector';
import {ChangeDetectionStrategy, Component, ViewChild, ViewEncapsulation} from '@angular/core';
import {LineString, Point} from 'geojson';
import {Store} from '@ngrx/store';
import {BehaviorSubject, Observable} from 'rxjs';
import {map, tap} from 'rxjs/operators';

import {
  confAUTHEnable,
  confGeohubId,
  confLANGUAGES,
  confOPTIONS,
  confShowDrawTrack,
} from '@wm-core/store/conf/conf.selector';

import {ITrackElevationChartHoverElements} from 'src/app/types/track-elevation-chart';
import {IOPTIONS} from '@wm-core/types/config';
import {LangService} from '@wm-core/localization/lang.service';
import {WmFeature} from 'src/app/shared/wm-types/src';
import {currentCustomTrack, currentUgcTrack} from '@wm-core/store/features/ugc/ugc.selector';
import {currentCustomTrack as currentCustomTrackAction} from '@wm-core/store/features/ugc/ugc.actions';

import {UrlHandlerService} from '@wm-core/services/url-handler.service';
import {poi, track} from '@wm-core/store/features/features.selector';
import {homeOpened} from '@wm-core/store/user-activity/user-activity.selector';
import {WmHomeComponent} from '@wm-core/home/home.component';
const menuOpenLeft = 400;
const initPadding = [100, 100, 100, menuOpenLeft];
const initMenuOpened = true;
@Component({
  selector: 'webmapp-map-page',
  templateUrl: './map.page.html',
  styleUrls: ['./map.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  providers: [LangService],
})
export class MapPage {
  @ViewChild(WmHomeComponent) homeCmp: WmHomeComponent;

  caretOutLine$: Observable<'caret-back-outline' | 'caret-forward-outline'>;
  confOPTIONS$: Observable<IOPTIONS> = this._store.select(confOPTIONS);
  currentEcPoiId$ = this._store.select(currentEcPoiId);
  ecTrack$: Observable<WmFeature<LineString> | null> = this._store.select(currentEcTrack);
  geohubId$ = this._store.select(confGeohubId);
  langs$ = this._store.select(confLANGUAGES).pipe(
    tap(l => {
      if (l && l.default) {
        this._langService.initLang(l.default);
      }
    }),
  );
  mapPadding$: BehaviorSubject<number[]> = new BehaviorSubject<number[]>(initPadding);
  poi$ = this._store.select(poi);
  resizeEVT: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  showDrawTrackButton$: Observable<boolean> = this._store.select(confShowDrawTrack);
  showMenu$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(initMenuOpened);
  track$ = this._store.select(track);
  trackElevationChartHoverElements$: BehaviorSubject<ITrackElevationChartHoverElements | null> =
    new BehaviorSubject<ITrackElevationChartHoverElements | null>(null);
  ugcTrack$: Observable<WmFeature<LineString> | null> = this._store.select(currentUgcTrack);
  wmHomeEnable$ = this._store.select(homeOpened);

  constructor(
    private _store: Store,
    private _langService: LangService,
    private _urlHandlerSvc: UrlHandlerService,
  ) {
    this.caretOutLine$ = this.showMenu$.pipe(
      map(showMenu => (showMenu ? 'caret-back-outline' : 'caret-forward-outline')),
    );
  }

  next(): void {}

  openPopup(popup: any): void {
    this.homeCmp.popup$.next(popup);
  }

  prev(): void {}

  reloadCustomTrack(): void {
    this._store.dispatch(currentCustomTrackAction({currentCustomTrack: null}));
  }

  setCurrentRelatedPoi(feature: number | WmFeature<Point> | null): void {
    if (feature == null) {
      return;
    } else if (typeof feature === 'number') {
      this._urlHandlerSvc.updateURL({ec_related_poi: feature});
    } else if (feature.properties != null && feature.properties.id != null) {
      const id = feature.properties.id;
      this._urlHandlerSvc.updateURL({ec_related_poi: id});
    }
  }

  setTrackElevationChartHoverElements(elements?: ITrackElevationChartHoverElements): void {
    if (elements != null) {
      this.trackElevationChartHoverElements$.next(elements);
    }
  }

  toggleMenu(): void {
    this.showMenu$.next(!this.showMenu$.value);
    this.resizeEVT.next(!this.resizeEVT.value);
  }

  unselectPOI(): void {
    this._urlHandlerSvc.updateURL({poi: undefined, ugc_poi: undefined, ec_related_poi: undefined});
  }

  updateEcTrack(track = undefined): void {
    const params = {ugc_track: undefined, track};
    if (track == null) {
      params['ec_related_poi'] = undefined;
    }
    this._urlHandlerSvc.updateURL(params);
  }
}
