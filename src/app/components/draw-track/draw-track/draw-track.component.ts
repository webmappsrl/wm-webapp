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
import {BehaviorSubject, Observable} from 'rxjs';
import {LineString} from 'geojson';
import {confGeohubId, confPOIFORMS} from 'wm-core/store/conf/conf.selector';
import {Store} from '@ngrx/store';
import {catchError, switchMap, take, tap} from 'rxjs/operators';
import { DeviceService } from 'wm-core/services/device.service';
import { AlertController } from '@ionic/angular';
import { saveDrawTrackAsUgc } from 'wm-core/store/auth/auth.selectors';
import { syncUgc } from 'wm-core/store/auth/auth.actions';
import { generateUUID, saveUgcTrack } from 'wm-core/utils/localForage';
import { WmFeature } from '@wm-types/feature';
import { UntypedFormGroup } from '@angular/forms';

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
  @Output() reloadUgcEvt: EventEmitter<void> = new EventEmitter<void>();

  confPOIFORMS$: Observable<any[]> = this._store.select(confPOIFORMS);
  fg: UntypedFormGroup;
  geohubId$ = this._store.select(confGeohubId);
  saveDrawTrackAsUgc$: Observable<boolean> = this._store.select(saveDrawTrackAsUgc);
  savedTracks$: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
  selectedTrackIdx: number = -1;
  track$: BehaviorSubject<WmFeature<LineString>> = new BehaviorSubject<WmFeature<LineString>>(null);

  constructor(
    private _store: Store,
    private _deviceSvc: DeviceService,
    private _alertCtrl: AlertController,
  ) {
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

  saveCustomTrack(): void {
    this.saveDrawTrackAsUgc$.pipe(
      take(1)
    ).subscribe(saveAsUgc => {
      if (saveAsUgc) {
        this._saveCustomTrackAsUgc();
      } else {
        this._saveCustomTrackLocally();
      }
    });
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

  private _saveCustomTrackAsUgc(): void {
    if (this.track$.value != null) {
      this.geohubId$.pipe(
        take(1),
        switchMap(geohubId => {
          if (this.fg.invalid) {
            return;
          }
          const feature: WmFeature<LineString> = this.track$.value;
          let drawTrakproperties = feature.properties;

          const properties = {
            drawTrackProperties: drawTrakproperties,
            name: this.fg.value.title,
            form: this.fg.value,
            uuid: generateUUID(),
            device: {os: 'web'},
            app_id: `${geohubId}`,
          };

          feature.properties = properties;
          return saveUgcTrack(feature)
        }),
        tap(_ => {
          this.track$.next(null);
          this._store.dispatch(syncUgc());
          this.reloadUgcEvt.emit();
        }),
        catchError(_ => {
          this._alertCtrl.create({
            header: 'Errore',
            message: 'Si è verificato un errore durante il salvataggio del percorso.',
            buttons: ['OK']
          }).then(alert => alert.present());
          return([]);
        })
      ).subscribe();
    }
  }

  private _saveCustomTrackLocally(): void {
    if (this.track$.value != null) {
      const savedTracks = this.savedTracks$.value;
      savedTracks.push(this.track$.value);
      this.savedTracks$.next(savedTracks);
      localStorage.setItem('wm-saved-tracks', JSON.stringify(savedTracks));
      this.track$.next(null);
      this.reloadEvt.emit();
    }
  }
}
