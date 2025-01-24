import GeoJsonToGpx from '@dwayneparton/geojson-to-gpx';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Output,
  ViewEncapsulation,
} from '@angular/core';

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
import {WmFeature, WmProperties} from '@wm-types/feature';
import {UntypedFormGroup} from '@angular/forms';
import {syncUgcTracks} from '@wm-core/store/features/ugc/ugc.actions';
import {LangService} from '@wm-core/localization/lang.service';
import {currentCustomTrack} from '@wm-core/store/features/ugc/ugc.selector';
import {UgcService} from '@wm-core/store/features/ugc/ugc.service';

@Component({
  selector: 'wm-draw-track',
  templateUrl: './draw-track.component.html',
  styleUrls: ['./draw-track.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class DrawTrackComponent {
  @Output() centerCustomTrackEvt: EventEmitter<void> = new EventEmitter<void>();
  @Output() reloadEvt: EventEmitter<void> = new EventEmitter<void>();

  appID$ = this._store.select(confGeohubId);
  confTRACKFORMS$: Observable<any[]> = this._store.select(confTRACKFORMS);
  currentCustomTrack$: Observable<WmFeature<LineString>> = this._store.select(currentCustomTrack);
  fg: UntypedFormGroup;
  name: string = '';
  saveDrawTrackAsUgc$: Observable<boolean> = this._store.select(saveDrawTrackAsUgc);
  selectedTrackIdx: number = -1;
  track$: BehaviorSubject<WmFeature<LineString>> = new BehaviorSubject<WmFeature<LineString>>(null);

  constructor(
    private _store: Store,
    private _deviceSvc: DeviceService,
    private _alertCtrl: AlertController,
    private _langSvc: LangService,
    private _ugcSvc: UgcService,
  ) {}

  centerCustomTrack(feature: any): void {
    this.centerCustomTrackEvt.emit();
  }

  deleteCustomTrack(id: number): void {
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
    const newName = prompt(
      `${this._langSvc.instant('Inserisci il nuovo nome')}:`,
      savedTrack?.properties?.name,
    );
    if (newName) {
      savedTrack.properties.name = newName;
      this.saveCustomTrack();
    }
  }

  saveCustomTrack(): void {
    this._saveCustomTrackAsUgc();
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

  private _saveCustomTrackAsUgc(): void {
    this.appID$
      .pipe(
        take(1),
        switchMap(geohubId =>
          this.currentCustomTrack$.pipe(
            take(1),
            switchMap(customTrack =>
              from(this._deviceSvc.getInfo()).pipe(
                map(device => {
                  const feature: WmFeature<LineString> = {...customTrack};
                  const drawTrackProperties = feature?.properties;
                  const dateNow = new Date();
                  const value = this.fg ? this.fg.value : undefined;
                  let name = value?.title ?? this.name;
                  while (name == null || name == '') {
                    name = prompt(
                      `${this._langSvc.instant('Inserisci il nome del percorso')}:`,
                      this.name,
                    );
                  }
                  const properties: WmProperties = {
                    name,
                    form: value ?? undefined,
                    uuid: generateUUID(),
                    app_id: `${geohubId}`,
                    createdAt: dateNow,
                    updatedAt: dateNow,
                    drawTrackProperties,
                    device,
                  };

                  feature.properties = properties;
                  return feature;
                }),
              ),
            ),
          ),
        ),
        switchMap(feature => saveUgcTrack(feature)),
        switchMap(_ => {
          this.track$.next(null);
          this.reloadEvt.emit();
          return this._alertCtrl.create({
            message: `${this._langSvc.instant('Il percorso è stato salvato correttamente')}!`,
            buttons: ['OK'],
          });
        }),
        switchMap(alert => alert.present()),
        catchError(_ => {
          this._alertCtrl
            .create({
              header: this._langSvc.instant('Errore'),
              message: `${this._langSvc.instant(
                'Si è verificato un errore durante il salvataggio del percorso. Riprova',
              )}!`,
              buttons: ['OK'],
            })
            .then(alert => alert.present());
          return EMPTY;
        }),
      )
      .subscribe(() => this._ugcSvc.syncUgc());
  }
}
