import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-draw-track',
  templateUrl: './draw-track.component.html',
  styleUrls: ['./draw-track.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DrawTrackComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
