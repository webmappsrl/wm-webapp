import {Collection, ImageTile, Tile, VectorTile} from 'ol';
import {Directive, EventEmitter, Input, OnChanges, Output, SimpleChanges} from '@angular/core';
import {Interaction, defaults as defaultInteractions} from 'ol/interaction.js';
import SelectInteraction, {SelectEvent} from 'ol/interaction/Select';

import {CommunicationService} from 'src/app/services/communication.service';
import {ConfService} from 'src/app/store/conf/conf.service';
import {DEF_LINE_COLOR} from './constants';
import {FeatureLike} from 'ol/Feature';
import Layer from 'ol/layer/Layer';
import MVT from 'ol/format/MVT';
import Map from 'ol/Map';
import StrokeStyle from 'ol/style/Stroke';
import Style from 'ol/style/Style';
import {TRACK_ZINDEX} from './zIndex';
import TileState from 'ol/TileState';
import VectorTileLayer from 'ol/layer/VectorTile';
import VectorTileSource from 'ol/source/VectorTile';
import {WmMaBaseDirective} from './base.directive';
import {loadFeaturesXhr} from 'ol/featureloader';
import {styleJsonFn} from './utils';

@Directive({
  selector: '[wmMapLayer]',
})
export class WmMapLayerDirective extends WmMaBaseDirective implements OnChanges {
  private _currentLayer: ILAYER;
  private _dataLayers: Array<VectorTileLayer>;
  private _defaultFeatureColor = DEF_LINE_COLOR;
  private _disableLayers = false;
  private _mapIsInit = false;
  private _selectInteraction: SelectInteraction;
  private _styleJson: any;

  @Input() conf: IMAP;
  @Input() map: Map;
  @Output() trackSelectedFromLayerEVT: EventEmitter<number> = new EventEmitter<number>();

  constructor(private _confSvc: ConfService, private _communicationSvc: CommunicationService) {
    super();
  }

  @Input() set disableLayers(disable: boolean) {
    this._disableLayers = disable;
    if (this._dataLayers != null) {
      this._dataLayers[this._dataLayers.length - 1].setVisible(!this._disableLayers);
    }
  }

  @Input() set layer(l: ILAYER) {
    this._currentLayer = l;
    if (l != null && l.bbox != null) {
      this.fitView(l.bbox);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.map != null && this.conf != null && this._mapIsInit == false) {
      this._initLayer(this.conf);
      this._mapIsInit = true;
    }
    if (this._dataLayers != null) {
      this._updateMap();
    }
  }

  private _getColorFromLayer(id: number): string {
    const layers = this.conf.layers || [];
    const layer = layers.filter(l => +l.id === +id);
    return layer[0] && layer[0].style && layer[0].style.color
      ? layer[0].style.color
      : this._defaultFeatureColor;
  }

  private _handlingStrokeStyleWidth(strokeStyle: StrokeStyle, conf: IMAP): void {
    const currentZoom: number = this.map.getView().getZoom();
    const minW = 0.1;
    const maxW = 5;
    const delta = (currentZoom - conf.minZoom) / (conf.maxZoom - conf.minZoom);
    const newWidth = minW + (maxW - minW) * delta;
    strokeStyle.setWidth(newWidth);
  }

  private async _initLayer(map: IMAP) {
    this._dataLayers = await this._initializeDataLayers(map);
    const interactions: Collection<Interaction> = this._initializeMapInteractions(this._dataLayers);
    interactions.getArray().forEach(interaction => {
      this.map.addInteraction(interaction);
    });
    this._selectInteraction.on('select', async (event: SelectEvent) => {
      const clickedFeature = event?.selected?.[0] ?? undefined;
      const clickedFeatureId: number = clickedFeature?.getProperties()?.id ?? undefined;
      if (clickedFeatureId > -1) {
        this.trackSelectedFromLayerEVT.emit(clickedFeatureId);
      }
    });

    this.map.updateSize();
  }

  /**
   * Initialize a specific layer with interactive data
   *
   * @returns the created layer
   */
  private async _initializeDataLayer(layerConfig: any, map: IMAP): Promise<VectorTileLayer> {
    if (!layerConfig.url) {
      return;
    }

    const layerJson = await this._communicationSvc.get(layerConfig.url).toPromise();

    if (!layerJson.tiles) {
      return;
    }
    console.log(layerJson.tiles);
    const layer = new VectorTileLayer({
      declutter: false,
      renderMode: 'image',
      useInterimTilesOnError: true,
      renderBuffer: 1000,
      minResolution: 0,
      minZoom: 1,
      zIndex: TRACK_ZINDEX,
      updateWhileAnimating: false,
      updateWhileInteracting: false,
      source: new VectorTileSource({
        cacheSize: 3000,
        format: new MVT(),
        urls: layerJson.tiles,
        // urls: [`http://0.0.0.0:8080/jido/?x={x}&y={y}&z={z}&index=28`],
        overlaps: false,
        tileSize: 128,
        transition: 1000,
        tileLoadFunction: (tile: any, url: string) => {
          tile.setLoader(
            this._loadFeaturesXhr(
              url,
              tile.getFormat(),
              tile.extent,
              tile.resolution,
              tile.projection,
              tile.onLoad.bind(tile),
              tile.onError.bind(tile),
            ),
          );
        },
      }),
      style: (feature: FeatureLike) => {
        const properties = feature.getProperties();
        const layers: number[] = JSON.parse(properties.layers);

        let strokeStyle: StrokeStyle = new StrokeStyle();
        if (this._currentLayer != null) {
          const currentIDLayer = +this._currentLayer.id;
          if (layers.indexOf(currentIDLayer) >= 0) {
            strokeStyle.setColor(this._currentLayer.style.color ?? this._defaultFeatureColor);
          } else {
            strokeStyle.setColor('rgba(0,0,0,0)');
          }
        } else {
          const layerId = +layers[0];
          strokeStyle.setColor(this._getColorFromLayer(layerId));
        }
        this._handlingStrokeStyleWidth(strokeStyle, map);

        let style = new Style({
          stroke: strokeStyle,
          zIndex: TRACK_ZINDEX,
        });
        return style;
      },
    });
    return layer;
  }

  /**
   * Create the layers containing the map interactive data
   *
   * @returns the array of created layers
   */
  private async _initializeDataLayers(map: IMAP): Promise<Array<VectorTileLayer>> {
    const vectorLayerUrl = this._confSvc.vectorLayerUrl;
    const styleJson: any = styleJsonFn(vectorLayerUrl);

    const layers: Array<VectorTileLayer> = [];

    if (styleJson.sources) {
      this._styleJson = styleJson;
      for (const i in styleJson.sources) {
        layers.push(await this._initializeDataLayer(styleJson.sources[i], map));
        this.map.addLayer(layers[layers.length - 1]);
      }
    }

    return layers;
  }

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
      hitTolerance: 100,
      style: null,
    });

    interactions.push(this._selectInteraction);

    return interactions;
  }

  private _loadFeaturesXhr(url, format, extent, resolution, projection, success, failure) {
    var xhr = new XMLHttpRequest();
    xhr.open('POST', typeof url === 'function' ? url(extent, resolution, projection) : url, true);
    if (format.getType() == 'arraybuffer') {
      xhr.responseType = 'arraybuffer';
    }
    /**
     * @param {Event} event Event.
     * @private
     */
    xhr.onload = function (event) {
      // status will be 0 for file:// urls
      if (!xhr.status || (xhr.status >= 200 && xhr.status < 300)) {
        var type = format.getType();
        /** @type {Document|Node|Object|string|undefined} */
        var source = void 0;
        if (type == 'json' || type == 'text') {
          source = xhr.responseText;
        } else if (type == 'xml') {
          source = xhr.responseXML;
          if (!source) {
            source = new DOMParser().parseFromString(xhr.responseText, 'application/xml');
          }
        } else if (type == 'arraybuffer') {
          source = xhr.response;
        }
        if (source) {
          success(
            format.readFeatures(source, {
              extent: extent,
              featureProjection: projection,
            }),
            format.readProjection(source),
          );
        } else {
          failure();
        }
      } else {
        failure();
      }
    };
    /**
     * @private
     */
    xhr.onerror = failure;
    const body = `{
      "query": {"term" : { "layers" : 133 }}
     
  }`;
    // const body = `{"query": {"term" : { "layers" : 133 }}}`;
    xhr.send(body);
  }

  private _updateMap(): void {
    for (const layer of this._dataLayers) {
      layer.changed();
    }
  }
}
