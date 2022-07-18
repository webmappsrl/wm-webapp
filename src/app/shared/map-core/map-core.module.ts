import {CommonModule} from '@angular/common';
import {IonicModule} from '@ionic/angular';
import {NgModule} from '@angular/core';
import {WmMapComponent} from './component/map.component';
import {WmMapControls} from './component/controls.map';
import {WmMapLayerDirective} from './layer.directive';
import {WmMapPoisDirective} from './pois.directive';
import {WmMapRelatedPoisDirective} from './related-pois.directive';
import {WmMapTrackDirective} from './track.directive';
const directives = [
  WmMapTrackDirective,
  WmMapLayerDirective,
  WmMapRelatedPoisDirective,
  WmMapPoisDirective,
];
const components = [WmMapComponent, WmMapControls];

@NgModule({
  declarations: [...components, ...directives],
  imports: [CommonModule, IonicModule],
  exports: [...components, ...directives],
})
export class WmMapModule {}
