import {BuildSvgDirective} from './build-svg.directive';
import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {WmGetFilterIcnPipe} from './webmapp-get-filter-icn.pipe';
import {WmGetIcnPipe} from './webmapp-get-icn.pipe';
import {WmToArrayPipe} from './webmapp-to-array.pipe';
import {WmPipeModule} from 'src/app/shared/wm-core/projects/wm-core/src/pipes/pipe.module';
@NgModule({
  declarations: [WmGetIcnPipe, WmGetFilterIcnPipe, WmToArrayPipe, BuildSvgDirective],
  imports: [CommonModule, WmPipeModule],
  exports: [WmGetIcnPipe, WmGetFilterIcnPipe, WmToArrayPipe, BuildSvgDirective, WmPipeModule],
})
export class PipeModule {}
