import {WmPipeModule} from './../shared/wm-core/pipes/pipe.module';
import {BuildSvgDirective} from './build-svg.directive';
import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {WmGetFilterIcnPipe} from './webmapp-get-filter-icn.pipe';
import {WmGetIcnPipe} from './webmapp-get-icn.pipe';
import {WmToArrayPipe} from './webmapp-to-array.pipe';

@NgModule({
  declarations: [WmGetIcnPipe, WmGetFilterIcnPipe, WmToArrayPipe, BuildSvgDirective],
  imports: [CommonModule, WmPipeModule],
  exports: [WmGetIcnPipe, WmGetFilterIcnPipe, WmToArrayPipe, BuildSvgDirective, WmPipeModule],
})
export class PipeModule {}
