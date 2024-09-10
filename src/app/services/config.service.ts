import {Injectable} from '@angular/core';
import {environment} from 'src/environments/environment';
import { hostToGeohubAppId } from 'wm-core/store/api/api.service';
@Injectable({
  providedIn: 'root',
})
export class ConfigService {
  private _geohubAppId: number;

  public get configUrl(): string {
    return `${environment.awsApi}/config/${this._geohubAppId}.json`;
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
    console.log(hostToGeohubAppId);
    if (hostname.indexOf('localhost') < 0) {
      const matchedHost = Object.keys(hostToGeohubAppId).find((host) =>
        hostname.includes(host)
      );
    
      if (matchedHost) {
        this._geohubAppId = hostToGeohubAppId[matchedHost];
      } else {
        const newGeohubId = parseInt(hostname.split('.')[0], 10);
        if (!Number.isNaN(newGeohubId)) {
          this._geohubAppId = newGeohubId;
        }
      }
    }
  }
}
