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
interface ICONF {
  APP: IAPP;
  LANGUAGES?: ILANGUAGES;
  THEME?: ITHEME;
  HOME?: IHOME;
}
