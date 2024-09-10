import {CGeojsonLineStringFeature} from '../classes/features/cgeojson-line-string-feature';
import {CommunicationService} from './communication.service';
import {ConfigService} from './config.service';
import {Injectable} from '@angular/core';
import {environment} from 'src/environments/environment';
import {map} from 'rxjs/operators';
import { HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class GeohubService {
  private _ecTracks: Array<CGeojsonLineStringFeature>;

  constructor(
    private _configService: ConfigService,
    private _communicationService: CommunicationService,
  ) {
    this._ecTracks = [];
  }

  /**
   * Get an instance of the specified ec track
   *
   * @param id the ec track id
   *
   * @returns
   */
  async getEcTrack(id: string | number): Promise<CGeojsonLineStringFeature> {
    const cacheResult: CGeojsonLineStringFeature = this._ecTracks.find(
      (ecTrack: CGeojsonLineStringFeature) => ecTrack?.properties?.id === id,
    );
    if (cacheResult) {
      return cacheResult;
    }
    if (id > -1) {
      const headers = new HttpHeaders({
        'api-version': 'v2' ,// Aggiungi l'header con la versione dell'API
        'app-id': `${environment.geohubId}` // Aggiungi l'header con l'id dell'app
      });
      const result = await this._communicationService
        .get(`${environment.trackApi}${id}.json`)
        .pipe(
          map((apiResult: CGeojsonLineStringFeature) => {
            const related_pois = (apiResult.properties.related_pois || []).map(p => {
              p.properties.related = true;
              return p;
            });
            const properties = {...apiResult.properties, related_pois};
            return {...apiResult, properties} as any;
          }),
        )
        .toPromise();

      this._ecTracks.push(result);
      if (this._ecTracks.length > 10) {
        this._ecTracks.splice(0, 1);
      }

      return result;
    }
  }

  /**
   * Retrieve the vector layer style from the geohub
   *
   * @returns the API response in a promise
   */
  async getVectorLayerStyle(): Promise<any> {
    return await this._communicationService.get(this._configService.vectorStyleUrl).toPromise();
  }

  async search(searchString: string): Promise<IHIT[]> {
    const result = await this._communicationService
      .get(`${environment.api}/api/ec/track/${searchString}`)
      .pipe(
        map((apiResult: CGeojsonLineStringFeature) => {
          const related_pois = apiResult.properties.related_pois.map(p => {
            p.properties.related = true;
            return p;
          });
          const properties = {...apiResult.properties, related_pois};
          return {...apiResult, properties} as any;
        }),
      )
      .toPromise();
    return result;
  }
}
