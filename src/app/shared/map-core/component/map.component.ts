import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  ViewEncapsulation,
} from '@angular/core';
import {DEF_MAP_MAX_ZOOM, DEF_MAP_MIN_ZOOM, DEF_XYZ_URL, initExtent} from '../constants';
import View, {FitOptions} from 'ol/View';

import {BehaviorSubject} from 'rxjs';
import Collection from 'ol/Collection';
import {Extent} from 'ol/extent';
import {Interaction} from 'ol/interaction';
import Map from 'ol/Map';
import {MapService} from 'src/app/services/map.service';
import SimpleGeometry from 'ol/geom/SimpleGeometry';
import TileLayer from 'ol/layer/Tile';
import XYZ from 'ol/source/XYZ';
import {defaults as defaultControls} from 'ol/control';
import {defaults as defaultInteractions} from 'ol/interaction.js';

@Component({
  selector: 'wm-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class WmMapComponent implements OnChanges {
  private _centerExtent: Extent;
  private _view: View;

  @Input() conf: IMAP;
  @Input() padding: number[];

  map: Map;
  map$: BehaviorSubject<Map> = new BehaviorSubject<Map | null>(null);

  constructor(private _mapSvc: MapService) {}

  @Input() set reset(_) {
    this._reset();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes.conf != null &&
      changes.conf.currentValue != null &&
      changes.conf.previousValue == null
    ) {
      this._initMap(this.conf);
    }
  }

  private _fitView(geometryOrExtent: SimpleGeometry | Extent, optOptions?: FitOptions): void {
    if (optOptions == null) {
      optOptions = {
        duration: 500,
      };
    }
    console.log('fit view');
    this._view.fit(geometryOrExtent, optOptions);
  }

  private _initDefaultInteractions(): Collection<Interaction> {
    return defaultInteractions({
      doubleClickZoom: true,
      dragPan: true,
      mouseWheelZoom: true,
      pinchRotate: false,
      altShiftDragRotate: false,
    });
  }

  private _initMap(conf: IMAP): void {
    this._centerExtent = this._mapSvc.extentFromLonLat(conf.bbox ?? initExtent);
    this._view = new View({
      maxZoom: conf.maxZoom,
      zoom: conf.defZoom || 10,
      minZoom: conf.minZoom,
      projection: 'EPSG:3857',
      constrainOnlyCenter: true,
      padding: this.padding,
    });

    if (conf.bbox) {
      this._fitView(this._centerExtent);
    }

    this.map = new Map({
      view: this._view,
      controls: defaultControls({
        attribution: false,
        rotate: false,
        zoom: false,
      }),
      interactions: this._initDefaultInteractions(),
      layers: this._buildTileLayers(conf.tiles),
      moveTolerance: 3,
      target: 'ol-map',
    });
    this.map$.next(this.map);
  }

  private _buildTileLayers(tiles: string[]): TileLayer[] {
    return (
      tiles.map((tile, index) => {
        return new TileLayer({
          source: this._initializeBaseSource(tile),
          visible: true,
          zIndex: index,
        });
      }) ?? [
        new TileLayer({
          source: this._initializeBaseSource(DEF_XYZ_URL),
          visible: true,
          zIndex: 0,
        }),
      ]
    );
  }

  /**
   * Initialize the base source of the map
   *
   * @returns the XYZ source to use
   */
  private _initializeBaseSource(tile: string) {
    return new XYZ({
      maxZoom: this.conf.maxZoom || DEF_MAP_MAX_ZOOM,
      minZoom: this.conf.minZoom || DEF_MAP_MIN_ZOOM,
      url: tile,
      projection: 'EPSG:3857',
      tileSize: [256, 256],
    });
  }

  private _reset(): void {
    if (this._view != null) {
      console.log('reset');
      this._view.fit(this._centerExtent);
    }
  }
}
