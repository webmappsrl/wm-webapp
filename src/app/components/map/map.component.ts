/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable max-len */
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  NgZone,
  OnDestroy,
  Output,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import {Store} from '@ngrx/store';

import {Collection, MapBrowserEvent} from 'ol';
import ScaleLineControl from 'ol/control/ScaleLine';
import ZoomControl from 'ol/control/Zoom';
import {Coordinate} from 'ol/coordinate';
import {stopPropagation} from 'ol/events/Event';
import {buffer, Extent} from 'ol/extent';
import Feature, {FeatureLike} from 'ol/Feature';
import GeoJSON from 'ol/format/GeoJSON';
import MVT from 'ol/format/MVT';
import Geometry from 'ol/geom/Geometry';
import LineString from 'ol/geom/LineString';
import Point from 'ol/geom/Point';
import SimpleGeometry from 'ol/geom/SimpleGeometry';
import {defaults as defaultInteractions} from 'ol/interaction.js';
import Interaction from 'ol/interaction/Interaction';
import SelectInteraction, {SelectEvent} from 'ol/interaction/Select';
import Layer from 'ol/layer/Layer';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import VectorTileLayer from 'ol/layer/VectorTile';
import Map from 'ol/Map';
import {fromLonLat} from 'ol/proj';
import VectorSource from 'ol/source/Vector';
import VectorTileSource from 'ol/source/VectorTile';
import XYZ from 'ol/source/XYZ';
import {getDistance} from 'ol/sphere.js';
import CircleStyle from 'ol/style/Circle';
import FillStyle from 'ol/style/Fill';
import Icon from 'ol/style/Icon';
import StrokeStyle from 'ol/style/Stroke';
import Style from 'ol/style/Style';
import TextStyle from 'ol/style/Text';
import TextPlacement from 'ol/style/TextPlacement';
import View, {FitOptions} from 'ol/View';

import {BehaviorSubject, Observable, Subscription} from 'rxjs';
import {filter, take, tap} from 'rxjs/operators';

import {PoiMarker} from 'src/app/classes/features/cgeojson-feature';
import {CGeojsonLineStringFeature} from 'src/app/classes/features/cgeojson-line-string-feature';
import {CommunicationService} from 'src/app/services/communication.service';
import {GeohubService} from 'src/app/services/geohub.service';
import {MapService} from 'src/app/services/map.service';
import {IConfRootState} from 'src/app/store/conf.reducer';
import {confMAP, confTHEME} from 'src/app/store/conf.selector';
import {ILocation} from 'src/app/types/location';
import {IGeojsonFeature, ILineString} from 'src/app/types/model';
import {ITrackElevationChartHoverElements} from 'src/app/types/track-elevation-chart';

const initPadding = [0, 0, 0, 0];
const zoomDuration = 500;
const startView = [10.4147, 43.7118, 9];
const initExtent: Extent = [-180, -85, 180, 85];
const initMaxZoom = 17;
const initMinZoom = 10;
const projection = 'EPSG:3857';
const scaleUnits = 'metric';
const scaleMinWidth = 50;
const DEF_MAP_CLUSTER_CLICK_TOLERANCE: number = 40;
@Component({
  selector: 'webmapp-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class MapComponent implements OnDestroy {
  @ViewChild('mapContainer') mapContainer: ElementRef;
  @ViewChild('zoomContainer') zoomContainer: ElementRef;
  @ViewChild('scaleLineContainer') scaleLineContainer: ElementRef;

  @Input('padding') set mapPadding(padding: number[]) {
    this._padding$.next(padding);
    if (padding != null && padding[3] != null) {
      this.scaleLineStyle$.next(padding[3]);
    }

    this._fitView(new Point(this._view.getCenter()), {
      padding: this._padding$.value,
      duration: zoomDuration,
      maxZoom: this._maxZoom,
    });
  }
  @Input('trackElevationChartElements') set trackElevationChartElements(
    value: ITrackElevationChartHoverElements,
  ) {
    this._drawTemporaryLocationFeature(value?.location, value?.track);
  }
  @Input('start-view') startView: number[] = startView;
  @Input('track') set setTrack(track: CGeojsonLineStringFeature) {
    if (track != null) {
      this._currentTrack$.next(track);
    }
  }
  @Input('poi') set setPoi(id: number) {
    if (id === -1 && this._selectedPoiLayer != null) {
      this._map.removeLayer(this._selectedPoiLayer);
      this._selectedPoiLayer = undefined;
    } else {
      const currentPoi = this._poiMarkers.find(p => +p.id === +id);
      if (currentPoi != null) {
        this._fitView(currentPoi.icon.getGeometry() as any);
        this._selectCurrentPoi(currentPoi);
      }
    }
  }

  @Output('feature-click') featureClick: EventEmitter<number> = new EventEmitter<number>();
  @Output('poi-click') poiClick: EventEmitter<number> = new EventEmitter<number>();

  scaleLineStyle$: BehaviorSubject<number> = new BehaviorSubject<number>(0);

  private _padding$: BehaviorSubject<number[]> = new BehaviorSubject<number[]>(initPadding);
  private _view: View;
  private _map: Map;
  private _dataLayers: Array<VectorTileLayer>;
  private _selectedFeature$: BehaviorSubject<FeatureLike | null> =
    new BehaviorSubject<FeatureLike | null>(null);
  private _currentTrack$: BehaviorSubject<CGeojsonLineStringFeature | null> =
    new BehaviorSubject<CGeojsonLineStringFeature | null>(null);
  private _selectInteraction: SelectInteraction;
  private _styleJson: any;
  private _elevationChartLayer: VectorLayer;
  private _elevationChartSource: VectorSource;
  private _elevationChartPoint: Feature<Point>;
  private _elevationChartTrack: Feature<LineString>;
  private _poisLayer: VectorLayer;
  private _selectedPoiLayer: VectorLayer;
  private _selectedPoiMarker: PoiMarker;
  private _poiMarkers: PoiMarker[] = [];
  private _updateMapSub: Subscription = Subscription.EMPTY;
  private _confTHEME$: Observable<ITHEME> = this._store.select(confTHEME);
  private _confMap$: Observable<any> = this._store.select(confMAP);
  private _maxZoom: number = initMaxZoom;
  private _minZoom: number = initMinZoom;

  private _defaultFeatureColor = '#000000';
  constructor(
    private _communicationService: CommunicationService,
    private _geohubService: GeohubService,
    private _mapService: MapService,
    private _zone: NgZone,
    private _store: Store<IConfRootState>,
  ) {
    this._zone.run(() => this._initMap());

    this._updateMapSub = this._currentTrack$
      .pipe(
        filter(trackid => trackid != null),
        tap(selectedGeohubFeature => {
          this._selectedFeature$.next(
            new GeoJSON({
              featureProjection: 'EPSG:3857',
            }).readFeatures(selectedGeohubFeature)[0],
          );
          this._addPoisMarkers(selectedGeohubFeature.properties.related_pois);
        }),
        tap(() => {
          for (const layer of this._dataLayers) {
            layer.changed();
          }
        }),
      )
      .subscribe(() => {
        this._fitView(this._selectedFeature$.value.getGeometry().getExtent(), {
          padding: this._padding$.value,
          duration: zoomDuration,
        });
      });

    this._confTHEME$.pipe(take(2)).subscribe(theme => {
      this._defaultFeatureColor = theme.defaultFeatureColor;
    });

    this._confMap$.pipe(filter(f => f != null)).subscribe((map: IMAP) => {
      if (map.maxZoom) {
        this._maxZoom = map.maxZoom;
        this._view.setMaxZoom(this._maxZoom);
      }
      if (map.minZoom) {
        this._minZoom = map.minZoom;
        this._view.setMinZoom(this._minZoom);
      }
      if (map.defZoom) {
        this._view.setZoom(map.defZoom);
      }
    });
  }

  ngOnDestroy(): void {
    this._updateMapSub.unsubscribe();
  }

  private _fitView(geometryOrExtent: SimpleGeometry | Extent, optOptions?: FitOptions): void {
    if (optOptions == null) {
      optOptions = {
        duration: zoomDuration,
      };
    }
    this._view.setMinZoom(this._minZoom);
    this._view.fit(geometryOrExtent, optOptions);
  }

  private async _initMap() {
    this._view = new View({
      center: this._mapService.coordsFromLonLat([this.startView[0], this.startView[1]]),
      zoom: this.startView[2],
      maxZoom: this._maxZoom,
      minZoom: this._minZoom,
      projection,
      constrainOnlyCenter: true,
      extent: this._mapService.extentFromLonLat(initExtent),
      padding: this._padding$.value || undefined,
    });

    this._fitView(new Point(this._view.getCenter()), {
      padding: this._padding$.value,
      duration: zoomDuration,
    });

    const baseLayers: Array<Layer> = this._initializeBaseLayers();
    this._dataLayers = await this._initializeDataLayers();
    const interactions: Collection<Interaction> = this._initializeMapInteractions(this._dataLayers);

    this._map = new Map({
      target: this.mapContainer.nativeElement,
      view: this._view,
      controls: [
        new ZoomControl({
          target: this.zoomContainer.nativeElement,
        }),
        new ScaleLineControl({
          units: scaleUnits,
          minWidth: scaleMinWidth,
          target: this.scaleLineContainer.nativeElement,
        }),
      ],
      layers: [...baseLayers, ...this._dataLayers],
      interactions,
      moveTolerance: 3,
    });

    this._selectInteraction.on('select', async (event: SelectEvent) => {
      const clickedFeature = event?.selected?.[0] ?? undefined;
      const clickedFeatureId: number = clickedFeature?.getProperties()?.id ?? undefined;
      if (clickedFeatureId > -1) {
        this.featureClick.emit(clickedFeatureId);
      }
    });

    this._map.on('pointerdrag', () => {
      this._map.getTargetElement().style.cursor = 'grabbing';
    });

    this._map.on('moveend', () => {
      this._map.getTargetElement().style.cursor = 'grab';
    });

    this._map.on('pointermove', (event: MapBrowserEvent) => {
      try {
        const features: Array<FeatureLike> = this._map.getFeaturesAtPixel(event.pixel);
        if (features.length) {
          this._map.getTargetElement().style.cursor = 'pointer';
        } else {
          this._map.getTargetElement().style.cursor = 'grab';
        }
      } catch (e) {
        this._map.getTargetElement().style.cursor = 'pointer';
      }
    });
    this._map.on('click', event => {
      stopPropagation(event);
      try {
        const poiFeature = this._getNearestFeatureOfLayer(this._poisLayer, event);
        if (poiFeature) {
          const currentID = +poiFeature.getId() || -1;
          this.poiClick.emit(currentID);
        }
      } catch (e) {
        console.log(e);
      }
    });
  }
  private async _selectCurrentPoi(poiMarker: PoiMarker) {
    if (this._selectedPoiMarker != null) {
      this._map.removeLayer(this._selectedPoiLayer);
      this._selectedPoiLayer = undefined;
    }
    this._selectedPoiLayer = this._createLayer(this._selectedPoiLayer, 9999);
    this._selectedPoiMarker = poiMarker;
    const {marker} = await this._createPoiCanvasIcon(poiMarker.poi, null, true);
    this._addIconToLayer(this._selectedPoiLayer, marker.icon);
  }
  private async _addPoisMarkers(poiCollection: Array<IGeojsonFeature>) {
    this._poisLayer = this._createLayer(this._poisLayer, 9998);
    for (let i = this._poiMarkers?.length - 1; i >= 0; i--) {
      const ov = this._poiMarkers[i];
      if (!poiCollection?.find(x => x.properties.id + '' === ov.id)) {
        this._removeIconFromLayer(this._poisLayer, ov.icon);
        this._poiMarkers.splice(i, 1);
      }
    }
    if (poiCollection) {
      for (const poi of poiCollection) {
        if (
          !this._poiMarkers?.find(
            x => x.id === poi.properties.id + '' && poi.properties?.feature_image?.sizes,
          )
        ) {
          const {marker} = await this._createPoiCanvasIcon(poi);
          this._addIconToLayer(this._poisLayer, marker.icon);
          this._poiMarkers.push(marker);
        }
      }
    }
  }

  private async _createPoiCanvasIcon(
    poi: any,
    geometry = null,
    selected = false,
  ): Promise<{marker: PoiMarker; style: Style}> {
    const img = await this._createPoiCavasImage(poi, selected);
    const {iconFeature, style} = await this._createIconFeature(
      geometry
        ? geometry
        : [poi.geometry.coordinates[0] as number, poi.geometry.coordinates[1] as number],
      img,
      46,
    );
    iconFeature.setId(poi.properties.id);
    return {
      marker: {
        poi,
        icon: iconFeature,
        id: poi.properties.id + '',
      },
      style,
    };
  }

  private async _createIconFeature(
    coordinates: number[],
    img: HTMLImageElement,
    size: number,
    transparent: boolean = false,
    anchor: number[] = [0.5, 0.5],
  ): Promise<{iconFeature: Feature<Geometry>; style: Style}> {
    if (!coordinates) {
      return;
    }
    const position = fromLonLat([coordinates[0] as number, coordinates[1] as number]);

    const iconFeature = new Feature({
      type: 'icon',
      geometry: new Point([position[0], position[1]]),
    });
    const style = new Style({
      image: new Icon({
        anchor,
        img,
        imgSize: [size, size],
        opacity: transparent ? 0.5 : 1,
      }),
    });

    iconFeature.setStyle(style);

    return {iconFeature, style};
  }

  private async _createPoiCavasImage(
    poi: IGeojsonFeature,
    selected = false,
  ): Promise<HTMLImageElement> {
    const htmlTextCanvas = await this._createPoiMarkerHtmlForCanvas(poi, selected);
    return this._createCanvasForHtml(htmlTextCanvas, 46);
  }

  private async _createPoiMarkerHtmlForCanvas(
    value: IGeojsonFeature,
    selected = false,
  ): Promise<string> {
    const img1b64: string | ArrayBuffer = await this._downloadBase64Img(
      value.properties?.feature_image?.sizes['108x137'],
    );

    let html = `
    <div class="webmapp-map-poimarker-container" style="position: relative;width: 30px;height: 60px;">`;

    html += `
        <svg width="46" height="46" viewBox="0 0 46 46" fill="none" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" style=" position: absolute;  width: 46px;  height: 46px;  left: 0px;  top: 0px;">
          <circle opacity="${selected ? 1 : 0.2}" cx="23" cy="23" r="23" fill="${
      this._defaultFeatureColor
    }"/>
          <rect x="5" y="5" width="36" height="36" rx="18" fill="url(#img)" stroke="white" stroke-width="2"/>
          <defs>
            <pattern height="100%" width="100%" patternContentUnits="objectBoundingBox" id="img">
              <image height="1" width="1" preserveAspectRatio="xMidYMid slice" xlink:href="${img1b64}">
              </image>
            </pattern>
          </defs>
        </svg>`;
    html += ` </div>`;

    return html;
  }

  private async _downloadBase64Img(url): Promise<string | ArrayBuffer> {
    const opt = {};
    // if (this.platform.is('mobile')) {
    //   opt = { mode: 'no-cors' };
    // }
    const data = await fetch(url, opt);
    const blob = await data.blob();
    return new Promise(resolve => {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      try {
        reader.onloadend = () => {
          const base64data = reader.result;
          resolve(base64data);
        };
      } catch (error) {
        // console.log('------- ~ getB64img ~ error', error);
        resolve('');
      }
    });
  }

  private async _createCanvasForHtml(html: string, size: number): Promise<HTMLImageElement> {
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions

    const canvasHtml =
      `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">` +
      '<foreignObject width="100%" height="100%">' +
      '<div xmlns="http://www.w3.org/1999/xhtml" style="font-size:40px">' +
      html +
      '</div>' +
      '</foreignObject>' +
      '</svg>';

    const domUrl = window.URL; // || window.webkitURL || window;

    const img = new Image();
    const svg = new Blob([canvasHtml], {
      type: 'image/svg+xml', //;charset=utf-8',
    });
    const url = domUrl.createObjectURL(svg);

    img.onload = () => {
      domUrl.revokeObjectURL(url);
    };
    img.src = url;

    return img;
  }

  private _createLayer(layer: VectorLayer, zIndex: number) {
    if (!layer) {
      layer = new VectorLayer({
        source: new VectorSource({
          features: [],
        }),
        updateWhileAnimating: true,
        updateWhileInteracting: true,
        zIndex,
      });
      this._map.addLayer(layer);
    }
    return layer;
  }

  private _addIconToLayer(layer: VectorLayer, icon: Feature<Geometry>) {
    layer.getSource().addFeature(icon);
  }

  private _removeIconFromLayer(layer: VectorLayer, icon: Feature<Geometry>) {
    const source = layer.getSource();
    if (source.hasFeature(icon)) {
      source.removeFeature(icon);
    }
    // this._map.removeOverlay(cm.icon);
    //cm.component.destroy();
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
      maxZoom: this._maxZoom,
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
  private async _initializeDataLayer(layerId: string, layerConfig: any): Promise<VectorTileLayer> {
    if (!layerConfig.url) {
      return;
    }

    const layerJson = await this._communicationService.get(layerConfig.url).toPromise();

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
        let featureSymbolStyle: any;
        for (const layerStyle of this._styleJson.layers) {
          if (layerStyle.id === properties.cai_scale) {
            featureStyle = layerStyle;
          } else if (layerStyle.type === 'symbol') {
            featureSymbolStyle = layerStyle;
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
              strokeStyle.setWidth(featureStyle.paint['line-width'].stops[maxWidthPos]?.[1] ?? 1);
            } else {
              const minWidth: number =
                featureStyle.paint['line-width'].stops[maxWidthPos - 1]?.[1] ?? 1;
              const maxWidth: number =
                featureStyle.paint['line-width'].stops[maxWidthPos]?.[1] ?? 1;
              const minZoom: number = featureStyle.paint['line-width'].stops[maxWidthPos - 1][0];
              const maxZoom: number = featureStyle.paint['line-width'].stops[maxWidthPos][0];
              const factor: number = (currentZoom - minZoom) / (maxZoom - minZoom);

              strokeStyle.setWidth(minWidth + (maxWidth - minWidth) * factor);
            }
          }
        }

        const style: Style = new Style({
          stroke: strokeStyle,
          zIndex: 100,
        });

        if (
          (!featureSymbolStyle?.minzoom || featureSymbolStyle?.minzoom <= this._view.getZoom()) &&
          (!featureSymbolStyle?.maxzoom || featureSymbolStyle?.maxzoom >= this._view.getZoom())
        ) {
          // Apply symbol style
          let text: string = '';
          let mapping: string = featureSymbolStyle?.layout?.['text-field'];

          while (mapping.length > 0) {
            if (mapping[0] === '{') {
              const length: number = mapping.indexOf('}') > 0 ? mapping.indexOf('}') - 1 : -1;

              if (length >= 0) {
                const property: string = mapping.substring(1, length + 1);
                mapping = mapping.substring(length + 2);
                text += properties?.[property] ?? '';
              }
            } else {
              const length: number =
                mapping.indexOf('{') >= 0 ? mapping.indexOf('{') : mapping.length;
              text += mapping.substring(0, length);
              mapping = mapping.substring(length);
            }
          }

          if (text) {
            const textStyle: TextStyle = new TextStyle({
              text,
              font: (featureSymbolStyle?.layout?.['text-size'] ?? '12') + 'px sans',
              placement:
                featureSymbolStyle?.layout?.['symbol-placement'] &&
                [TextPlacement.LINE, TextPlacement.POINT].indexOf(
                  featureSymbolStyle?.layout?.['symbol-placement'],
                ) >= 0
                  ? featureSymbolStyle?.layout?.['symbol-placement']
                  : TextPlacement.LINE,
              textBaseline: 'bottom',
              maxAngle: Math.PI / 10,
              fill: new FillStyle({
                color: featureSymbolStyle?.paint?.['text-color'] ?? strokeStyle.getColor(),
              }),
            });

            style.setText(textStyle);
          }
        }

        if (
          this._currentTrack$.value != null &&
          properties.id === this._currentTrack$.value.properties.id
        ) {
          style.setZIndex(1000);
          const selectedStyle = new Style({
            stroke: new StrokeStyle({
              width: Math.max(10, strokeStyle.getWidth() + 8),
              color: 'rgba(226, 249, 0, 0.6)',
            }),
            zIndex: 999,
          });

          if (style.getText()) {
            style.getText().setStroke(
              new StrokeStyle({
                width: 4,
                color: 'rgba(226, 249, 0, 0.6)',
              }),
            );
          }

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
  private _initializeMapInteractions(selectLayers: Array<Layer>): Collection<Interaction> {
    const interactions = defaultInteractions({
      doubleClickZoom: true,
      dragPan: true,
      mouseWheelZoom: true,
      pinchRotate: false,
      altShiftDragRotate: false,
    });
    this._selectInteraction = new SelectInteraction({
      layers: selectLayers,
      hitTolerance: 1,
      style: null,
    });

    interactions.push(this._selectInteraction);

    return interactions;
  }

  /**
   * Return a value for the distance between the two point using a screen-fixed unit
   *
   * @param point1 the first location
   * @param point2 the second location
   */
  private _getFixedDistance(point1: ILocation, point2: ILocation): number {
    return (
      getDistance([point1.longitude, point1.latitude], [point2.longitude, point2.latitude]) /
      this._view.getResolution()
    );
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
          this._mapService.coordsFromLonLat([location.longitude, location.latitude]),
        );

        if (this._elevationChartPoint) {
          this._elevationChartPoint.setGeometry(pointGeometry);
        } else {
          this._elevationChartPoint = new Feature(pointGeometry);
          this._elevationChartSource.addFeature(this._elevationChartPoint);
        }

        if (track) {
          const trackGeometry: LineString = new LineString(
            (track.geometry.coordinates as ILineString).map(value =>
              this._mapService.coordsFromLonLat(value),
            ),
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
        }),
      );
    }

    style.push(
      new Style({
        stroke: new StrokeStyle({
          color: 'rgba(255, 255, 255, 0.9)',
          width: strokeWidth * 2,
        }),
        zIndex: zIndex + 1,
      }),
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
      }),
    );

    return style;
  }

  private _getNearestFeatureOfLayer(
    layer: VectorLayer,
    evt: MapBrowserEvent<UIEvent>,
  ): Feature<Geometry> {
    const precision = this._view.getResolution() * DEF_MAP_CLUSTER_CLICK_TOLERANCE;
    let nearestFeature = null;
    const features: Feature<Geometry>[] = [];

    if (layer && layer.getSource()) {
      layer
        .getSource()
        .forEachFeatureInExtent(
          buffer(
            [evt.coordinate[0], evt.coordinate[1], evt.coordinate[0], evt.coordinate[1]],
            precision,
          ),
          feature => {
            features.push(feature);
          },
        );
    }

    if (features.length) {
      nearestFeature = this._getNearest(features, evt.coordinate);
    }

    return nearestFeature;
  }

  private _getNearest(features: Feature<Geometry>[], coordinate: Coordinate) {
    let ret: Feature<Geometry> = features[0];
    let minDistance = Number.MAX_VALUE;
    features.forEach(feature => {
      const geom = feature.getGeometry() as Point;
      const distance = this._distance(geom.getFlatCoordinates(), coordinate);
      if (distance < minDistance) {
        minDistance = distance;
        ret = feature;
      }
    });
    return ret;
  }
  private _distance(c1: Coordinate, c2: Coordinate) {
    return Math.sqrt(Math.pow(c1[0] - c2[0], 2) + Math.pow(c1[1] - c2[1], 2));
  }
}
