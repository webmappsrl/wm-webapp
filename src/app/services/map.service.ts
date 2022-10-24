import {transform, transformExtent} from 'ol/proj';

import {Coordinate} from 'ol/coordinate';
import {Extent} from 'ol/extent';
import {ILocation} from '../types/location';
import {Injectable} from '@angular/core';

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

  /**
   * Return the distance in meters between two locations
   *
   * @param point1 the first location
   * @param point2 the second location
   */
  distanceBetweenPoints(point1: ILocation, point2: ILocation): number {
    const earthRadius: number = 6371e3;
    const lat1: number = (point1.latitude * Math.PI) / 180;
    const lat2: number = (point2.latitude * Math.PI) / 180;
    const lon1: number = (point1.longitude * Math.PI) / 180;
    const lon2: number = (point2.longitude * Math.PI) / 180;
    const dlat: number = lat2 - lat1;
    const dlon: number = lon2 - lon1;

    const a: number =
      Math.sin(dlat / 2) * Math.sin(dlat / 2) +
      Math.cos(lat1) * Math.cos(lat2) * Math.sin(dlon / 2) * Math.sin(dlon / 2);
    const c: number = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return earthRadius * c;
  }
}
