import { Component, OnInit } from '@angular/core';
import { ITrackElevationChartHoverElements } from 'src/app/types/track-elevation-chart';

@Component({
  selector: 'webmapp-map-page',
  templateUrl: './map.page.html',
  styleUrls: ['./map.page.scss'],
})
export class MapPage implements OnInit {
  public detailsId: number = 0;
  public showMenu: boolean = true;
  public mapPadding: Array<number> = [20, 50, 20, 20];
  public trackElevationChartHoverElements: ITrackElevationChartHoverElements;

  constructor() {}

  ngOnInit() {}

  toggleDetails(event: number = 0) {
    this.detailsId = event;
  }

  setTrackElevationChartHoverElements(
    elements?: ITrackElevationChartHoverElements
  ): void {
    this.trackElevationChartHoverElements = elements;
  }

  toggleMenu(){
    this.showMenu = !this.showMenu;
    this.mapPadding = [
      this.mapPadding[0],
      this.mapPadding[1],
      this.mapPadding[2],
      this.showMenu ? 420 : 20,
    ];
  }

}
