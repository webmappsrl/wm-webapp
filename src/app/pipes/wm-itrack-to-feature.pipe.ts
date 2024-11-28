import {Pipe, PipeTransform} from '@angular/core';
import {Feature} from 'geojson';
import {ITrack} from '@wm-core/types/track';

@Pipe({
  name: 'iTrackToFeature',
})
export class WmITrackToFeaturePipe implements PipeTransform {
  transform(track: ITrack): Feature | null {
    if (!track) return null;

    return {
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: (track.geojson as any).coordinates as number[][],
      },
      properties: {
        id: track.key,
        name: track.title,
        description: track.description,
        photos: track.photos,
      },
    };
  }
}
