import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from '../../environments/environment';
import {IConf} from './model';

@Injectable({
  providedIn: 'root',
})
export class ConfService {
  private _apiConf = environment.confRoot;

  constructor(private _http: HttpClient) {}

  getConf(): Observable<IConf> {
    return this._http.get<IConf>(`${this._apiConf}/config.json`);
  }
}
