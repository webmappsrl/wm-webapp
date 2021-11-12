import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnDestroy,
  ViewChild,
} from '@angular/core';

// ol imports
import Map from 'ol/Map';
import TileLayer from 'ol/layer/Tile';
import View from 'ol/View';
import XYZ from 'ol/source/XYZ';
import { defaults as defaultInteractions } from 'ol/interaction.js';
import { Subject } from 'rxjs';
import { MapService } from 'src/app/services/map.service';

@Component({
  selector: 'webmapp-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
})
export class MapComponent implements AfterViewInit, OnDestroy {
  @ViewChild('map') mapDiv: ElementRef;

  @Input('start-view') startView: number[] = [10.4147, 43.7118, 9];

  public mapDegrees: number;

  private _destroyer: Subject<boolean> = new Subject<boolean>();

  private _view: View;
  private _map: Map;

  constructor(private _mapService: MapService) {}

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
      target: this.mapDiv.nativeElement,
      view: this._view,
      controls: [],
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

    //TODO: figure out why this must be called inside a timeout
    setTimeout(() => {
      this._map.updateSize();
    }, 0);

    // this._map.on('click', (evt) => {
    //   this._mapClick(evt);
    // });
  }

  ngOnDestroy() {
    this._destroyer.next(true);
  }

  public orientNorth() {
    this._view.animate({
      duration: 500,
      rotation: 0,
    });
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
}
