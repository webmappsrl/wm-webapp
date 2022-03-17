import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ConfService {
  private _apiConf = environment.confRoot;

  constructor(private _http: HttpClient) {}

  getConf(): Observable<ICONF> {
    return this._http.get<ICONF>(`${this._apiConf}/config.json`);
  }
}
