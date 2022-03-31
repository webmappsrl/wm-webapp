/* eslint-disable quote-props */
import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
const baseUrl = 'https://elastic-passtrough.herokuapp.com/search';
@Injectable({
  providedIn: 'root',
})
export class ElasticService {
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

  private get _baseUrl(): string {
    return this._geohubAppId ? `${baseUrl}/?id=${this._geohubAppId}` : baseUrl;
  }

  public getSearch(inputTyped: string): Observable<IELASTIC> {
    return this._http.request(
      'get',
      inputTyped ? `${this._baseUrl}&query=${inputTyped}` : this._baseUrl,
    );
  }
}
