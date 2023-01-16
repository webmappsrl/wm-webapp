import {HttpClient, HttpParams} from '@angular/common/http';

/* eslint-disable quote-props */
import {Injectable} from '@angular/core';
import {Observable, of} from 'rxjs';
import {environment} from 'src/environments/environment';
// const baseUrl = 'https://elastic-passtrough.herokuapp.com/search';
const baseUrl = 'https://elastic-json.webmapp.it/search';
@Injectable({
  providedIn: 'root',
})
export class ElasticService {
  private _geohubAppId: number = environment.geohubId;

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

  public getALL(): Observable<IELASTIC> {
    return this._http.request('get', this._baseUrl);
  }

  public getLayerTracks(layer: number, inputTyped: string): Observable<IELASTIC> {
    let query = this._baseUrl;
    if (layer == null && inputTyped == '') {
      return of([]);
    }
    if (inputTyped != null) {
      query = `${query}&query=${inputTyped}`;
    }

    if (layer != null) {
      query = `${query}&layer=${layer}`;
    }

    return this._http.request('get', query);
  }

  public getSearch(inputTyped: string): Observable<IELASTIC> {
    if (inputTyped == null || inputTyped === '') {
      return of([]);
    }
    return this._http.request(
      'get',
      inputTyped ? `${this._baseUrl}&query=${inputTyped}` : this._baseUrl,
    );
  }
}
