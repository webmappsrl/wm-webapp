import {Directive, Input, OnChanges, SimpleChanges} from '@angular/core';
import Feature from 'ol/Feature';
import Geometry from 'ol/geom/Geometry';
import Point from 'ol/geom/Point';
import VectorLayer from 'ol/layer/Vector';
import Map from 'ol/Map';
import GeoJSON from 'ol/format/GeoJSON';
import {fromLonLat, transform} from 'ol/proj';
import VectorSource from 'ol/source/Vector';
import Icon from 'ol/style/Icon';
import FillStyle from 'ol/style/Fill';
import Style from 'ol/style/Style';
import Stroke from 'ol/style/Stroke';
import StrokeStyle from 'ol/style/Stroke';
import {FitOptions} from 'ol/View';
import {endIconHtml, startIconHtml} from './icons';
import {ITrackElevationChartHoverElements} from 'src/app/types/track-elevation-chart';
import {ILocation} from 'src/app/types/location';
import {CGeojsonLineStringFeature} from 'src/app/classes/features/cgeojson-line-string-feature';
import LineString from 'ol/geom/LineString';
import CircleStyle from 'ol/style/Circle';
import {ILineString} from 'src/app/types/model';
import {Coordinate} from 'ol/coordinate';
import {FLAG_TRACK_ZINDEX, POINTER_TRACK_ZINDEX, SELECTED_TRACK_ZINDEX} from './zIndex';
@Directive({
  selector: '[wmMapTrack]',
})
export class WmMapTrackDirective implements OnChanges {
  private _elevationChartLayer: VectorLayer;
  private _elevationChartPoint: Feature<Point>;
  private _elevationChartSource: VectorSource;
  private _elevationChartTrack: Feature<LineString>;
  private _endFeature: Feature<Geometry>;
  private _initTrack = false;
  private _startEndLayer: VectorLayer;
  private _startFeature: Feature<Geometry>;
  private _trackFeatures: Feature<Geometry>[];
  private _trackLayer: VectorLayer;

  @Input() conf: IMAP;
  @Input() map: Map;
  @Input() track;
  @Input() trackElevationChartElements: ITrackElevationChartHoverElements;

  drawTrack(trackgeojson: any): void {
    const geojson: any = this.getGeoJson(trackgeojson);
    this._trackFeatures = new GeoJSON({
      featureProjection: 'EPSG:3857',
    }).readFeatures(geojson);
    this._trackLayer = new VectorLayer({
      source: new VectorSource({
        format: new GeoJSON(),
        features: this._trackFeatures,
      }),
      style: () => {
        return this._getLineStyle('#caaf15');
      },
      updateWhileAnimating: true,
      updateWhileInteracting: true,
      zIndex: SELECTED_TRACK_ZINDEX,
    });

    this.map.addLayer(this._trackLayer);
  }

  ngOnChanges(changes: SimpleChanges): void {
    const resetCondition =
      (changes['track'] &&
        changes['track'].previousValue != null &&
        changes['track'].currentValue != null &&
        changes['track'].previousValue.properties.id !=
          changes['track'].currentValue.properties.id) ??
      false;
    if (this.track == null || this.map == null || resetCondition) {
      this._resetView();
      this._initTrack = false;
    }
    if (this.track != null && this.map != null && this._initTrack === false) {
      this._init();
      this._initTrack = true;
    }
    if (this.track != null && this.map != null && this.trackElevationChartElements != null) {
      this._drawTemporaryLocationFeature(
        this.trackElevationChartElements?.location,
        this.trackElevationChartElements?.track,
      );
    }
  }

  /**
   * Transform a set of [lon, lat](EPSG:4326) coordinates in EPSG:3857
   *
   * @param coordinates the [lon, lat](EPSG:4326) coordinates
   *
   * @returns the coordinates [lon, lat](EPSG:4326)
   */
  private _coordsFromLonLat(coordinates: Coordinate): Coordinate {
    return transform(coordinates, 'EPSG:4326', 'EPSG:3857');
  }

  private _createFeature(iconHtml: string, position: [number, number]): Feature {
    const canvas = <HTMLCanvasElement>document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    const DOMURL = window.URL;
    const img = new Image();
    const svg = new Blob([iconHtml], {
      type: 'image/svg+xml',
    });
    const url = DOMURL.createObjectURL(svg);
    img.onload = () => {
      ctx.drawImage(img, 0, 0);
      DOMURL.revokeObjectURL(url);
    };
    img.src = url;
    img.crossOrigin == 'Anonymous';
    const feature = new Feature({
      geometry: new Point(fromLonLat(position)),
    });
    const style = new Style({
      image: new Icon({
        anchor: [0.5, 0.5],
        img: img,
        imgSize: [32, 32],
        opacity: 1,
      }),
      zIndex: 999999999,
    });
    feature.setStyle(style);

    return feature;
  }

  private _drawTemporaryLocationFeature(
    location?: ILocation,
    track?: CGeojsonLineStringFeature,
  ): void {
    if (location) {
      if (!this._elevationChartSource) {
        this._elevationChartSource = new VectorSource({
          format: new GeoJSON(),
        });
      }
      if (!this._elevationChartLayer) {
        this._elevationChartLayer = new VectorLayer({
          source: this._elevationChartSource,
          style: feature => {
            if (feature.getGeometry().getType() === 'Point') {
              return [
                new Style({
                  image: new CircleStyle({
                    fill: new FillStyle({
                      color: '#000',
                    }),
                    radius: 7,
                    stroke: new StrokeStyle({
                      width: 2,
                      color: '#fff',
                    }),
                  }),
                  zIndex: POINTER_TRACK_ZINDEX,
                }),
              ];
            } else {
              return this._getLineStyle(this._elevationChartTrack.get('color'));
            }
          },
          updateWhileAnimating: false,
          updateWhileInteracting: false,
          zIndex: POINTER_TRACK_ZINDEX,
        });
        this.map.addLayer(this._elevationChartLayer);
      }

      if (location) {
        const pointGeometry: Point = new Point(
          this._coordsFromLonLat([location.longitude, location.latitude]),
        );

        if (this._elevationChartPoint) {
          this._elevationChartPoint.setGeometry(pointGeometry);
        } else {
          this._elevationChartPoint = new Feature(pointGeometry);
          this._elevationChartSource.addFeature(this._elevationChartPoint);
        }

        if (track) {
          const trackGeometry: LineString = new LineString(
            (track.geometry.coordinates as ILineString).map(value => this._coordsFromLonLat(value)),
          );
          const trackColor: string = track?.properties?.color;

          if (this._elevationChartTrack) {
            this._elevationChartTrack.setGeometry(trackGeometry);
            this._elevationChartTrack.set('color', trackColor);
          } else {
            this._elevationChartTrack = new Feature(trackGeometry);
            this._elevationChartTrack.set('color', trackColor);
            this._elevationChartSource.addFeature(this._elevationChartTrack);
          }
        }
      } else {
        this._elevationChartPoint = undefined;
        this._elevationChartTrack = undefined;
        this._elevationChartSource.clear();
      }

      this.map.render();
    } else if (this._elevationChartSource && this.map) {
      this._elevationChartPoint = undefined;
      this._elevationChartTrack = undefined;
      this._elevationChartSource.clear();
      this.map.render();
    }
  }

  private _fitView(geometryOrExtent: any, optOptions?: FitOptions): void {
    if (optOptions == null) {
      const size = this.map.getSize();
      optOptions = {
        duration: 500,
        size,
      };
    }
    this.map.getView().fit(geometryOrExtent, optOptions);
  }

  private _getLineStyle(color?: string): Array<Style> {
    const style: Array<Style> = [],
      selected: boolean = false;

    if (!color) color = '255, 177, 0'; // this._featuresService.color(id),
    if (color[0] === '#') {
      color =
        parseInt(color.substring(1, 3), 16) +
        ', ' +
        parseInt(color.substring(3, 5), 16) +
        ', ' +
        parseInt(color.substring(5, 7), 16);
    }
    const strokeWidth: number = 6, // this._featuresService.strokeWidth(id),
      strokeOpacity: number = 1, // this._featuresService.strokeOpacity(id),
      lineDash: Array<number> = [], // this._featuresService.lineDash(id),
      lineCap: CanvasLineCap = 'round', // this._featuresService.lineCap(id),
      currentZoom: number = this.map.getView().getZoom();

    color = 'rgba(' + color + ',' + strokeOpacity + ')';

    if (selected) {
      style.push(
        new Style({
          stroke: new Stroke({
            color: 'rgba(226, 249, 0, 0.6)',
            width: 10,
          }),
          zIndex: SELECTED_TRACK_ZINDEX + 5,
        }),
      );
    }

    style.push(
      new Style({
        stroke: new Stroke({
          color: 'rgba(255, 255, 255, 0.9)',
          width: strokeWidth * 2,
        }),
        zIndex: SELECTED_TRACK_ZINDEX + 1,
      }),
    );

    style.push(
      new Style({
        stroke: new Stroke({
          color,
          width: strokeWidth,
          lineDash,
          lineCap,
        }),
        zIndex: SELECTED_TRACK_ZINDEX + 2,
      }),
    );

    return style;
  }

  private _init(): void {
    const startPosition = this.track.geometry.coordinates[0];
    const endPosition = this.track.geometry.coordinates[this.track.geometry.coordinates.length - 1];
    this._startFeature = this._createFeature(startIconHtml, [startPosition[0], startPosition[1]]);
    this._endFeature = this._createFeature(endIconHtml, [endPosition[0], endPosition[1]]);
    this._startEndLayer = new VectorLayer({
      zIndex: FLAG_TRACK_ZINDEX,
      source: new VectorSource({
        features: [this._startFeature, this._endFeature],
      }),
    });
    this.map.addLayer(this._startEndLayer);
    this.drawTrack(this.track);
    const ext = this._trackFeatures[0].getGeometry().getExtent();
    const size = this.map.getSize();
    const optOptions: FitOptions = {
      duration: 500,
      size,
      padding: [100, 100, 100, 100],
    };
    this._fitView(ext, optOptions);
  }

  private _resetView(): void {
    if (this._elevationChartLayer != null) {
      this._elevationChartSource.removeFeature(this._elevationChartPoint);
      this._elevationChartSource.clear();
      this.map.removeLayer(this._elevationChartLayer);
      this._elevationChartLayer = undefined;
      this._elevationChartPoint = undefined;
      this._elevationChartTrack = undefined;
      this.trackElevationChartElements = undefined;
    }
    if (this._startEndLayer != null) {
      this.map.removeLayer(this._startEndLayer);
      this._startEndLayer = undefined;
    }
    if (this._trackLayer != null) {
      this.map.removeLayer(this._trackLayer);
      this._trackLayer = undefined;
    }
    if (this.map != null) {
      this._fitView(new Point(this.map.getView().getCenter()), {
        maxZoom: this.conf.defZoom ?? 10,
        duration: 500,
      });
      this.map.render();
    }
  }

  private getGeoJson(trackgeojson: any): any {
    if (trackgeojson?.geoJson) {
      return trackgeojson.geoJson;
    }
    if (trackgeojson?.geometry) {
      return trackgeojson.geometry;
    }
    if (trackgeojson?._geometry) {
      return trackgeojson._geometry;
    }
    return trackgeojson;
  }
}