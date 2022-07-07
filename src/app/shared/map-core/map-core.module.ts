import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {WmMapTrackDirective} from './track.directive';
import {WmMapLayerDirective} from './layer.directive';
import {WmMapComponent} from './component/map.component';
import {WmMapRelatedPoisDirective} from './related-pois.directive';
import {WmMapPoisDirective} from './pois.directive';
const directives = [
  WmMapTrackDirective,
  WmMapLayerDirective,
  WmMapRelatedPoisDirective,
  WmMapPoisDirective,
];
const components = [WmMapComponent];

@NgModule({
  declarations: [...components, ...directives],
  imports: [CommonModule],
  exports: [...components, ...directives],
})
export class WmMapModule {}
