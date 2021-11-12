import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnDestroy,
  ViewChild,
} from '@angular/core';

import { Subject } from 'rxjs';

// ol imports
import Map from 'ol/Map';
import MVT from 'ol/format/MVT';
import TileLayer from 'ol/layer/Tile';
import VectorTileLayer from 'ol/layer/VectorTile';
import VectorTileSource from 'ol/source/VectorTile';
import TileJsonSource from 'ol/source/TileJSON';
import View from 'ol/View';
import XYZ from 'ol/source/XYZ';
import ZoomControl from 'ol/control/Zoom';
import { defaults as defaultInteractions } from 'ol/interaction.js';

import { MapService } from 'src/app/services/map.service';
import Style from 'ol/style/Style';
import FillStyle from 'ol/style/Fill';
import StrokeStyle from 'ol/style/Stroke';
import IconStyle from 'ol/style/Icon';
import TextStyle from 'ol/style/Text';
import { CommunicationService } from 'src/app/services/communication.service';

@Component({
  selector: 'webmapp-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
})
export class MapComponent implements AfterViewInit, OnDestroy {
  @ViewChild('mapContainer') mapContainer: ElementRef;
  @ViewChild('zoomContainer') zoomContainer: ElementRef;

  @Input('start-view') startView: number[] = [10.4147, 43.7118, 9];

  public mapDegrees: number;

  private _destroyer: Subject<boolean> = new Subject<boolean>();

  private _view: View;
  private _map: Map;

  private _styleJson: any;

  constructor(
    private _communicationService: CommunicationService,
    private _mapService: MapService
  ) {}

  ngAfterViewInit() {
    if (!this.startView) {
      this.startView = [10.4147, 43.7118, 9];
    }

    this._view = new View({
      center: this._mapService.coordsFromLonLat([
        this.startView[0],
        this.startView[1],
      ]),
      zoom: this.startView[2],
      maxZoom: 17,
      minZoom: 0,
      projection: 'EPSG:3857',
      constrainOnlyCenter: true,
      extent: this._mapService.extentFromLonLat([-180, -85, 180, 85]),
    });

    const interactions = defaultInteractions({
      doubleClickZoom: true,
      dragPan: true,
      mouseWheelZoom: true,
      pinchRotate: true,
    });

    this._map = new Map({
      target: this.mapContainer.nativeElement,
      view: this._view,
      controls: [
        new ZoomControl({
          target: this.zoomContainer.nativeElement,
        }),
      ],
      interactions,
      moveTolerance: 3,
    });

    this._map.addLayer(
      new TileLayer({
        source: this._initializeBaseSource(),
        visible: true,
        zIndex: 1,
      })
    );

    this._initializeDataLayers();

    // //TODO: figure out why this must be called inside a timeout
    setTimeout(() => {
      this._map.updateSize();
    }, 0);
  }

  ngOnDestroy() {
    this._destroyer.next(true);
  }

  /**
   * Initialize the base source of the map
   *
   * @returns the XYZ source to use
   */
  private _initializeBaseSource() {
    return new XYZ({
      maxZoom: 17,
      minZoom: 0,
      url: 'https://api.webmapp.it/tiles/{z}/{x}/{y}.png',
      projection: 'EPSG:3857',
      tileSize: [256, 256],
    });
  }

  private async _initializeDataLayers() {
    const styleJson = await this._communicationService
      .get('https://k.webmapp.it/webmapp/tracks.json')
      .toPromise();

    if (styleJson.sources) {
      this._styleJson = styleJson;
      for (const i in styleJson.sources) {
        this._initializeDataLayer(i, styleJson.sources[i]);
      }
    }
  }

  private async _initializeDataLayer(layerId: string, layerConfig: any) {
    if (!layerConfig.url) {
      return;
    }

    const layerJson = await this._communicationService
      .get(layerConfig.url)
      .toPromise();

    if (!layerJson.tiles) {
      return;
    }

    const layer = new VectorTileLayer({
      declutter: true,
      source: new VectorTileSource({
        format: new MVT(),
        urls: layerJson.tiles,
      }),
      style: (f) => {
        const properties = f.getProperties();
        let featureStyle: any;
        for (const layerStyle of this._styleJson.layers) {
          if (layerStyle.id === properties.cai_scale) {
            featureStyle = layerStyle;
            break;
          }
        }

        const strokeStyle: StrokeStyle = new StrokeStyle();

        if (featureStyle?.paint?.['line-color']) {
          strokeStyle.setColor(featureStyle.paint['line-color']);
        }
        if (featureStyle?.layout?.['line-cap']) {
          strokeStyle.setLineCap(featureStyle.layout['line-cap']);
        }
        if (featureStyle?.layout?.['line-join']) {
          strokeStyle.setLineJoin(featureStyle.layout['line-join']);
        }
        if (featureStyle?.paint?.['line-dasharray']) {
          strokeStyle.setLineDash(featureStyle.layout['line-dasharray']);
        }

        const style: Style = new Style({
          stroke: strokeStyle,
        });

        return style;
      },
      zIndex: 100,
    });

    this._map.addLayer(layer);
  }
}
