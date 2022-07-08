import {Injectable} from '@angular/core';
import {environment} from 'src/environments/environment';
import {GEOHUB_DOMAIN, GEOHUB_PROTOCOL} from '../constants/geohub';
import {GeohubService} from './geohub.service';

@Injectable({
  providedIn: 'root',
})
export class ConfigService {
  private _geohubAppId: number;

  constructor() {
    const hostname: string = window.location.hostname;
    if (hostname.indexOf('localhost') >= 0) {
      this._geohubAppId = environment.geohubId;
    } else {
      this._geohubAppId = parseInt(hostname.split('.')[0], 10);
      if (Number.isNaN(this._geohubAppId)) {
        this._geohubAppId = environment.geohubId;
      }
    }
  }

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
    return `${GEOHUB_PROTOCOL}://${GEOHUB_DOMAIN}/api/app/webapp/${this._geohubAppId}/`;
  }
}
