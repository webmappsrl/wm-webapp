import {createReducer, on} from '@ngrx/store';
import {loadConfSuccess} from './conf.actions';
import {IConf} from './model';

export const confFeatureKey = 'conf';
export interface IConfRootState {
  [confFeatureKey]: IConf;
}
const initialConfState: IConf = {
  APP: {
    name: 'Webmapp',
  },
  THEME: {
    primary: '#3880ff',
    secondary: '#0cd1e8',
    tertiary: '#ff0000',
    select: 'rgba(226, 249, 0, 0.6)',
    success: '#10dc60',
    warning: '#ffce00	',
    danger: '#f04141',
    dark: '#000000',
    medium: '#989aa2',
    light: '#ffffff',
    fontXxxlg: '28px',
    fontXxlg: '25px',
    fontXlg: '22px',
    fontLg: '20px',
    fontMd: '17px',
    fontSm: '14px',
    fontXsm: '12px',
    fontFamilyHeader: 'Roboto Slab',
    fontFamilyContent: 'Roboto',
    defaultFeatureColor: '#000000',
    theme: 'webmapp',
  },
  error: '',
};
export const confReducer = createReducer(
  initialConfState,
  on(loadConfSuccess, (state, {conf}) => {
    localStorage.setItem('appname', state.APP.name);
    return {
      ...state,
      ...{APP: {...state.APP, ...conf.APP}, THEME: {...state.THEME, ...conf.THEME}},
    };
  }),
);
