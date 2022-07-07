interface ITHEME {
  danger?: string;
  dark?: string;
  defaultFeatureColor?: string;
  fontFamilyContent?: string;
  fontFamilyHeader?: string;
  fontLg?: string;
  fontMd?: string;
  fontSm?: string;
  fontXlg?: string;
  fontXsm?: string;
  fontXxlg?: string;
  fontXxxlg?: string;
  light?: string;
  medium?: string;
  primary?: string;
  secondary?: string;
  select?: string;
  success?: string;
  tertiary?: string;
  theme?: string;
  warning?: string;
}
interface ILANGUAGES {
  available?: string[];
  default?: string;
}

interface IAPP {
  appStoreUrl?: string;
  customerName?: string;
  geohubId: number;
  googlePlayUrl?: string;
  id?: string;
  name: string;
}

interface IHOME {
  color?: string;
  features?: string[];
  noElements?: string;
  subtitle?: string;
  taxonomy?: string;
  terms?: any[];
  title?: string;
  types?: string[];
  url?: string;
  view: string;
}
interface IOPTIONS {
  addArrowsOverTracks: boolean;
  baseUrl: string;
  beBaseUrl?: string;
  caiScaleStyleZoom: number;
  clustering: ICLUSTERING;
  customBackgroundImageUrl?: string;
  detailsMapBehaviour?: IDETAILSMAPBEHAVIOUR;
  downloadFullGemoetryRouteIndex: boolean;
  downloadRoutesInWebapp: boolean;
  enableTrackAdoption: boolean;
  forceDefaultFeatureColor: boolean;
  forceWelcomePagePopup: boolean;
  galleryAnimationType?: string;
  hideDisclaimer: boolean;
  hideFilters: boolean;
  hideGlobalMap: boolean;
  hideNewsletterInSignup: boolean;
  hideSearch: boolean;
  highlightMapButton: boolean;
  highlightReadMoreButton: boolean;
  mapAttributions?: IMAPATTRIBUTION[];
  maxFitZoom?: number;
  minDynamicOverlayLayersZoom: number;
  passwordRecoveryUrl: string;
  poiIconRadius: number;
  poiIconZoom: number;
  poiLabelMinZoom: number;
  poiMaxRadius: number;
  poiMinRadius: number;
  poiMinZoom: number;
  poiSelectedRadius: number;
  privacyUrl: string;
  resetFiltersAtStartup: boolean;
  showAppDownloadButtons: IAPPDOWNLOADBUTTONS;
  showDifficultyLegend: boolean;
  showEditLink: boolean;
  showHelp: boolean;
  showMapViewfinder: boolean;
  showPoiListOffline: boolean;
  showTrackRefLabel: boolean;
  skipRouteIndexDownload: boolean;
  startFiltersDisabled: boolean;
  startUrl: string;
  termsAndConditionsUrl?: string;
  trackAdoptionUrl?: string;
  trackReconnaissanceUrl?: string;
  trackRefLabelZoom: number;
  useCaiScaleStyle: boolean;
  useFeatureClassicSelectionStyle: boolean;
  voucherUrl?: string;
}
interface IAUTH {
  customCreatePostRoles?: boolean;
  enable?: boolean;
  facebook?: IFACEBOOK;
  force?: boolean;
  google?: IGOOGLE;
  hideCountry?: boolean;
  loginToGeohub?: boolean;
  showAtStartup?: boolean;
  skipToDownloadPublicRoute?: boolean;
}

interface IMAP {
  bbox: [number, number, number, number];
  center?: [number, number];
  defZoom: number;
  layers?: ILAYER[];
  maxZoom: number;
  minZoom: number;
}
interface ILAYER {
  bbox: [number, number, number, number];
  behaviour: {[name: string]: string};
  data_use_bbox: boolean;
  data_use_only_my_data: boolean;
  description: string;
  icon?: any;
  id: string;
  name: string;
  params?: {[id: string]: string};
  style: {[name: string]: string};
  subtitle: string;
  title: string;
  tracks?: {[name: string]: IHIT[]};
}
interface IOVERLAYERS {
  alert?: boolean;
  color?: string;
  createTaxonomy?: ITAXONOMY;
  description?: string;
  fill_color?: string;
  fill_opacity?: number;
  geojsonUrl?: string;
  icon?: string;
  id: string;
  invertPolygons?: boolean;
  line_dash?: number[];
  maxZoom?: number;
  minZoom?: number;
  name?: string;
  noDetails?: boolean;
  noInteraction?: boolean;
  params?: {[id: string]: string};
  preventFilter?: boolean;
  show_label?: boolean;
  stroke_opacity?: number;
  stroke_width?: number;
  tilesUrl: string;
  type: string;
  zindex?: number;
}

type IDETAILSMAPBEHAVIOUR = 'all' | 'track' | 'poi' | 'route';
type ITAXONOMY = 'activity' | 'theme' | 'when' | 'where' | 'who' | 'webmapp_category';

interface IFACEBOOK {
  id: string;
  name: string;
}
interface IGOOGLE {
  id: string;
  iosId: string;
  name: string;
}
interface ICLUSTERING {
  enable: boolean;
  highZoom?: number;
  highZoomRadius: number;
  radius: number;
}
interface IMAPATTRIBUTION {
  label?: string;
  url?: string;
}
interface IAPPDOWNLOADBUTTONS {
  all: boolean;
  poi: boolean;
  route: boolean;
  track: boolean;
}
interface ICONF {
  APP: IAPP;
  AUTH?: IAUTH;
  HOME?: IHOME[];
  LANGUAGES?: ILANGUAGES;
  MAP?: IMAP;
  OPTIONS: IOPTIONS;
  THEME?: ITHEME;
}
