import {DEF_LINE_COLOR, DEF_MAP_CLUSTER_CLICK_TOLERANCE} from './constants';
import {Directive, EventEmitter, Input, OnChanges, Output, SimpleChanges} from '@angular/core';

import {Coordinate} from 'ol/coordinate';
import {FLAG_TRACK_ZINDEX} from './zIndex';
import Feature from 'ol/Feature';
import {FitOptions} from 'ol/View';
import Geometry from 'ol/geom/Geometry';
import {IGeojsonFeature} from 'src/app/types/model';
import Icon from 'ol/style/Icon';
import MapBrowserEvent from 'ol/MapBrowserEvent';
import {PoiMarker} from 'src/app/classes/features/cgeojson-feature';
import Point from 'ol/geom/Point';
import Style from 'ol/style/Style';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import {WmMaBaseDirective} from './base.directive';
import {buffer} from 'ol/extent';
import {fromLonLat} from 'ol/proj';
import {logoBase64} from 'src/assets/logoBase64';

const ICN_PATH = 'assets/icons/pois';
@Directive({
  selector: '[wmMapPois]',
})
export class WmMapPoisDirective extends WmMaBaseDirective implements OnChanges {
  private _poisLayer: VectorLayer;
  private _selectedPoiLayer: VectorLayer;

  @Input() conf: IMAP;
  @Input() filters: any[] = [];
  @Input() pois: any;
  @Output('poi-click') poiClick: EventEmitter<number> = new EventEmitter<number>();

  @Input('poi') set setPoi(id: number) {
    if (this.map != null) {
      this._selectedPoiLayer = this._createLayer(this._selectedPoiLayer, FLAG_TRACK_ZINDEX + 100);
      this._selectedPoiLayer.getSource().clear();
      if (id > -1) {
        const currentPoi = this.pois.features.find(p => +p.properties.id === +id);
        if (currentPoi != null) {
          const icn = this._getIcnFromTaxonomies(currentPoi.properties.taxonomyIdentifiers);
          const coordinates = [
            currentPoi.geometry.coordinates[0] as number,
            currentPoi.geometry.coordinates[1] as number,
          ] || [0, 0];
          const position = fromLonLat([coordinates[0] as number, coordinates[1] as number]);
          const geometry = new Point([position[0], position[1]]);
          const iconFeature = new Feature({
            type: 'icon',
            geometry,
          });
          const iconStyle = new Style({
            image: new Icon({
              anchor: [0.5, 0.5],
              scale: 0.7,
              src: `${ICN_PATH}/${icn}_selected.png`,
            }),
          });
          iconFeature.setStyle(iconStyle);
          iconFeature.setId(currentPoi.properties.id);
          const source = this._selectedPoiLayer.getSource();
          source.addFeature(iconFeature);
          source.changed();
          this._fitView(geometry as any);
        }
      }
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes.map != null &&
      changes.map.currentValue != null &&
      changes.map.previousValue == null
    ) {
      this.map.on('click', event => {
        try {
          const poiFeature = this._getNearestFeatureOfLayer(this._poisLayer, event);
          if (poiFeature) {
            console.log('click');
            this.map.getInteractions().forEach(i => i.setActive(false));
            const currentID = +poiFeature.getId() || -1;
            this.poiClick.emit(currentID);
            setTimeout(() => {
              this.map.getInteractions().forEach(i => i.setActive(true));
            }, 1200);
          }
        } catch (e) {
          console.log(e);
        }
      });
    }
    if (this.map != null && this.pois != null) {
      if (this.filters.length > 0) {
        this._poisLayer.getSource().clear();
        const selectedFeatures = this.pois.features.filter(
          p => this._intersection(p.properties.taxonomyIdentifiers, this.filters).length > 0,
        );
        this._addPoisMarkers(selectedFeatures);
      } else {
        this._addPoisMarkers(this.pois.features);
      }
    }
  }
  private _intersection(a: any[], b: any[]): any[] {
    var setA = new Set(a);
    var setB = new Set(b);
    var intersection = new Set([...setA].filter(x => setB.has(x)));
    return Array.from(intersection);
  }

  private async _addPoisMarkers(poiCollection: Array<IGeojsonFeature>) {
    this._poisLayer = this._createLayer(this._poisLayer, FLAG_TRACK_ZINDEX);

    if (poiCollection) {
      for (const poi of poiCollection) {
        const icn = this._getIcnFromTaxonomies(poi.properties.taxonomyIdentifiers);
        const coordinates = [
          poi.geometry.coordinates[0] as number,
          poi.geometry.coordinates[1] as number,
        ] || [0, 0];

        const position = fromLonLat([coordinates[0] as number, coordinates[1] as number]);
        const iconFeature = new Feature({
          type: 'icon',
          geometry: new Point([position[0], position[1]]),
        });
        const iconStyle = new Style({
          image: new Icon({
            anchor: [0.5, 0.5],
            scale: 0.5,
            src: `${ICN_PATH}/${icn}.png`,
          }),
        });
        iconFeature.setStyle(iconStyle);
        iconFeature.setId(poi.properties.id);
        const source = this._poisLayer.getSource();
        source.addFeature(iconFeature);
        source.changed();
      }
    }

    this.map.on('moveend', e => {
      const view = this.map.getView();
      if (view != null) {
        const newZoom = +view.getZoom();
        const poisMinZoom = +this.conf.pois.poiMinZoom || 15;
        if (newZoom >= poisMinZoom) {
          this._poisLayer.setVisible(true);
        } else {
          this._poisLayer.setVisible(false);
        }
      }
    });
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
      this.map.addLayer(layer);
    }
    return layer;
  }

  private _distance(c1: Coordinate, c2: Coordinate) {
    return Math.sqrt(Math.pow(c1[0] - c2[0], 2) + Math.pow(c1[1] - c2[1], 2));
  }

  private _fitView(geometryOrExtent: any, optOptions?: FitOptions): void {
    if (optOptions == null) {
      const size = this.map.getSize();
      const height = size != null && size.length > 0 ? size[1] : 0;
      optOptions = {
        maxZoom: this.map.getView().getZoom(),
        duration: 500,
        size,
      };
    }
    this.map.getView().fit(geometryOrExtent, optOptions);
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

  private _getNearestFeatureOfLayer(
    layer: VectorLayer,
    evt: MapBrowserEvent<UIEvent>,
  ): Feature<Geometry> {
    const precision = this.map.getView().getResolution() * DEF_MAP_CLUSTER_CLICK_TOLERANCE;
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

  private _getIcnFromTaxonomies(taxonomyIdentifiers: string[]): string {
    const excludedIcn = ['poi_type_poi', 'theme_ucvs'];
    const res = taxonomyIdentifiers.filter(
      p => excludedIcn.indexOf(p) === -1 && p.indexOf('poi_type') > -1,
    );
    return res.length > 0 ? res[0] : taxonomyIdentifiers[0];
  }
}
