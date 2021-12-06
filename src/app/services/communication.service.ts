/**
 * Communication Service
 *
 * It provides all the functions to communicate using http
 *
 * */

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CommunicationService {
  constructor(private _http: HttpClient) {}

  /**
   * Perform a GET request and get the result
   *
   * @param url the request url
   * @param options the request options
   *
   * @returns
   */
  get(url: string, options?: any): Observable<any> {
    return this._http.get(url, options);
  }

  /**
   * Perform a request using POST and get the result
   *
   * @param url the request url
   * @param body the request body
   * @param options the request options
   *
   * @returns
   */
  post(url: string, body: any, options?: any): Observable<any> {
    return this._http.post(url, body, options);
  }
}
