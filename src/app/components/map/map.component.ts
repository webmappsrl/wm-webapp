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
import { defaults as defaultInteractions } from 'ol/interaction.js';
import Interaction from 'ol/interaction/Interaction';
import SelectInteraction from 'ol/interaction/Select';
import { getDistance } from 'ol/sphere.js';
import Feature from 'ol/Feature';
import { MapService } from 'src/app/services/map.service';
import Style from 'ol/style/Style';
import StrokeStyle from 'ol/style/Stroke';
import FillStyle from 'ol/style/Fill';
import CircleStyle from 'ol/style/Circle';
import { CommunicationService } from 'src/app/services/communication.service';
import { Collection, MapBrowserEvent } from 'ol';
import Layer from 'ol/layer/Layer';
import { SelectEvent } from 'ol/interaction/Select';
import { FeatureLike } from 'ol/Feature';
import Point from 'ol/geom/Point';
import { GeohubService } from 'src/app/services/geohub.service';
import { ILocation } from 'src/app/types/location';
import { ITrackElevationChartHoverElements } from 'src/app/types/track-elevation-chart';
import { CGeojsonLineStringFeature } from 'src/app/classes/features/cgeojson-line-string-feature';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import LineString from 'ol/geom/LineString';
import { ILineString } from 'src/app/types/model';

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
  @Input('trackElevationChartElements') set trackElevationChartElements(
    value: ITrackElevationChartHoverElements
  ) {
    this._drawTemporaryLocationFeature(value?.location, value?.track);
  }
  @Output('feature-click') featureClick: EventEmitter<number> =
    new EventEmitter<number>();

  public padding: Array<number> = [0, 0, 0, 0];
  private _view: View;
  private _map: Map;
  private _dataLayers: Array<VectorTileLayer>;
  private _selectedFeature: FeatureLike;
  private _selectedFeatureId: number;
  private _selectInteraction: SelectInteraction;
  private _styleJson: any;
  private _elevationChartLayer: VectorLayer;
  private _elevationChartSource: VectorSource;
  private _elevationChartPoint: Feature<Point>;
  private _elevationChartTrack: Feature<LineString>;
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

    this._map.on('pointerdrag', () => {
      this._map.getTargetElement().style.cursor = 'grabbing';
    });

    this._map.on('moveend', () => {
      this._map.getTargetElement().style.cursor = 'grab';
    });

    this._map.on('pointermove', (event: MapBrowserEvent) => {
      const features: Array<FeatureLike> = this._map.getFeaturesAtPixel(
        event.pixel
      );

      if (features.length) {
        this._map.getTargetElement().style.cursor = 'pointer';
      } else {
        this._map.getTargetElement().style.cursor = 'grab';
      }
    });

    // TODO: figure out why this must be called inside a timeout
    setTimeout(() => {
      this._map.updateSize();
    }, 1000);
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
  private async _initializeDataLayers(): Promise<Array<VectorTileLayer>> {
    const styleJson: any = await this._geohubService.getVectorLayerStyle();

    const layers: Array<VectorTileLayer> = [];

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
  ): Promise<VectorTileLayer> {
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
      updateWhileAnimating: true,
      updateWhileInteracting: true,
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

  /**
   * Return a value for the distance between the two point using a screen-fixed unit
   *
   * @param point1 the first location
   * @param point2 the second location
   */
  private _getFixedDistance(point1: ILocation, point2: ILocation): number {
    return (
      getDistance(
        [point1.longitude, point1.latitude],
        [point2.longitude, point2.latitude]
      ) / this._view.getResolution()
    );
  }

  private _drawTemporaryLocationFeature(
    location?: ILocation,
    track?: CGeojsonLineStringFeature
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
          style: (feature) => {
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
                  zIndex: 100,
                }),
              ];
            } else {
              return this._getLineStyle(this._elevationChartTrack.get('color'));
            }
          },
          updateWhileAnimating: false,
          updateWhileInteracting: false,
          zIndex: 150,
        });
        this._map.addLayer(this._elevationChartLayer);
      }

      if (location) {
        const pointGeometry: Point = new Point(
          this._mapService.coordsFromLonLat([
            location.longitude,
            location.latitude,
          ])
        );

        if (this._elevationChartPoint) {
          this._elevationChartPoint.setGeometry(pointGeometry);
        } else {
          this._elevationChartPoint = new Feature(pointGeometry);
          this._elevationChartSource.addFeature(this._elevationChartPoint);
        }

        if (track) {
          const trackGeometry: LineString = new LineString(
            (track.geometry.coordinates as ILineString).map((value) =>
              this._mapService.coordsFromLonLat(value)
            )
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

      this._map.render();
    } else if (this._elevationChartSource && this._map) {
      this._elevationChartPoint = undefined;
      this._elevationChartTrack = undefined;
      this._elevationChartSource.clear();
      this._map.render();
    }
  }

  private _getLineStyle(color?: string): Array<Style> {
    const style: Array<Style> = [];
    const selected: boolean = false;

    if (!color) {
      color = '255, 177, 0';
    }
    if (color[0] === '#') {
      color =
        parseInt(color.substring(1, 3), 16) +
        ', ' +
        parseInt(color.substring(3, 5), 16) +
        ', ' +
        parseInt(color.substring(5, 7), 16);
    }
    const strokeWidth: number = 3; // this._featuresService.strokeWidth(id),
    const strokeOpacity: number = 1; // this._featuresService.strokeOpacity(id),
    const lineDash: Array<number> = []; // this._featuresService.lineDash(id),
    const lineCap: CanvasLineCap = 'round'; // this._featuresService.lineCap(id),
    color = 'rgba(' + color + ',' + strokeOpacity + ')';

    const zIndex: number = 50; //this._getZIndex(id, "line", selected);

    if (selected) {
      style.push(
        new Style({
          stroke: new StrokeStyle({
            color: 'rgba(226, 249, 0, 0.6)',
            width: 10,
          }),
          zIndex: zIndex + 5,
        })
      );
    }

    style.push(
      new Style({
        stroke: new StrokeStyle({
          color: 'rgba(255, 255, 255, 0.9)',
          width: strokeWidth * 2,
        }),
        zIndex: zIndex + 1,
      })
    );

    style.push(
      new Style({
        stroke: new StrokeStyle({
          color,
          width: strokeWidth,
          lineDash,
          lineCap,
        }),
        zIndex: zIndex + 2,
      })
    );

    return style;
  }
}
