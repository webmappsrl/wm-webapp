import {Directive, EventEmitter, Input, OnChanges, Output, SimpleChanges} from '@angular/core';
import {Interaction, defaults as defaultInteractions} from 'ol/interaction.js';
import SelectInteraction, {SelectEvent} from 'ol/interaction/Select';

import {Collection} from 'ol';
import {CommunicationService} from 'src/app/services/communication.service';
import {ConfService} from 'src/app/store/conf/conf.service';
import {DEF_LINE_COLOR} from './constants';
import {FeatureLike} from 'ol/Feature';
import Layer from 'ol/layer/Layer';
import MVT from 'ol/format/MVT';
import Map from 'ol/Map';
import Point from 'ol/geom/Point';
import StrokeStyle from 'ol/style/Stroke';
import Style from 'ol/style/Style';
import {TRACK_ZINDEX} from './zIndex';
import VectorTileLayer from 'ol/layer/VectorTile';
import VectorTileSource from 'ol/source/VectorTile';
import {WmMaBaseDirective} from './base.directive';
import {styleJsonFn} from './utils';

@Directive({
  selector: '[wmMapLayer]',
})
export class WmMapLayerDirective extends WmMaBaseDirective implements OnChanges {
  private _currentLayer: ILAYER;
  private _dataLayers: Array<VectorTileLayer>;
  private _defaultFeatureColor = DEF_LINE_COLOR;
  private _mapIsInit = false;
  private _selectInteraction: SelectInteraction;
  private _styleJson: any;

  @Input() conf: IMAP;
  @Input() map: Map;
  @Output() trackSelectedFromLayerEVT: EventEmitter<number> = new EventEmitter<number>();

  constructor(private _confSvc: ConfService, private _communicationSvc: CommunicationService) {
    super();
  }

  @Input() set layer(l: ILAYER) {
    this._currentLayer = l;
    if (l != null && l.bbox != null) {
      this.fitView(l.bbox);
    } else if (this.conf != null && this.conf.bbox != null) {
      this.fitView(this.conf.bbox);
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

    const layer = new VectorTileLayer({
      declutter: true,
      source: new VectorTileSource({
        format: new MVT(),
        urls: layerJson.tiles,
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
      minZoom: 1,
      zIndex: TRACK_ZINDEX,
      updateWhileAnimating: true,
      updateWhileInteracting: true,
    });
    return layer;
  }

  private _getColorFromLayer(id: number): string {
    const layers = this.conf.layers || [];
    const layer = layers.filter(l => +l.id === +id);
    return layer[0] && layer[0].style && layer[0].style.color
      ? layer[0].style.color
      : this._defaultFeatureColor;
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

  private _updateMap(): void {
    for (const layer of this._dataLayers) {
      layer.changed();
    }
  }
}
