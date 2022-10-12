import {createFeatureSelector, createSelector} from '@ngrx/store';

import {confFeatureKey} from './conf.reducer';
import {elasticAll} from '../elastic/elastic.selector';
import {getCSSVariables} from '../../functions/theme';

const confFeature = createFeatureSelector<ICONF>(confFeatureKey);

export const confAPP = createSelector(confFeature, state => state.APP);
export const confWEBAPP = createSelector(confFeature, state => state.WEBAPP);
export const confLANGUAGES = createSelector(confFeature, state => state.LANGUAGES);
export const confOPTIONS = createSelector(confFeature, state => state.OPTIONS);
export const confAUTH = createSelector(confFeature, state => state.AUTH);

export const confMAP = createSelector(confFeature, state => state.MAP);
export const confMAPLAYERS = createSelector(confMAP, map => map.layers ?? undefined);
export const confPOISFilter = createSelector(confMAP, map => {
  if (map != null && map.pois != null && map.pois.taxonomies != null) {
    return map.pois.taxonomies;
  }
  return undefined;
});
export const confPoisIcons = createSelector(confPOISFilter, taxonomies => {
  const res = {};
  if (taxonomies != null && taxonomies.poi_type != null) {
    const icons = taxonomies.poi_type.filter(p => p.icon != null);
    icons.forEach(icon => {
      res[icon.identifier] = icon.icon;
    });
  }

  return res;
});
export const confTHEME = createSelector(confFeature, state => state.THEME);
export const confPROJECT = createSelector(confFeature, state => state.PROJECT);

export const confTHEMEVariables = createSelector(confTHEME, (theme: ITHEME) =>
  getCSSVariables(theme),
);
export const confShowDrawTrack = createSelector(confWEBAPP, state => state.draw_track_show);
export const confShowEditingInline = createSelector(confWEBAPP, state => state.editing_inline_show);
export const confHOME = createSelector(confFeature, elasticAll, (state, all) => {
  if (state.HOME != null && state.MAP != null && state.MAP.layers != null) {
    const home: IHOME[] = [];
    state.HOME.forEach(el => {
      if (el.box_type === 'layer') {
        const l: ILAYER = getLayer(el.layer as number, state.MAP.layers, all);
        // if defined apply conf layer title
        const layer = {...l, ...{title: el.title ?? l.title}} as ILAYER;
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
