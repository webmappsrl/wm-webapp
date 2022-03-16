/* eslint-disable @typescript-eslint/naming-convention */
export interface IConfDic {
  [name: string]: string | number | boolean | number[] | IConfDic;
}

export interface IConfAPP {
  name: string;
  id?: string;
  customerName?: string;
  appStoreUrl?: string;
  googlePlayUrl?: string;
}

export interface IConfTHEME extends ITHEME {
  primary: string;
  secondary: string;
  tertiary: string;
  select: string;
  success: string;
  warning: string;
  danger: string;
  dark: string;
  medium: string;
  light: string;
  fontXxxlg: string;
  fontXxlg: string;
  fontXlg: string;
  fontLg: string;
  fontMd: string;
  fontSm: string;
  fontXsm: string;
  fontFamilyHeader: string;
  fontFamilyContent: string;
  defaultFeatureColor: string;
  theme: string;
}

export interface IConf {
  APP: IConfAPP;
  THEME: IConfTHEME;
  error: string;
}
export interface IConfState {
  APP: IConfAPP;
  THEME: IConfTHEME;
  loading: boolean;
}
export interface IState {
  conf: IConfState;
}
