import {createReducer, on} from '@ngrx/store';
import {loadConfSuccess} from './conf.actions';

export const confFeatureKey = 'conf';
export interface IConfRootState {
  [confFeatureKey]: ICONF;
}
const initialConfState: ICONF = {
  APP: {
    name: 'Webmapp',
    geohubId: 3,
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
};
export const confReducer = createReducer(
  initialConfState,
  on(loadConfSuccess, (state, {conf}) => {
    localStorage.setItem('appname', state.APP.name);
    return {
      ...state,
      ...{
        APP: {...state.APP, ...conf.APP},
        THEME: {...state.THEME, ...conf.THEME},
        LANGUAGES: {...state.LANGUAGES, ...conf.LANGUAGES},
      },
    };
  }),
);
