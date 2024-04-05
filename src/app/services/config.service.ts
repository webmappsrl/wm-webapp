import {GeohubService} from './geohub.service';
import {Injectable} from '@angular/core';
import {environment} from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ConfigService {
  private _geohubAppId: number;

  public get configUrl(): string {
    return `${this._geohubApiBaseUrl}config`;
  }

  public get geohubAppId(): number {
    return this._geohubAppId;
  }

  public get vectorStyleUrl(): string {
    return `${this._geohubApiBaseUrl}vector_style`;
  }

  private get _geohubApiBaseUrl(): string {
    return `${environment.api}/api/${this._geohubAppId}/`;
  }

  constructor() {
    const hostname: string = window.location.hostname;
    if (hostname.indexOf('localhost') < 0) {
      if (hostname.indexOf('sentieri.caiparma') > -1) {
        this._geohubAppId = 33;
      } else if (hostname.indexOf('motomappa.motoabbigliament') > -1) {
        this._geohubAppId = 53;
      } else if (hostname.indexOf('maps.parcoforestecasentinesi.it') > -1) {
        this._geohubAppId = 49;
      } else {
        const newGeohubId = parseInt(hostname.split('.')[0], 10);
        if (!Number.isNaN(newGeohubId)) {
          this._geohubAppId = newGeohubId;
        }
      }
    }
  }
}
