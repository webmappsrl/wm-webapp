/**
 * Provide some utility function to who need them
 */

import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class UtilsService {
  constructor() {}

  /**
   * Format the given distance to the standard format including unit
   *
   * @param distance the distance in km
   */
  formatDistance(distance: number): string {
    const result: string = Math.round(distance * 10) / 10 + ' km';

    return result.replace('.', ',');
  }

  /**
   * Format a duration from the standard geohub value
   *
   * @param time the geohub value
   *
   * @returns the formatted string
   */
  formatDuration(time: number): string {
    const hours: number = Math.floor(time / 60);
    const minutes: number = Math.round(time % 60);
    const res: string =
      hours + ':' + (minutes > 9 ? minutes : '0' + minutes) + ' h';

    return res;
  }

  /**
   * Format the given elevation to the standard formatting including unit
   *
   * @param ascent the elevation value in meters
   */
  formatElevation(ascent: number): string {
    const result: string = Math.round(ascent) + ' m';

    return result;
  }

  /**
   * Format the given ascent to the standard formatting including unit
   *
   * @param ascent the ascent as number
   */
  formatAscent(ascent: number): string {
    const result: string = Math.round(ascent) + ' m';

    return result;
  }

  /**
   * Format the given descent to the standard format including unit
   *
   * @param descent the descent as number
   */
  formatDescent(descent: number): string {
    return this.formatAscent(descent);
  }
}
