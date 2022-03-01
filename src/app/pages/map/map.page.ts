import {Component} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {Observable} from 'rxjs';
import {filter, map, startWith} from 'rxjs/operators';
import {ITrackElevationChartHoverElements} from 'src/app/types/track-elevation-chart';

@Component({
  selector: 'webmapp-map-page',
  templateUrl: './map.page.html',
  styleUrls: ['./map.page.scss'],
})
export class MapPage {
  public showMenu: boolean = true;
  public mapPadding: Array<number> = [20, 50, 20, 250];
  public trackElevationChartHoverElements: ITrackElevationChartHoverElements;
  readonly trackid$: Observable<number>;

  constructor(private _route: ActivatedRoute, private _router: Router) {
    this.trackid$ = this._route.queryParams.pipe(
      filter(params => params != null && params.track != null),
      map(params => +params.track),
      startWith(-1),
    );
  }

  toggleDetails(trackid: number = -1) {
    this.updateUrl(trackid);
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
    this.trackElevationChartHoverElements = elements;
  }

  toggleMenu() {
    this.showMenu = !this.showMenu;
    this.mapPadding = [
      this.mapPadding[0],
      this.mapPadding[1],
      this.mapPadding[2],
      this.showMenu ? 420 : 20,
    ];
  }
}
