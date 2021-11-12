import { Injectable } from '@angular/core';
import { Coordinate } from 'ol/coordinate';
import { Extent } from 'ol/extent';
import { transform, transformExtent } from 'ol/proj';

@Injectable({
  providedIn: 'root',
})
export class MapService {
  constructor() {}

  /**
   * Transform a set of EPSG:3857 coordinates in [lon, lat](EPSG:4326)
   *
   * @param coordinates the EPSG:3857 coordinates
   *
   * @returns the coordinates [lon, lat](EPSG:4326)
   */
  coordsToLonLat(coordinates: Coordinate): Coordinate {
    return transform(coordinates, 'EPSG:3857', 'EPSG:4326');
  }

  /**
   * Transform a set of [lon, lat](EPSG:4326) coordinates in EPSG:3857
   *
   * @param coordinates the [lon, lat](EPSG:4326) coordinates
   *
   * @returns the coordinates [lon, lat](EPSG:4326)
   */
  coordsFromLonLat(coordinates: Coordinate): Coordinate {
    return transform(coordinates, 'EPSG:4326', 'EPSG:3857');
  }

  /**
   * Transform a set of EPSG:3857 extent in [minLon, minLat, maxLon, maxLat](EPSG:4326)
   *
   * @param extent the EPSG:3857 extent
   *
   * @returns the extent [minLon, minLat, maxLon, maxLat](EPSG:4326)
   */
  extentToLonLat(extent: Extent): Extent {
    return transformExtent(extent, 'EPSG:3857', 'EPSG:4326');
  }

  /**
   * Transform a set of [minLon, minLat, maxLon, maxLat](EPSG:4326) coordinates in EPSG:3857
   *
   * @param extent the [minLon, minLat, maxLon, maxLat](EPSG:4326) extent
   *
   * @returns the extent [minLon, minLat, maxLon, maxLat](EPSG:4326)
   */
  extentFromLonLat(extent: Extent): Extent {
    return transformExtent(extent, 'EPSG:4326', 'EPSG:3857');
  }
}
