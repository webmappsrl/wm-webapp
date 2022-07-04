import {Directive, ElementRef, Input, OnInit} from '@angular/core';
import Feature from 'ol/Feature';
import Geometry from 'ol/geom/Geometry';
import Point from 'ol/geom/Point';
import VectorLayer from 'ol/layer/Vector';
import Map from 'ol/Map';
import GeoJSON from 'ol/format/GeoJSON';
import {fromLonLat} from 'ol/proj';
import VectorSource from 'ol/source/Vector';
import Icon from 'ol/style/Icon';
import Style from 'ol/style/Style';
import Stroke from 'ol/style/Stroke';
@Directive({
  selector: '[navMapTrack]',
})
export class NavMapTrackDirective implements OnInit {
  private _map: Map;
  private _track;
  @Input() set map(map: Map) {
    this._map = map;
    if (this._track != null && this._map != null) {
      this._init();
    }
  }
  @Input() set track(track: any) {
    this._track = track;
    if (track != null && this._map != null) {
      this._init();
    } else if (this._startEndLayer != null) {
      this._map.removeLayer(this._startEndLayer);
    }
  }

  private _startIconHtml = `
  <svg xmlns="http://www.w3.org/2000/svg" width="${32}" height="${32}">
    <foreignObject width="100%" height="100%">
      <div xmlns="http://www.w3.org/1999/xhtml" style="font-size:40px">
        <div class="webmapp-map-clustermarker-container" style="position: relative;width: 32px;height: 32px; ">
          <svg 
            id="Livello_1" 
            data-name="Livello 1" 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 74 74">
              <path d="M32,63.5a6.42,6.42,0,0,1-3.47-1.11,64.93,64.93,0,0,1-16.7-15.51,32.63,32.63,0,0,1-7-19.76C4.88,12.44,17,.5,32,.5S59.12,12.44,59.12,27.12a32.65,32.65,0,0,1-7,19.77A66.08,66.08,0,0,1,35.47,62.38,6.25,6.25,0,0,1,32,63.5Z" style="fill:#fff"/><path d="M32,5.5A21.89,21.89,0,0,0,9.88,27.12a27.61,27.61,0,0,0,5.95,16.74h0A60,60,0,0,0,31.24,58.18c.7.45.91.4,1.5,0A61,61,0,0,0,48.17,43.86a27.61,27.61,0,0,0,5.95-16.74C54.12,15.2,44.19,5.5,32,5.5Z" style="fill:#2f9e44"/><path d="M32,42.05A14.25,14.25,0,1,1,46.32,27.87,14.25,14.25,0,0,1,32,42.05Zm0-23.49a9.25,9.25,0,1,0,9.34,9.31A9.32,9.32,0,0,0,32,18.56Z" style="fill:#fff"/>
          </svg>
        </div>
      </div>
    </foreignObject>
  </svg>`;
  private _endIconHtml = `
  <svg xmlns="http://www.w3.org/2000/svg" width="${32}" height="${32}">
    <foreignObject width="100%" height="100%">
      <div xmlns="http://www.w3.org/1999/xhtml" style="font-size:40px">
        <div class="webmapp-map-clustermarker-container" style="position: relative;width: 32px;height: 32px; ">
          <svg 
            id="Livello_1" 
            data-name="Livello 1" 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 74 74">
              <path d="M14.82,4.51a3,3,0,0,1,2.95,3V9.64A33.47,33.47,0,0,0,32.21,8.8,35.64,35.64,0,0,1,50,8.4a2.8,2.8,0,0,1,2.1,2.76V34.83a3,3,0,0,1-3.49,3,44,44,0,0,0-16,.41A44.59,44.59,0,0,1,22.21,39a35.1,35.1,0,0,1-4.44-.46v18a2.95,2.95,0,1,1-5.89,0V7.46A2.94,2.94,0,0,1,14.82,4.51Z" style="fill:#2f9e44;fill-rule:evenodd"/><path d="M14.82,4.51a3,3,0,0,1,2.95,3V9.64a36.08,36.08,0,0,0,5.45.42,31.41,31.41,0,0,0,9-1.26,33.4,33.4,0,0,1,9.55-1.34A35.38,35.38,0,0,1,50,8.4a2.8,2.8,0,0,1,2.1,2.76V34.83a3,3,0,0,1-3,3l-.48,0a43.21,43.21,0,0,0-6.74-.54,47,47,0,0,0-9.21.95A44.47,44.47,0,0,1,24.1,39c-.64,0-1.28,0-1.89,0a35.1,35.1,0,0,1-4.44-.46v18a2.95,2.95,0,1,1-5.89,0V7.46a2.94,2.94,0,0,1,2.94-2.95m0-2.87A5.83,5.83,0,0,0,9,7.46V56.54a5.82,5.82,0,0,0,11.64,0V41.77l1.44.08c.67,0,1.34,0,2,0A47.48,47.48,0,0,0,33.25,41a43.75,43.75,0,0,1,8.64-.9,40.11,40.11,0,0,1,6.3.51,7,7,0,0,0,.92.07A5.88,5.88,0,0,0,55,34.83V11.16a5.68,5.68,0,0,0-4.29-5.55,37.89,37.89,0,0,0-9-1A35.82,35.82,0,0,0,31.38,6.05a28.53,28.53,0,0,1-8.16,1.13c-.87,0-1.73,0-2.59-.1a5.84,5.84,0,0,0-5.81-5.44Z" style="fill:#fff"/>
          </svg>
        </div>
      </div>
    </foreignObject>
  </svg>`;
  private _startFeature: Feature<Geometry>;
  private _endFeature: Feature<Geometry>;
  private _startEndLayer: VectorLayer;
  private _trackFeatures: Feature<Geometry>[];
  private _trackLayer: VectorLayer;
  constructor(private el: ElementRef) {}
  ngOnInit(): void {}
  private _init(): void {
    const startPosition = this._track.geometry.coordinates[0];
    const endPosition =
      this._track.geometry.coordinates[this._track.geometry.coordinates.length - 1];
    if (this._startFeature != null) {
      this._map.removeLayer(this._startEndLayer);
    }
    this._startFeature = this._createFeature(this._startIconHtml, [
      startPosition[0],
      startPosition[1],
    ]);
    this._endFeature = this._createFeature(this._endIconHtml, [endPosition[0], endPosition[1]]);
    this._startEndLayer = new VectorLayer({
      zIndex: 400,
      source: new VectorSource({
        features: [this._startFeature, this._endFeature],
      }),
    });

    this._map.addLayer(this._startEndLayer);
    this.drawTrack(this._track);

    console.log(this._map.getLayers());
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

  drawTrack(trackgeojson: any) {
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
        return this._getLineStyle('#CA1551');
      },
      updateWhileAnimating: true,
      updateWhileInteracting: true,
      zIndex: 0,
    });

    this._map.addLayer(this._trackLayer);
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
    const strokeWidth: number = 3, // this._featuresService.strokeWidth(id),
      strokeOpacity: number = 1, // this._featuresService.strokeOpacity(id),
      lineDash: Array<number> = [], // this._featuresService.lineDash(id),
      lineCap: CanvasLineCap = 'round', // this._featuresService.lineCap(id),
      currentZoom: number = this._map.getView().getZoom();

    color = 'rgba(' + color + ',' + strokeOpacity + ')';

    const zIndex: number = 50; //this._getZIndex(id, "line", selected);

    if (selected) {
      style.push(
        new Style({
          stroke: new Stroke({
            color: 'rgba(226, 249, 0, 0.6)',
            width: 10,
          }),
          zIndex: zIndex + 5,
        }),
      );
    }

    style.push(
      new Style({
        stroke: new Stroke({
          color: 'rgba(255, 255, 255, 0.9)',
          width: strokeWidth * 2,
        }),
        zIndex: zIndex + 1,
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
        zIndex: zIndex + 2,
      }),
    );

    return style;
  }
}
