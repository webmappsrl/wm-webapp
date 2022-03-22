import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {GEOHUB_DOMAIN, GEOHUB_PROTOCOL} from '../../constants/geohub';

@Injectable({
  providedIn: 'root',
})
export class ConfService {
  private _geohubAppId: number = 4;

  constructor(private _http: HttpClient) {
    const hostname: string = window.location.hostname;
    if (hostname.indexOf('localhost') < 0) {
      const newGeohubId = parseInt(hostname.split('.')[0], 10);
      if (!Number.isNaN(newGeohubId)) {
        this._geohubAppId = newGeohubId;
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
    return `${GEOHUB_PROTOCOL}://${GEOHUB_DOMAIN}/api/app/webmapp/${this._geohubAppId}/`;
  }

  public getConf(): Observable<ICONF> {
    return this._http.get<ICONF>(`${this._geohubApiBaseUrl}config.json`);
  }
}
