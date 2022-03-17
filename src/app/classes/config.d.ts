interface ITHEME {
  primary?: string;
  secondary?: string;
  tertiary?: string;
  select?: string;
  success?: string;
  warning?: string;
  danger?: string;
  dark?: string;
  medium?: string;
  light?: string;
  fontXxxlg?: string;
  fontXxlg?: string;
  fontXlg?: string;
  fontLg?: string;
  fontMd?: string;
  fontSm?: string;
  fontXsm?: string;
  fontFamilyHeader?: string;
  fontFamilyContent?: string;
  defaultFeatureColor?: string;
  theme?: string;
}
interface ILANGUAGES {
  default?: string;
  available?: string[];
}

interface IAPP {
  name: string;
  geohubId: number;
  id?: string;
  customerName?: string;
  appStoreUrl?: string;
  googlePlayUrl?: string;
}

interface IHOME {
  view: string;
  title?: string;
  subtitle?: string;
  taxonomy?: string;
  types?: string[];
  terms?: string[];
  features?: string[];
  url?: string;
  color?: string;
  noElements?: string;
}
interface IOPTIONS {
  trackRefLabelZoom: number;
  caiScaleStyleZoom: number;
  poiSelectedRadius: number;
  poiMaxRadius: number;
  poiMinZoom: number;
  poiIconRadius: number;
  poiIconZoom: number;
  poiMinRadius: number;
  poiLabelMinZoom: number;
  minDynamicOverlayLayersZoom: number;
  baseUrl: string;
  startUrl: string;
  privacyUrl: string;
  passwordRecoveryUrl: string;
  hideGlobalMap: boolean;
  addArrowsOverTracks: boolean;
  showTrackRefLabel: boolean;
  useCaiScaleStyle: boolean;
  forceDefaultFeatureColor: boolean;
  useFeatureClassicSelectionStyle: boolean;
  downloadRoutesInWebapp: boolean;
  showPoiListOffline: boolean;
  showHelp: boolean;
  hideDisclaimer: boolean;
  showDifficultyLegend: boolean;
  showEditLink: boolean;
  hideSearch: boolean;
  hideFilters: boolean;
  startFiltersDisabled: boolean;
  resetFiltersAtStartup: boolean;
  showMapViewfinder: boolean;
  highlightMapButton: boolean;
  hideNewsletterInSignup: boolean;
  forceWelcomePagePopup: boolean;
  skipRouteIndexDownload: boolean;
  downloadFullGemoetryRouteIndex: boolean;
  enableTrackAdoption: boolean;
  highlightReadMoreButton: boolean;
  clustering: ICLUSTERING;
  showAppDownloadButtons: IAPPDOWNLOADBUTTONS;
  maxFitZoom?: number;
  detailsMapBehaviour?: IDETAILSMAPBEHAVIOUR;
  beBaseUrl?: string;
  termsAndConditionsUrl?: string;
  voucherUrl?: string;
  customBackgroundImageUrl?: string;
  trackAdoptionUrl?: string;
  trackReconnaissanceUrl?: string;
  galleryAnimationType?: string;
  mapAttributions?: IMAPATTRIBUTION[];
}
interface IAUTH {
  enable?: boolean;
  showAtStartup?: boolean;
  loginToGeohub?: boolean;
  force?: boolean;
  skipToDownloadPublicRoute?: boolean;
  hideCountry?: boolean;
  customCreatePostRoles?: boolean;
  facebook?: IFACEBOOK;
  google?: IGOOGLE;
}

interface IMAP {
  maxZoom: number;
  minZoom: number;
  defZoom: number;
  center: [number, number];
  bbox: [number, number, number, number];
  layers?: ILAYERS;
  overlays?: IOVERLAYERS;
}

interface ILAYERS {
  id: string;
  name: string;
  type: string;
  tilesUrl: string;
  opacity: number;
  tileSize?: number | [number, number];
  default?: boolean;
  grayscale?: number;
  params?: {[id: string]: string};
}
interface IOVERLAYERS {
  id: string;
  type: string;
  tilesUrl: string;
  minZoom?: number;
  maxZoom?: number;
  fill_opacity?: number;
  stroke_width?: number;
  stroke_opacity?: number;
  line_dash?: number[];
  zindex?: number;
  icon?: string;
  name?: string;
  description?: string;
  color?: string;
  fill_color?: string;
  geojsonUrl?: string;
  noDetails?: boolean;
  noInteraction?: boolean;
  preventFilter?: boolean;
  invertPolygons?: boolean;
  alert?: boolean;
  show_label?: boolean;
  createTaxonomy?: ITAXONOMY;
  params?: {[id: string]: string};
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
  radius: number;
  highZoomRadius: number;
  highZoom?: number;
}
interface IMAPATTRIBUTION {
  label?: string;
  url?: string;
}
interface IAPPDOWNLOADBUTTONS {
  track: boolean;
  poi: boolean;
  route: boolean;
  all: boolean;
}
interface ICONF {
  APP: IAPP;
  OPTIONS: IOPTIONS;
  MAP?: IMAP;
  AUTH?: IAUTH;
  LANGUAGES?: ILANGUAGES;
  THEME?: ITHEME;
  HOME?: IHOME;
}
