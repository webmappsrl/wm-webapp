import {GeohubService} from './geohub.service';
import {Injectable} from '@angular/core';
import {environment} from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ConfigService {
  private _geohubAppId: number;
  private _hostToGeohubAppId: { [key: string]: number } = {
    'sentieri.caiparma': 33,
    'motomappa.motoabbigliament': 53,
    'maps.parcoforestecasentinesi': 49,
    'maps.parcopan': 63,
    'maps.acquasorgente.cai': 58,
    'maps.caipontedera': 59,
    'maps.parcapuane': 62,
  };

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
    return `${environment.api}/api/app/webapp/${this._geohubAppId}/`;
  }

  constructor() {
    const hostname: string = window.location.hostname;
    if (hostname.indexOf('localhost') < 0) {
      const matchedHost = Object.keys(this._hostToGeohubAppId).find((host) =>
        hostname.includes(host)
      );
    
      if (matchedHost) {
        this._geohubAppId = this._hostToGeohubAppId[matchedHost];
      } else {
        const newGeohubId = parseInt(hostname.split('.')[0], 10);
        if (!Number.isNaN(newGeohubId)) {
          this._geohubAppId = newGeohubId;
        }
      }
    }
  }
}
