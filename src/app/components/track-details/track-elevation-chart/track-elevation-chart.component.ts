import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import {
  Chart,
  ChartDataset,
  registerables,
  Tick,
  TooltipItem,
  TooltipModel,
} from 'chart.js';
import { CLocation } from 'src/app/classes/clocation';
import { CGeojsonLineStringFeature } from 'src/app/classes/features/cgeojson-line-string-feature';
import {
  TRACK_ELEVATION_CHART_SLOPE_EASY,
  TRACK_ELEVATION_CHART_SLOPE_HARD,
  TRACK_ELEVATION_CHART_SLOPE_MEDIUM,
  TRACK_ELEVATION_CHART_SLOPE_MEDIUM_EASY,
  TRACK_ELEVATION_CHART_SLOPE_MEDIUM_HARD,
  TRACK_ELEVATION_CHART_SURFACE,
} from 'src/app/constants/elevation-chart';
import { MapService } from 'src/app/services/map.service';
import { EGeojsonGeometryTypes } from 'src/app/types/egeojson-geometry-types.enum';
import { ETrackElevationChartSurface } from 'src/app/types/etrack-elevation-chart.enum';
import { ILocation } from 'src/app/types/location';
import { ILineString } from 'src/app/types/model';
import { ITrackElevationChartHoverElements } from 'src/app/types/track-elevation-chart';

@Component({
  selector: 'webmapp-track-elevation-chart',
  templateUrl: './track-elevation-chart.component.html',
  styleUrls: ['./track-elevation-chart.component.scss'],
})
export class TrackElevationChartComponent implements OnInit {
  @ViewChild('chartCanvas') set content(content: ElementRef) {
    this._chartCanvas = content.nativeElement;
  }

  @Input('feature') set feature(value: CGeojsonLineStringFeature) {
    this._feature = value;
    if (this._chart) {
      this._chart.destroy();
    }
    if (this._chartCanvas) {
      // this._setChart();
      setTimeout(() => {
        this._setChart();
      }, 600);
    }
  }

  @Output('hover') hover: EventEmitter<ITrackElevationChartHoverElements> =
    new EventEmitter<ITrackElevationChartHoverElements>();

  public surfaces: Array<{
    id: ETrackElevationChartSurface;
    backgroundColor: string;
  }> = [];
  public _feature: CGeojsonLineStringFeature;
  public slopeValues: Array<[number, number]>;
  public slope: {
    available: boolean;
    selectedValue: number;
    selectedPercentage: number;
  } = {
    available: true,
    selectedValue: undefined,
    selectedPercentage: 0,
  };

  private _chartCanvas: any;
  private _chart: Chart;
  private _chartValues: Array<ILocation>;

  constructor(private _mapService: MapService) {
    Chart.register(...registerables);
  }

  ngOnInit() {
    // setTimeout(() => {
    //   // this._feature = this._statusService.route;
    //   this._setChart();
    // }, 0);
  }

  /**
   * Calculate all the chart values and trigger the chart representation
   */
  private _setChart() {
    if (!!this._chartCanvas && !!this._feature) {
      let surfaceValues: Array<{
        surface: string;
        values: Array<number>;
        locations: Array<ILocation>;
      }> = [];
      const slopeValues: Array<[number, number]> = [];
      const labels: Array<number> = [];
      const steps: number = 100;
      let trackLength: number = 0;
      let currentDistance: number = 0;
      let previousLocation: ILocation;
      let currentLocation: ILocation;
      let maxAlt: number;
      let minAlt: number;
      const usedSurfaces: Array<ETrackElevationChartSurface> = [];

      this._chartValues = [];

      labels.push(0);
      currentLocation = new CLocation(
        this._feature.geometry.coordinates[0][0],
        this._feature.geometry.coordinates[0][1],
        this._feature.geometry.coordinates[0][2]
      );
      this._chartValues.push(currentLocation);
      maxAlt = currentLocation.altitude;
      minAlt = currentLocation.altitude;

      const surface = Object.values(ETrackElevationChartSurface)[0];
      surfaceValues = this._setSurfaceValue(
        surface,
        this._feature.geometry.coordinates[0][2],
        [currentLocation],
        surfaceValues
      );
      if (!usedSurfaces.includes(surface)) {
        usedSurfaces.push(surface);
      }
      slopeValues.push([this._feature.geometry.coordinates[0][2], 0]);

      // Calculate track length and max/min altitude
      for (let i = 1; i < this._feature.geometry.coordinates.length; i++) {
        previousLocation = currentLocation;
        currentLocation = new CLocation(
          this._feature.geometry.coordinates[i][0],
          this._feature.geometry.coordinates[i][1],
          this._feature.geometry.coordinates[i][2]
        );
        trackLength += this._mapService.getDistanceBetweenPoints(
          previousLocation,
          currentLocation
        );

        if (!maxAlt || maxAlt < currentLocation.altitude) {
          maxAlt = currentLocation.altitude;
        }
        if (!minAlt || minAlt > currentLocation.altitude) {
          minAlt = currentLocation.altitude;
        }
      }

      let step: number = 1;
      let locations: Array<ILocation> = [];
      currentLocation = new CLocation(
        this._feature.geometry.coordinates[0][0],
        this._feature.geometry.coordinates[0][1],
        this._feature.geometry.coordinates[0][2]
      );

      // Create the chart datasets
      for (
        let i = 1;
        i < this._feature.geometry.coordinates.length && step <= steps;
        i++
      ) {
        locations.push(currentLocation);
        previousLocation = currentLocation;
        currentLocation = new CLocation(
          this._feature.geometry.coordinates[i][0],
          this._feature.geometry.coordinates[i][1],
          this._feature.geometry.coordinates[i][2]
        );
        const localDistance: number = this._mapService.getDistanceBetweenPoints(
          previousLocation,
          currentLocation
        );
        currentDistance += localDistance;

        while (currentDistance >= (trackLength / steps) * step) {
          const difference: number =
            localDistance - (currentDistance - (trackLength / steps) * step);
          const deltaLongitude: number =
            currentLocation.longitude - previousLocation.longitude;
          const deltaLatitude: number =
            currentLocation.latitude - previousLocation.latitude;
          const deltaAltitude: number =
            currentLocation.altitude - previousLocation.altitude;
          const longitude: number =
            previousLocation.longitude +
            (deltaLongitude * difference) / localDistance;
          const latitude: number =
            previousLocation.latitude +
            (deltaLatitude * difference) / localDistance;
          const altitude: number = Math.round(
            previousLocation.altitude +
              (deltaAltitude * difference) / localDistance
          );
          const currentSurface = Object.values(ETrackElevationChartSurface)[
            Math.round(step / 10) %
              (Object.keys(ETrackElevationChartSurface).length - 2)
          ];
          const slope: number = parseFloat(
            (
              ((altitude -
                this._chartValues[this._chartValues.length - 1].altitude) *
                100) /
              (trackLength / steps)
            ).toPrecision(1)
          );

          const intermediateLocation: ILocation = new CLocation(
            longitude,
            latitude,
            altitude
          );

          this._chartValues.push(intermediateLocation);

          locations.push(intermediateLocation);
          surfaceValues = this._setSurfaceValue(
            currentSurface,
            altitude,
            locations,
            surfaceValues
          );
          locations = [intermediateLocation];
          if (!usedSurfaces.includes(currentSurface)) {
            usedSurfaces.push(currentSurface);
          }
          slopeValues.push([altitude, slope]);

          labels.push(
            parseFloat(((step * trackLength) / (steps * 1000)).toFixed(1))
          );

          step++;
        }
      }

      this.surfaces = [];
      for (const usedSurface of usedSurfaces) {
        this.surfaces.push({
          id: usedSurface,
          backgroundColor:
            TRACK_ELEVATION_CHART_SURFACE[usedSurface].backgroundColor,
        });
      }

      setTimeout(() => {
        this._createChart(
          labels,
          trackLength,
          maxAlt,
          surfaceValues,
          slopeValues
        );
      }, 100);
    }
  }

  /**
   * Set the surface value on a specific surface
   *
   * @param surface the surface type
   * @param value the value
   * @param values the current values
   * @returns
   */
  private _setSurfaceValue(
    surface: string,
    value: number,
    locations: Array<ILocation>,
    values: Array<{
      surface: string;
      values: Array<number>;
      locations: Array<ILocation>;
    }>
  ): Array<{
    surface: string;
    values: Array<number>;
    locations: Array<ILocation>;
  }> {
    const oldSurface: string = values?.[values.length - 1]?.surface;

    if (oldSurface === surface) {
      // Merge the old surface segment with the new one
      values[values.length - 1].values.push(value);
      if (values[values.length - 1].locations.length > 0) {
        values[values.length - 1].locations.splice(-1, 1);
      }
      values[values.length - 1].locations.push(...locations);
    } else {
      //Creare a new surface segment
      const nullElements: Array<any> = [];
      if (values?.[values.length - 1]?.values) {
        nullElements.length = values[values.length - 1].values.length;
        values[values.length - 1].values.push(value);
      }
      values.push({
        surface,
        values: [...nullElements, value],
        locations,
      });
    }

    return values;
  }

  /**
   * Return a chart.js dataset for a surface
   *
   * @param values the chart values
   * @param surface the surface type
   * @returns
   */
  private _getSlopeChartSurfaceDataset(
    values: Array<number>,
    surface: ETrackElevationChartSurface
  ): ChartDataset<'line', any> {
    return {
      fill: true,
      cubicInterpolationMode: 'monotone',
      tension: 0.3,
      backgroundColor:
        'rgb(' + TRACK_ELEVATION_CHART_SURFACE[surface].backgroundColor + ')',
      borderColor: 'rgba(255, 199, 132, 0)',
      pointRadius: 0,
      data: values,
      spanGaps: false,
    };
  }

  /**
   * Return an RGB color for the given slope percentage value
   *
   * @param value the slope percentage value
   * @returns
   */
  private _getSlopeGradientColor(value: number): string {
    let min: [number, number, number];
    let max: [number, number, number];
    let proportion: number = 0;
    const step: number = 15 / 4;

    value = Math.abs(value);

    if (value <= 0) {
      min = TRACK_ELEVATION_CHART_SLOPE_EASY;
      max = TRACK_ELEVATION_CHART_SLOPE_EASY;
    } else if (value < step) {
      min = TRACK_ELEVATION_CHART_SLOPE_EASY;
      max = TRACK_ELEVATION_CHART_SLOPE_MEDIUM_EASY;
      proportion = value / step;
    } else if (value < 2 * step) {
      min = TRACK_ELEVATION_CHART_SLOPE_MEDIUM_EASY;
      max = TRACK_ELEVATION_CHART_SLOPE_MEDIUM;
      proportion = (value - step) / step;
    } else if (value < 3 * step) {
      min = TRACK_ELEVATION_CHART_SLOPE_MEDIUM;
      max = TRACK_ELEVATION_CHART_SLOPE_MEDIUM_HARD;
      proportion = (value - 2 * step) / step;
    } else if (value < 4 * step) {
      min = TRACK_ELEVATION_CHART_SLOPE_MEDIUM_HARD;
      max = TRACK_ELEVATION_CHART_SLOPE_HARD;
      proportion = (value - 3 * step) / step;
    } else {
      min = TRACK_ELEVATION_CHART_SLOPE_HARD;
      max = TRACK_ELEVATION_CHART_SLOPE_HARD;
      proportion = 1;
    }

    const result: [string, string, string] = ['0', '0', '0'];

    result[0] = Math.abs(
      Math.round(min[0] + (max[0] - min[0]) * proportion)
    ).toString(16);
    result[1] = Math.abs(
      Math.round(min[1] + (max[1] - min[1]) * proportion)
    ).toString(16);
    result[2] = Math.abs(
      Math.round(min[2] + (max[2] - min[2]) * proportion)
    ).toString(16);

    return (
      '#' +
      (result[0].length < 2 ? '0' : '') +
      result[0] +
      (result[1].length < 2 ? '0' : '') +
      result[1] +
      (result[2].length < 2 ? '0' : '') +
      result[2]
    );
  }

  /**
   * Return a chart.js dataset for the slope values
   *
   * @param slopeValues the chart slope values as Array<[chartValue, slopePercentage]>
   * @returns
   */
  private _getSlopeChartSlopeDataset(
    slopeValues: Array<[number, number]>
  ): Array<ChartDataset<'line', any>> {
    const values: Array<number> = slopeValues.map((value) => value[0]);
    const slopes: Array<number> = slopeValues.map((value) => value[1]);

    return [
      {
        fill: false,
        cubicInterpolationMode: 'monotone',
        tension: 0.3,
        backgroundColor: 'rgba(0, 0, 0, 0)',
        borderColor: (context) => {
          const chart = context.chart;
          const { ctx, chartArea } = chart;

          if (!chartArea) {
            // This case happens on initial chart load
            return null;
          }

          const gradient = ctx.createLinearGradient(
            chartArea.left,
            0,
            chartArea.right,
            0
          );

          for (const i in slopes) {
            gradient.addColorStop(
              parseInt(i, 10) / slopes.length,
              this._getSlopeGradientColor(slopes[i])
            );
          }

          return gradient;
        },
        borderWidth: 3,
        pointRadius: 0,
        pointHoverBackgroundColor: '#000000',
        pointHoverBorderColor: '#FFFFFF',
        pointHoverRadius: 6,
        pointHoverBorderWidth: 2,
        data: values,
        spanGaps: false,
      },
      {
        fill: false,
        cubicInterpolationMode: 'monotone',
        tension: 0.3,
        borderColor: 'rgba(255, 255, 255, 1)',
        borderWidth: 8,
        pointRadius: 0,
        data: values,
        spanGaps: false,
      },
    ];
  }

  /**
   * Create the chart
   *
   * @param labels the chart labels
   * @param length the track length
   * @param maxAltitude the max altitude value
   * @param surfaceValues the surface values
   * @param slopeValues the slope values
   */
  private _createChart(
    labels: Array<number>,
    length: number,
    maxAltitude: number,
    surfaceValues: Array<{
      surface: string;
      values: Array<number>;
      locations: Array<ILocation>;
    }>,
    slopeValues: Array<[number, number]>
  ) {
    if (this._chartCanvas) {
      const surfaceDatasets: Array<ChartDataset> = [];

      this.slopeValues = slopeValues;

      for (const i in surfaceValues) {
        surfaceDatasets.push(
          this._getSlopeChartSurfaceDataset(
            surfaceValues[i].values,
            surfaceValues[i].surface as ETrackElevationChartSurface
          )
        );
      }

      this._chart = new Chart(this._chartCanvas, {
        type: 'line',
        data: {
          labels,
          datasets: [
            ...this._getSlopeChartSlopeDataset(slopeValues),
            ...surfaceDatasets,
          ],
        },
        options: {
          events: [
            'mousemove',
            'click',
            'touchstart',
            'touchmove',
            'pointermove',
          ],
          layout: {
            padding: {
              top: 40,
            },
          },
          maintainAspectRatio: false,
          hover: {
            intersect: false,
            mode: 'index',
          },
          plugins: {
            legend: {
              display: false,
            },
            tooltip: {
              enabled: true,
              intersect: false,
              mode: 'index',
              cornerRadius: 8,
              caretPadding: 150,
              xAlign: 'center',
              yAlign: 'bottom',
              titleMarginBottom: 0,
              callbacks: {
                title: (items: Array<TooltipItem<'line'>>): string => {
                  let result: string = items[0].raw + ' m';

                  if (
                    typeof slopeValues?.[items[0].dataIndex]?.[1] === 'number'
                  ) {
                    result += ' / ' + slopeValues[items[0].dataIndex][1] + '%';
                  }

                  return result;
                },
                label: (): string => {
                  return undefined;
                },
              },
            },
          },
          scales: {
            y: {
              title: {
                display: false,
              },
              max: maxAltitude,
              ticks: {
                maxTicksLimit: 2,
                maxRotation: 0,
                includeBounds: true,
                // mirror: true,
                z: 10,
                align: 'end',
                callback: (
                  tickValue: number | string,
                  index: number,
                  ticks: Array<Tick>
                ): string => {
                  return tickValue + ' m';
                },
              },
              grid: {
                drawOnChartArea: true,
                drawTicks: false,
                drawBorder: false,
                borderDash: [10, 10],
                color: '#D2D2D2',
              },
            },
            x: {
              title: {
                display: false,
              },
              max: length,
              min: 0,
              ticks: {
                maxTicksLimit: 4,
                maxRotation: 0,
                includeBounds: true,
                callback: (
                  tickValue: number | string,
                  index: number,
                  ticks: Array<Tick>
                ): string => {
                  return labels[index] + ' km';
                },
              },
              grid: {
                color: '#D2D2D2',
                drawOnChartArea: false,
                drawTicks: true,
                drawBorder: true,
                tickLength: 10,
              },
            },
          },
        },
        plugins: [
          {
            id: 'webmappTooltipPlugin',
            beforeTooltipDraw: (chart) => {
              const tooltip: TooltipModel<'line'> = chart.tooltip;

              if (
                (tooltip as any)._active &&
                (tooltip as any)._active.length > 0
              ) {
                const activePoint = (tooltip as any)._active[0];
                const ctx = chart.ctx;
                const x = activePoint.element.x;
                const topY = chart.scales.y.top - 15;
                const bottomY = chart.scales.y.bottom + 10;

                // draw line
                ctx.save();
                ctx.beginPath();
                ctx.moveTo(x, topY);
                ctx.lineTo(x, bottomY);
                ctx.lineWidth = 1;
                ctx.strokeStyle = '#000000';
                ctx.stroke();

                if (
                  (tooltip as any)?._tooltipItems?.[0]?.dataIndex >= 0 &&
                  typeof labels[
                    (tooltip as any)?._tooltipItems?.[0]?.dataIndex
                  ] !== 'undefined'
                ) {
                  const distance: string =
                    labels[(tooltip as any)._tooltipItems[0].dataIndex] + ' km';
                  const measure: TextMetrics = ctx.measureText(distance);
                  const minX: number = Math.max(
                    0,
                    Math.min(chart.width - measure.width, x - measure.width / 2)
                  );
                  const minY: number = bottomY;

                  ctx.fillStyle = '#ffffff';
                  ctx.fillRect(minX - 4, minY, measure.width + 8, 20);
                  ctx.fillStyle = '#000000';
                  ctx.fillText(distance, minX, bottomY + 14);
                }

                ctx.restore();

                this.slope.selectedValue =
                  slopeValues[
                    (tooltip as any)?._tooltipItems?.[0]?.dataIndex
                  ][1];
                this.slope.selectedPercentage =
                  (Math.min(
                    15,
                    Math.max(0, Math.abs(this.slope.selectedValue))
                  ) *
                    100) /
                  15;

                const index: number = (tooltip as any)._tooltipItems[0]
                  .dataIndex;
                let locations: Array<ILocation> = [];
                let surfaceColor: string;

                for (const i in surfaceValues) {
                  if (!!surfaceValues[i].values[index]) {
                    locations = surfaceValues[i].locations;
                    const surface = surfaceValues[i].surface;

                    for (const s of this.surfaces) {
                      if (s.id === surface) {
                        surfaceColor = s.backgroundColor;
                        break;
                      }
                    }
                    break;
                  }
                }

                const coordinates: ILineString = locations.map((location) => {
                  return [location.longitude, location.latitude];
                });
                const surfaceTrack: CGeojsonLineStringFeature =
                  new CGeojsonLineStringFeature({
                    type: EGeojsonGeometryTypes.LINE_STRING,
                    coordinates,
                  });

                surfaceTrack.setProperty('color', surfaceColor);

                this.hover.emit({
                  location:
                    this._chartValues[
                      (tooltip as any)?._tooltipItems?.[0]?.dataIndex
                    ],
                  track: surfaceTrack,
                });
              } else {
                this.slope.selectedValue = undefined;
                this.hover.emit(undefined);
              }
            },
          },
        ],
      });
    }
  }
}
