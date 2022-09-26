import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  ViewEncapsulation,
} from '@angular/core';

import {BehaviorSubject} from 'rxjs';
import GeoJSON from 'ol/format/GeoJSON';
import Map from 'ol/Map';

@Component({
  selector: 'wm-draw-track',
  templateUrl: './draw-track.component.html',
  styleUrls: ['./draw-track.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class DrawTrackComponent {
  track$: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  savedTracks$: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
  constructor() {
    this._initSavedTracks();
  }
  @Input() set track(t: any) {
    this.track$.next(t);
  }
  @Input() map: Map;
  @Output() reloadEvt: EventEmitter<void> = new EventEmitter<void>();
  saveCustomTrack(): void {
    const savedTracks = this.savedTracks$.value;
    if (this.track$.value != null) {
      savedTracks.push(this.track$.value);
    }
    localStorage.setItem('wm-saved-tracks', JSON.stringify(savedTracks));
    this.savedTracks$.next(savedTracks);
    this.track$.next(null);
    this.reloadEvt.emit();
  }
  deleteCustomTrack(id: number): void {
    const savedTracks = this.savedTracks$.value;
    savedTracks.splice(id, 1);
    this.savedTracks$.next(savedTracks);
    this.saveCustomTrack();
  }
  private _initSavedTracks(): void {
    const stringedLocalSavedTracks = localStorage.getItem('wm-saved-tracks');
    const localSavedTracks = JSON.parse(stringedLocalSavedTracks);
    if (localSavedTracks != null) {
      this.savedTracks$.next(localSavedTracks);
    }
  }
  centerCustomTrack(feature: any): void {
    const polygon = new GeoJSON({
      featureProjection: 'EPSG:3857',
    }).readFeature(feature.geometry);
    this.map.getView().fit(polygon.getGeometry().getExtent(), {
      duration: 500,
      maxZoom: this.map.getView().getZoom(),
    });
  }
}
