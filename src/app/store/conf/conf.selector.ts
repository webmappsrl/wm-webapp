import {createFeatureSelector, createSelector} from '@ngrx/store';
import {getCSSVariables} from '../../functions/theme';
import {elasticAll} from '../elastic/elastic.selector';
import {confFeatureKey} from './conf.reducer';

const confFeature = createFeatureSelector<ICONF>(confFeatureKey);

export const confAPP = createSelector(confFeature, state => state.APP);
export const confLANGUAGES = createSelector(confFeature, state => state.LANGUAGES);
export const confOPTIONS = createSelector(confFeature, state => state.OPTIONS);
export const confAUTH = createSelector(confFeature, state => state.AUTH);

export const confMAP = createSelector(confFeature, state => state.MAP);
export const confMAPLAYERS = createSelector(confMAP, map => map.layers);
export const confTHEME = createSelector(confFeature, state => state.THEME);

export const confTHEMEVariables = createSelector(confTHEME, (theme: ITHEME) =>
  getCSSVariables(theme),
);

export const confHOME = createSelector(confFeature, elasticAll, (state, all) => {
  if (state.HOME != null && state.MAP != null && state.MAP.layers != null) {
    const home: IHOME[] = [];
    state.HOME.forEach(el => {
      if (el.terms != null) {
        const terms = getLayers(el.terms, state.MAP.layers, all);

        home.push({...el, terms});
      }
    });
    return home;
  }

  return state.HOME;
});

const getLayers = (layersID: number[], layers: ILAYER[], tracks: IHIT[]) => {
  return layers
    .filter(l => layersID.indexOf(+l.id) > -1)
    .map(el => {
      if (tracks != null) {
        const tracksObj: {[layerID: number]: IHIT[]} = {};
        tracks.forEach(track => {
          track.layers.forEach(l => {
            if (layersID.indexOf(l) > -1) {
              tracksObj[l] = tracksObj[l] != null ? [...tracksObj[l], track] : [track];
            }
          });
        });
        return {...el, ...{tracks: tracksObj}};
      }
      return el;
    });
};
