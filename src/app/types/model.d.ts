import { EGeojsonGeometryTypes } from './egeojson-geometry-types.enum';

export type IPoint = [number, number, number?];
export type ILineString = Array<IPoint>;
export type IMultiLineString = Array<Array<IPoint>>;
export type IPolygon = Array<Array<IPoint>>;
export type IMultiPolygon = Array<Array<Array<IPoint>>>;

/**
 * Define the supported geometries
 */
export interface IGeojsonGeometry {
  type: EGeojsonGeometryTypes;
  coordinates:
    | IPoint
    | ILineString
    | IMultiLineString
    | IPolygon
    | IMultiPolygon;
}

export interface ILocaleString {
  it?: string;
  en?: string;
}

/**
 * Define the supported properties
 */
export interface IGeojsonProperties {
  [_: string]: any; // allow to work with custom properties when needed
  id: number;

  mbtiles?: string[];
  created_at?: Date;
  updated_at?: Date;
  name?: ILocaleString;
  description?: ILocaleString;
  excerpt?: ILocaleString;
  source_id?: string;
  import_method?: string;
  source?: string;
  distance_comp?: number;
  user_id?: number;
  audio?: string;
  distance?: number;
  ascent?: number;
  descent?: number;
  ele_from?: number;
  ele_to?: number;
  ele_min?: number;
  ele_max?: number;
  duration_forward?: number;
  duration_backward?: number;
  difficulty?: ILocaleString;
  geojson_url?: string;
  kml_url?: string;
  gpx_url?: string;
  feature_image?: IWmImage;
  image?: IWmImage;
  image_gallery?: IWmImage[];
  taxonomy?: {
    activity?: string[];
    where?: string[];
  };
  duration?: {
    hiking?: {
      forward?: number;
      backward?: number;
    };
  };
  related_pois?: IGeojsonFeature[];
}

/**
 * Define a feature
 */
export interface IGeojsonFeature {
  type: 'Feature';
  properties: IGeojsonProperties;
  geometry: IGeojsonGeometry;
}

export interface IGeojsonFeatureDownloaded extends IGeojsonFeature {
  size: number;
}

export interface IWmImage {
  id: number;
  url: string;
  caption: string;
  api_url: string;
  sizes: {
    '108x148': string;
    '108x137': string;
    '225x100': string;
    '250x150': string;
    '118x138': string;
    '108x139': string;
    '118x117': string;
    '335x250': string;
    '400x200': string;
    '1440x500': string;
  };
}

export interface IGeojsonGeneric {
  type: string;
  geometry: IGeojsonGeometry;
  properties: any;
}
export interface IGeojsonCluster extends IGeojsonGeneric {
  type: 'Feature';
  properties: {
    ids: number[]; // Id di Ec Track che fanno parte del cluster
    images: string[]; // Massimo 3 url di immagini ottimizzate
    bbox: number[]; // Extent di tutte le ec track assieme
  };
}

export interface IGeojsonPoi extends IGeojsonGeneric {
  type: 'Point';
  properties: {
    id: number; // Id del poi
    image: string; // url image
  };
  isSmall?: boolean;
}

export interface IGeojsonPoiDetailed extends IGeojsonPoi {
  properties: {
    id: number; // Id del poi
    image: string; // url image
    images: string[]; // url images
    name: ILocaleString;
    description: ILocaleString;
    email?: string;
    phone?: string;
    address?: string;
    url?: string;
  };
}
export interface IGeojsonClusterApiResponse {
  features: IGeojsonCluster[];
}

export interface WhereTaxonomy {
  id: 9;
  created_at: Date;
  updated_at: Date;
  name: ILocaleString;
  import_method: string;
  source_id: number;
  admin_level: number;
  description: string;
  // excerpt: null,
  // source: null,
  // user_id: null,
  // identifier: toscana,
  // icon: null,
  // color: null,
  // zindex: null,
  // feature_image: null,
  // stroke_width: null,
  // stroke_opacity: null,
  // line_dash: null,
  // min_visible_zoom: null,
  // min_size_zoom: null,
  // min_size: null,
  // max_size: null,
  // icon_zoom: null,
  // icon_size: null
}
