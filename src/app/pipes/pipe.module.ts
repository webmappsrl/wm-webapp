import {WmPipeModule} from './../shared/wm-core/pipes/pipe.module';
import {BuildSvgDirective} from './build-svg.directive';
import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {WmGetFilterIcnPipe} from './webmapp-get-filter-icn.pipe';
import {WmGetIcnPipe} from './webmapp-get-icn.pipe';

@NgModule({
  declarations: [WmGetIcnPipe, WmGetFilterIcnPipe, BuildSvgDirective],
  imports: [CommonModule, WmPipeModule],
  exports: [WmGetIcnPipe, WmGetFilterIcnPipe, BuildSvgDirective, WmPipeModule],
})
export class PipeModule {}
