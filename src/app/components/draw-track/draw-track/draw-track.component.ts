import GeoJsonToGpx from '@dwayneparton/geojson-to-gpx';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  ViewEncapsulation,
} from '@angular/core';

import GeoJSON from 'ol/format/GeoJSON';
import Map from 'ol/Map';

import tokml from 'geojson-to-kml';
import {BehaviorSubject} from 'rxjs';
import { CGeojsonLineStringFeature } from 'wm-core/classes/features/cgeojson-line-string-feature';
import { Feature } from 'ol';
import { ITrack } from 'wm-core/types/track';
import { SaveService } from 'wm-core/services/save.service';

@Component({
  selector: 'wm-draw-track',
  templateUrl: './draw-track.component.html',
  styleUrls: ['./draw-track.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class DrawTrackComponent {
  @Input() set track(t: any) {
    this.track$.next(t);
  }

  @Input() map: Map | any;
  @Output() reloadEvt: EventEmitter<void> = new EventEmitter<void>();

  savedTracks$: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
  selectedTrackIdx: number = -1;
  track$: BehaviorSubject<Feature> = new BehaviorSubject<Feature>(null);

  constructor(private _saveSvc: SaveService) {
    this._initSavedTracks();
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
    const options = {
      metadata: {
        name: feature.properties.name,
        ...feature.properties,
      },
    };
    const gpx = GeoJsonToGpx(feature, options);
    const xmlGpx = new XMLSerializer().serializeToString(gpx);

    const name = `${feature.properties.name || 'noname'}.gpx`;
    this._downloadFile(name, xmlGpx);
  }

  downloadKml(feature): void {
    const kml = tokml(feature);
    const name = `${feature.properties.name || 'noname'}.kml`;
    this._downloadFile(name, kml);
  }

  editCustomTrackName(savedTrack: any): void {
    const newName = prompt('Inserisci il nuovo nome:', savedTrack.properties.name);
    if (newName) {
      savedTrack.properties.name = newName;
      this.saveCustomTrack();
    }
  }

  async saveCustomTrack(): Promise<void> {

    if (this.track$.value != null) {
      const properties = (this.track$.value as any).properties;
      if (!properties.name || properties.name.trim() === '') {
        while (!properties.name) {
          properties.name = prompt(
            'Per favore, inserisci un nome per il percorso.',
          );
        }
      }
      if (properties.name) {
        const geojson:CGeojsonLineStringFeature = Object.assign(new CGeojsonLineStringFeature(), (this.track$.value as any).geometry) ?? null;
        const trackData = {
          ...properties,
          activity: 'hiking',
          photoKeys: null,
          photos: [],
          title: properties.name,
        }
        const metadata = {
          ...geojson.properties,
          ...{date: new Date(), activity: trackData.activity},
        };
        const track: ITrack = Object.assign(
          {
            geojson,
            date: new Date(),
            metadata,
          },
          trackData,
          {metadata},
        );
        const saved = await this._saveSvc.saveTrack(track);
        console.log(saved);
      }
    }

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
