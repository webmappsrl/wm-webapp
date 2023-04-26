import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {WmMapModule} from './map-core/src/map-core.module';
const components = [];
@NgModule({
  declarations: components,
  imports: [CommonModule, WmMapModule],
  exports: [...components, WmMapModule],
})
export class SharedModule {}
