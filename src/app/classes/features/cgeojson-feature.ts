import {Feature} from 'ol';
import Geometry from 'ol/geom/Geometry';
import {EGeojsonGeometryTypes} from 'src/app/types/egeojson-geometry-types.enum';
import {IGeojsonFeature, IGeojsonGeometry, IGeojsonProperties} from 'src/app/types/model';

export abstract class CGeojsonFeature implements IGeojsonFeature {
  public readonly type = 'Feature';

  protected _geometry: IGeojsonGeometry;
  protected _properties: IGeojsonProperties;

  constructor() {
    this._properties = {
      id: null,
    };
  }

  public get geojson(): IGeojsonFeature {
    return {
      type: this.type,
      properties: this.properties,
      geometry: this.geometry,
    };
  }

  public get geometry(): IGeojsonGeometry {
    return this?._geometry;
  }

  public get geometryType(): EGeojsonGeometryTypes {
    return this?._geometry?.type;
  }

  public get id(): number {
    return this?._properties?.id;
  }

  public get properties(): IGeojsonProperties {
    return this?._properties;
  }

  public setProperty(property: string, value: any): void {
    this._properties[property] = value;
  }

  public abstract setGeometry(geometry: IGeojsonGeometry): void;
}

export interface IMarker {
  icon: Feature<Geometry>;
  id: string;
}

export interface IPoiMarker extends IMarker {
  poi: IGeojsonFeature;
}
