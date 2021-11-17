import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  Output,
  ViewChild,
} from '@angular/core';

import { Subject } from 'rxjs';

// ol imports
import GeoJSON from 'ol/format/GeoJSON';
import Map from 'ol/Map';
import MVT from 'ol/format/MVT';
import TileLayer from 'ol/layer/Tile';
import VectorTileLayer from 'ol/layer/VectorTile';
import VectorTileSource from 'ol/source/VectorTile';
import View from 'ol/View';
import XYZ from 'ol/source/XYZ';
import ZoomControl from 'ol/control/Zoom';
import ScaleLineControl from 'ol/control/ScaleLine';
import {
  defaults as defaultInteractions,
  Interaction,
  Select as SelectInteraction,
} from 'ol/interaction.js';

import { MapService } from 'src/app/services/map.service';
import Style from 'ol/style/Style';
import StrokeStyle from 'ol/style/Stroke';
import { CommunicationService } from 'src/app/services/communication.service';
import { Collection } from 'ol';
import Layer from 'ol/layer/Layer';
import { SelectEvent } from 'ol/interaction/Select';
import { FeatureLike } from 'ol/Feature';
import Point from 'ol/geom/Point';
import { GeohubService } from 'src/app/services/geohub.service';

@Component({
  selector: 'webmapp-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
})
export class MapComponent implements AfterViewInit, OnDestroy {
  @ViewChild('mapContainer') mapContainer: ElementRef;
  @ViewChild('zoomContainer') zoomContainer: ElementRef;
  @ViewChild('scaleLineContainer') scaleLineContainer: ElementRef;

  @Input('start-view') startView: number[] = [10.4147, 43.7118, 9];
  @Input('padding') set mapPadding(value: Array<number>) {
    this.padding = value;
    this._updateView();
  }
  @Output('feature-click') featureClick: EventEmitter<number> =
    new EventEmitter<number>();

  public padding: Array<number> = [0, 0, 0, 0];
  private _view: View;
  private _map: Map;
  private _dataLayers: Array<Layer>;
  private _selectedFeature: FeatureLike;
  private _selectedFeatureId: number;
  private _selectInteraction: SelectInteraction;
  private _styleJson: any;
  private _destroyer: Subject<boolean> = new Subject<boolean>();

  constructor(
    private _communicationService: CommunicationService,
    private _geohubService: GeohubService,
    private _mapService: MapService
  ) {}

  async ngAfterViewInit() {
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
    if (this.padding) {
      this._view.padding = this.padding;
    }

    const baseLayers: Array<Layer> = this._initializeBaseLayers();
    this._dataLayers = await this._initializeDataLayers();
    const interactions: Collection<Interaction> =
      this._initializeMapInteractions(this._dataLayers);

    this._map = new Map({
      target: this.mapContainer.nativeElement,
      view: this._view,
      controls: [
        new ZoomControl({
          target: this.zoomContainer.nativeElement,
        }),
        new ScaleLineControl({
          units: 'metric',
          minWidth: 50,
          target: this.scaleLineContainer.nativeElement,
        }),
      ],
      layers: [...baseLayers, ...this._dataLayers],
      interactions,
      moveTolerance: 3,
    });

    this._selectInteraction.on('select', async (event: SelectEvent) => {
      const clickedFeature = event?.selected?.[0] ?? undefined;
      const clickedFeatureId: number =
        clickedFeature?.getProperties()?.id ?? undefined;
      if (clickedFeatureId) {
        this._selectedFeatureId = clickedFeatureId;
        try {
          const selectedGeohubFeature = await this._geohubService.getEcTrack(
            this._selectedFeatureId
          );

          this._selectedFeature = new GeoJSON({
            featureProjection: 'EPSG:3857',
          }).readFeatures(selectedGeohubFeature)[0];

          this.featureClick.emit(this._selectedFeatureId);
          for (const layer of this._dataLayers) {
            layer.changed();
          }
        } catch (e) {
          this._selectedFeatureId = undefined;
        }
      }
    });

    // //TODO: figure out why this must be called inside a timeout
    setTimeout(() => {
      this._map.updateSize();
    }, 100);
  }

  ngOnDestroy() {
    this._destroyer.next(true);
  }

  private _initializeBaseLayers(): Array<TileLayer> {
    return [
      new TileLayer({
        source: this._initializeBaseSource(),
        visible: true,
        zIndex: 1,
      }),
    ];
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

  /**
   * Create the layers containing the map interactive data
   *
   * @returns the array of created layers
   */
  private async _initializeDataLayers(): Promise<Array<Layer>> {
    const styleJson = await this._communicationService
      .get('https://k.webmapp.it/webmapp/tracks.json')
      .toPromise();

    const layers: Array<Layer> = [];

    if (styleJson.sources) {
      this._styleJson = styleJson;
      for (const i in styleJson.sources) {
        layers.push(await this._initializeDataLayer(i, styleJson.sources[i]));
      }
    }

    return layers;
  }

  /**
   * Initialize a specific layer with interactive data
   *
   * @returns the created layer
   */
  private async _initializeDataLayer(
    layerId: string,
    layerConfig: any
  ): Promise<Layer> {
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
      style: (feature: FeatureLike) => {
        const properties = feature.getProperties();
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

        if (featureStyle?.paint?.['line-width']) {
          if (featureStyle?.paint?.['line-width']?.stops) {
            let maxWidthPos: number = -1;
            const currentZoom: number = this._view.getZoom();
            for (const key in featureStyle.paint['line-width'].stops) {
              if (
                featureStyle.paint['line-width'].stops[key]?.[0] &&
                featureStyle.paint['line-width'].stops[key]?.[0] >= currentZoom
              ) {
                maxWidthPos = parseInt(key, 10);
                break;
              }
            }
            if (maxWidthPos === -1) {
              maxWidthPos = featureStyle.paint['line-width'].stops.length - 1;
            }

            if (maxWidthPos === 0) {
              strokeStyle.setWidth(
                featureStyle.paint['line-width'].stops[maxWidthPos]?.[1] ?? 1
              );
            } else {
              const minWidth: number =
                featureStyle.paint['line-width'].stops[maxWidthPos - 1]?.[1] ??
                1;
              const maxWidth: number =
                featureStyle.paint['line-width'].stops[maxWidthPos]?.[1] ?? 1;
              const minZoom: number =
                featureStyle.paint['line-width'].stops[maxWidthPos - 1][0];
              const maxZoom: number =
                featureStyle.paint['line-width'].stops[maxWidthPos][0];
              const factor: number =
                (currentZoom - minZoom) / (maxZoom - minZoom);

              strokeStyle.setWidth(minWidth + (maxWidth - minWidth) * factor);
            }
          }
        }

        const style: Style = new Style({
          stroke: strokeStyle,
          zIndex: 100,
        });
        if (properties.id === this._selectedFeatureId) {
          style.setZIndex(1000);
          const selectedStyle = new Style({
            stroke: new StrokeStyle({
              width: Math.max(10, strokeStyle.getWidth() + 8),
              color: 'rgba(226, 249, 0, 0.6)',
            }),
            zIndex: 999,
          });

          return [style, selectedStyle];
        } else {
          return style;
        }
      },
      minZoom: 7,
      zIndex: 100,
    });

    return layer;
  }

  /**
   * Initialize the default map interactions
   *
   * @returns the collection of interactions
   */
  private _initializeMapInteractions(
    selectLayers: Array<Layer>
  ): Collection<Interaction> {
    const interactions = defaultInteractions({
      doubleClickZoom: true,
      dragPan: true,
      mouseWheelZoom: true,
      pinchRotate: false,
      altShiftDragRotate: false,
    });
    this._selectInteraction = new SelectInteraction({
      layers: selectLayers,
      hitTolerance: 10,
      style: null,
    });
    interactions.push(this._selectInteraction);

    return interactions;
  }

  /**
   * Make the view fit a selected feature if available using the current padding
   */
  private _updateView(): void {
    if (this._view) {
      if (this._selectedFeature) {
        this._view.fit(this._selectedFeature.getGeometry().getExtent(), {
          padding: this.padding,
          duration: 500,
        });
      } else {
        this._view.fit(new Point(this._view.getCenter()), {
          padding: this.padding,
          duration: 500,
          maxZoom: this._view.getZoom(),
        });
      }
    }
  }
}
