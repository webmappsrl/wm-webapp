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
import {HttpClient} from '@angular/common/http';
import Map from 'ol/Map';
import toGpx from 'togpx';
import tokml from 'geojson-to-kml';

@Component({
  selector: 'wm-draw-track',
  templateUrl: './draw-track.component.html',
  styleUrls: ['./draw-track.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class DrawTrackComponent {
  @Input() map: Map;
  @Output() reloadEvt: EventEmitter<void> = new EventEmitter<void>();

  savedTracks$: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
  track$: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  constructor(private _http: HttpClient) {
    this._initSavedTracks();
  }

  @Input() set track(t: any) {
    this.track$.next(t);
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

  deleteCustomTrack(id: number): void {
    const savedTracks = this.savedTracks$.value;
    savedTracks.splice(id, 1);
    this.savedTracks$.next(savedTracks);
    this.saveCustomTrack();
  }

  downloadGeojson(feature): void {
    const geojson = JSON.stringify(feature);
    const name = `${feature.properties.name || 'noname'}.geojson`;
    this._downloadFile(name, geojson);
  }

  downloadGpx(feature): void {
    const gpx = toGpx(feature);
    const name = `${feature.properties.name || 'noname'}.gpx`;
    this._downloadFile(name, gpx);
  }

  downloadKml(feature): void {
    const kml = tokml(feature);
    const name = `${feature.properties.name || 'noname'}.kml`;
    this._downloadFile(name, kml);
  }

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

  private _downloadFile(name, body): void {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(body));
    element.setAttribute('download', name);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();
    document.body.removeChild(element);
  }

  private _initSavedTracks(): void {
    const stringedLocalSavedTracks = localStorage.getItem('wm-saved-tracks');
    const localSavedTracks = JSON.parse(stringedLocalSavedTracks);
    if (localSavedTracks != null) {
      this.savedTracks$.next(localSavedTracks);
    }
  }
}