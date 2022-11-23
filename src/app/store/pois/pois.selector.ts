import {createFeatureSelector, createSelector} from '@ngrx/store';

import {IGeojsonFeature} from 'src/app/types/model';
import {confFeatureKey} from './pois.reducer';
import {confPoisIcons} from '../conf/conf.selector';

export const poisFeature = createFeatureSelector<IGeojsonFeature>(confFeatureKey);
export const pois = createSelector(poisFeature, confPoisIcons, (state, icons) => {
  let s = state as any;
  if (s != null && s.features != null && icons != null) {
    const iconKeys = Object.keys(icons);
    const features = s.features.map(f => {
      if (f != null && f.properties != null && f.properties.taxonomyIdentifiers != null) {
        const filteredArray = f.properties.taxonomyIdentifiers.filter(value =>
          iconKeys.includes(value),
        );
        if (filteredArray.length > 0) {
          let p = {...f.properties, ...{svgIcon: icons[filteredArray[0]]}};

          return {...f, ...{properties: p}};
        }
      }
      return f;
    });
    return {...s, ...{features: features}};
  }
  return s;
});
