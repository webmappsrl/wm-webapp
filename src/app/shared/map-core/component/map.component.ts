import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  ViewEncapsulation,
} from '@angular/core';
import Map from 'ol/Map';
import TileLayer from 'ol/layer/Tile';
import View, {FitOptions} from 'ol/View';
import XYZ from 'ol/source/XYZ';
import {defaults as defaultControls} from 'ol/control';
import {Interaction} from 'ol/interaction';
import {defaults as defaultInteractions} from 'ol/interaction.js';
import {BehaviorSubject} from 'rxjs';
import {Extent} from 'ol/extent';
import Collection from 'ol/Collection';
import {MapService} from 'src/app/services/map.service';
import {DEF_MAP_MAX_ZOOM, DEF_MAP_MIN_ZOOM, initExtent} from '../constants';
import {transformExtent} from 'ol/proj';
import SimpleGeometry from 'ol/geom/SimpleGeometry';
import {Store} from '@ngrx/store';
import {IpoisRootState} from 'src/app/store/pois/pois.reducer';

@Component({
  selector: 'wm-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class WmMapComponent implements OnChanges {
  private _centerExtent: Extent;
  private _defZoom: number;
  private _view: View;

  @Input() conf: IMAP;
  @Input() padding: number[];

  map: Map;
  map$: BehaviorSubject<Map> = new BehaviorSubject<Map | null>(null);

  constructor(private _mapSvc: MapService, private _store: Store<IpoisRootState>) {}

  @Input() set reset(_) {
    this._reset();
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log(changes['conf']);
    if (
      changes['conf'] != null &&
      changes['conf'].currentValue != null &&
      changes['conf'].previousValue == null
    ) {
      this._initMap(this.conf);
    }
  }

  private _fitView(geometryOrExtent: SimpleGeometry | Extent, optOptions?: FitOptions): void {
    console.log('asd');
    if (optOptions == null) {
      optOptions = {
        duration: 500,
        maxZoom: this._view.getZoom(),
      };
    }
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
      zoom: conf.defZoom ?? 10,
      maxZoom: conf.maxZoom,
      minZoom: conf.minZoom,
      projection: 'EPSG:3857',
      constrainOnlyCenter: true,
      extent: this._centerExtent,
    });

    if (conf.bbox) {
      this._fitView(this._centerExtent, {
        duration: 500,
        maxZoom: conf.defZoom,
      });
    }
    if (conf.defZoom) {
      this._defZoom = conf.defZoom;
      this._view.setZoom(conf.defZoom);
    }

    this.map = new Map({
      view: this._view,
      controls: defaultControls({
        attribution: false,
        rotate: false,
        zoom: false,
      }),
      interactions: this._initDefaultInteractions(),
      layers: [
        new TileLayer({
          source: this._initializeBaseSource(),
          visible: true,
          zIndex: 0,
        }),
      ],
      moveTolerance: 3,
      target: 'ol-map',
    });
    this.map$.next(this.map);
  }

  /**
   * Initialize the base source of the map
   *
   * @returns the XYZ source to use
   */
  private _initializeBaseSource() {
    return new XYZ({
      maxZoom: DEF_MAP_MAX_ZOOM,
      minZoom: DEF_MAP_MIN_ZOOM,
      url: 'https://api.webmapp.it/tiles/{z}/{x}/{y}.png',
      projection: 'EPSG:3857',
      tileSize: [256, 256],
    });
  }

  private _reset(): void {
    if (this._view != null) {
      this._view.fit(this._centerExtent);
      this._view.setZoom(this._defZoom);
    }
  }
}
