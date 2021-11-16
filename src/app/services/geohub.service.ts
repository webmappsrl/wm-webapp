import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { CGeojsonLineStringFeature } from '../classes/features/cgeojson-line-string-feature';
import { GEOHUB_DOMAIN, GEOHUB_PROTOCOL } from '../constants/geohub';
import { CommunicationService } from './communication.service';

@Injectable({
  providedIn: 'root',
})
export class GeohubService {
  private _ecTracks: Array<CGeojsonLineStringFeature>;
  constructor(private _communicationService: CommunicationService) {
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
      (ecTrack: CGeojsonLineStringFeature) => ecTrack?.properties?.id === id
    );
    if (cacheResult) {
      return cacheResult;
    }

    const result = await this._communicationService
      .get(`${GEOHUB_PROTOCOL}://${GEOHUB_DOMAIN}/api/ec/track/${id}`)
      .pipe(
        map((apiResult: CGeojsonLineStringFeature) => {
          return apiResult;
        })
      )
      .toPromise();

    this._ecTracks.push(result);
    if (this._ecTracks.length > 10) {
      this._ecTracks.splice(0, 1);
    }

    return result;
  }
}
