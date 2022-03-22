/* eslint-disable quote-props */
import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ElasticService {
  private _geohubAppId: number = 4;
  private _params = new HttpParams();

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
    return `https://elastic.sis-te.com/geohub_app_${this._geohubAppId}/_search/`;
  }

  public getSearch(): Observable<any> {
    return this._http.get(this._baseUrl);
  }

  private _baseQuery(search = ''): any {
    return {
      '_source': {
        'excludes': ['geometry'],
      },
      'query': {
        'query_string': {
          'fields': ['name'],
          'query': `*${search}*`,
        },
      },
    };
  }
}
