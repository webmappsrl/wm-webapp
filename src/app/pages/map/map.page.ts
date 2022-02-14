import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { first } from 'rxjs/operators';
import { ITrackElevationChartHoverElements } from 'src/app/types/track-elevation-chart';

@Component({
  selector: 'webmapp-map-page',
  templateUrl: './map.page.html',
  styleUrls: ['./map.page.scss'],
})
export class MapPage implements OnInit {
  public detailsId: number = 0;
  public showMenu: boolean = true;
  public mapPadding: Array<number> = [20, 50, 20, 250];
  public trackElevationChartHoverElements: ITrackElevationChartHoverElements;

  constructor(
    private _route: ActivatedRoute,
    private _router: Router
  ) { }

  async ngOnInit() {
    const params = await this._route.queryParams.pipe(first()).toPromise();
    const trackId = params['track'];
    if (trackId) { this.detailsId = Number.parseFloat(trackId); }
  }

  toggleDetails(event: number = 0) {
    this.detailsId = event;
    this.updateUrl();
  }

  updateUrl(){
    this._router.navigate(
      [],
      {
        relativeTo: this._route,
        queryParams: { track: this.detailsId ?  this.detailsId : null },
        queryParamsHandling: 'merge'
      });
  }

  setTrackElevationChartHoverElements(
    elements?: ITrackElevationChartHoverElements
  ): void {
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
