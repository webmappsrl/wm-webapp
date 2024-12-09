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
import {BehaviorSubject, EMPTY, from, Observable} from 'rxjs';
import {LineString} from 'geojson';
import {confGeohubId, confTRACKFORMS} from '@wm-core/store/conf/conf.selector';
import {Store} from '@ngrx/store';
import {catchError, switchMap, take, map} from 'rxjs/operators';
import {DeviceService} from '@wm-core/services/device.service';
import {AlertController} from '@ionic/angular';
import {saveDrawTrackAsUgc} from '@wm-core/store/auth/auth.selectors';
import {generateUUID, saveUgcTrack} from '@wm-core/utils/localForage';
import {WmFeature} from '@wm-types/feature';
import {UntypedFormGroup} from '@angular/forms';
import {syncUgcTracks} from '@wm-core/store/features/ugc/ugc.actions';
import {LangService} from '@wm-core/localization/lang.service';

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

  confTRACKFORMS$: Observable<any[]> = this._store.select(confTRACKFORMS);
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
    private _langSvc: LangService,
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
    const newName = prompt(`${this._langSvc.instant('Inserisci il nuovo nome')}:`, savedTrack?.properties?.name);
    if (newName) {
      savedTrack.properties.name = newName;
      this.saveCustomTrack();
    }
  }

  saveCustomTrack(): void {
    this.saveDrawTrackAsUgc$.pipe(take(1)).subscribe(saveAsUgc => {
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
      this.geohubId$
        .pipe(
          take(1),
          switchMap(geohubId =>
            from(this._deviceSvc.getInfo()).pipe(
              map(device => {
                const feature: WmFeature<LineString> = this.track$.value;
                const drawTrackProperties = feature?.properties;

                const properties = {
                  name: this.fg.value.title,
                  form: this.fg.value,
                  uuid: generateUUID(),
                  app_id: `${geohubId}`,
                  drawTrackProperties,
                  device,
                };

                feature.properties = properties;
                return feature;
              })
            )
          ),
          switchMap(feature => saveUgcTrack(feature)),
          switchMap(_ => {
            this.track$.next(null);
            this.reloadEvt.emit();
            return this._alertCtrl
              .create({
                message: `${this._langSvc.instant('Il percorso è stato salvato correttamente')}!`,
                buttons: ['OK'],
              })
          }),
          switchMap(alert => alert.present()),
          catchError(_ => {
            this._alertCtrl
              .create({
                header: this._langSvc.instant('Errore'),
                message: `${this._langSvc.instant('Si è verificato un errore durante il salvataggio del percorso. Riprova')}!`,
                buttons: ['OK'],
              })
              .then(alert => alert.present());
            return EMPTY;
          }),
        )
        .subscribe(() => this._store.dispatch(syncUgcTracks()));
    }
  }

  private _saveCustomTrackLocally(): void {
    const savedTracks = this.savedTracks$.value;
    if (this.track$.value != null) {
      if (!this.track$.value.properties.name || this.track$.value.properties.name.trim() === '') {
        while (this.track$.value.properties.name == '') {
          this.track$.value.properties.name = prompt(
            `${this._langSvc.instant('Per favore, inserisci un nome per il percorso')}.`,
          );
        }
      }
      if (this.track$.value.properties.name) {
        savedTracks.push(this.track$.value);
      }
    }
    localStorage.setItem('wm-saved-tracks', JSON.stringify(savedTracks));
    this.savedTracks$.next(savedTracks);
    this.track$.next(null);
    this.reloadEvt.emit();
  }
}
