import {createFeatureSelector, createSelector} from '@ngrx/store';

import {confFeatureKey} from './conf.reducer';
import {elasticAll} from '../elastic/elastic.selector';
import {getCSSVariables} from '../../functions/theme';

const confFeature = createFeatureSelector<ICONF>(confFeatureKey);

export const confAPP = createSelector(confFeature, state => state.APP);
export const confLANGUAGES = createSelector(confFeature, state => state.LANGUAGES);
export const confOPTIONS = createSelector(confFeature, state => state.OPTIONS);
export const confAUTH = createSelector(confFeature, state => state.AUTH);

export const confMAP = createSelector(confFeature, state => {
  return state.MAP;
});
export const confMAPLAYERS = createSelector(confMAP, map => map.layers);
export const confTHEME = createSelector(confFeature, state => state.THEME);

export const confTHEMEVariables = createSelector(confTHEME, (theme: ITHEME) =>
  getCSSVariables(theme),
);

export const confHOME = createSelector(confFeature, elasticAll, (state, all) => {
  if (state.HOME != null && state.MAP != null && state.MAP.layers != null) {
    const home: IHOME[] = [];
    state.HOME.forEach(el => {
      if (el.box_type === 'layer') {
        const layer: ILAYER = getLayer(el.layer as number, state.MAP.layers, all);

        home.push({...el, layer});
      } else {
        home.push(el);
      }
    });
    return home;
  }

  return state.HOME;
});

const getLayer = (layersID: number, layers: ILAYER[], tracks: IHIT[]) => {
  const layer = layers.filter(l => +l.id === +layersID)[0] || undefined;
  const tracksObj: {[layerID: number]: IHIT[]} = {};

  (tracks || []).forEach(track => {
    track.layers.forEach(l => {
      if (+layersID === +l) {
        tracksObj[l] = tracksObj[l] != null ? [...tracksObj[l], track] : [track];
      }
    });
  });
  return {...layer, ...{tracks: tracksObj}};
};
