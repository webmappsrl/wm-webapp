import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'webmapp-map-page',
  templateUrl: './map.page.html',
  styleUrls: ['./map.page.scss'],
})
export class MapPage implements OnInit {
  public detailsId: number;
  public mapPadding: Array<number> = [0, 30, 0, 0];

  constructor() {}

  ngOnInit() {}

  toggleDetails(event?: number) {
    this.mapPadding = [
      this.mapPadding[0],
      this.mapPadding[1],
      this.mapPadding[2],
      400,
    ];
    this.detailsId = event;
  }
}
