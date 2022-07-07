import View, {FitOptions} from 'ol/View';
import SimpleGeometry from 'ol/geom/SimpleGeometry';
import {Extent} from 'ol/extent';
import Map from 'ol/Map';
import {Directive, Input} from '@angular/core';
import {transformExtent} from 'ol/proj';
@Directive()
export abstract class WmMaBaseDirective {
  @Input() map: Map;

  extentFromLonLat(extent: Extent): Extent {
    return transformExtent(extent, 'EPSG:4326', 'EPSG:3857');
  }

  fitView(geometryOrExtent: SimpleGeometry | Extent, optOptions?: FitOptions): void {
    const view = this.map.getView();
    if (view != null) {
      if (optOptions == null) {
        optOptions = {
          duration: 500,
        };
      }
      console.log('fit view ', geometryOrExtent);
      view.fit(this.extentFromLonLat(geometryOrExtent as any), optOptions);
    }
  }
}
