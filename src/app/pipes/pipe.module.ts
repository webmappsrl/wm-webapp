import {BuildSvgDirective} from './build-svg.directive';
import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {WmGetFilterIcnPipe} from './webmapp-get-filter-icn.pipe';
import {WmGetIcnPipe} from './webmapp-get-icn.pipe';
import {WmToArrayPipe} from './webmapp-to-array.pipe';
import {WmPipeModule} from 'src/app/shared/wm-core/projects/wm-core/src/pipes/pipe.module';
import { WmITrackToFeaturePipe } from './wm-itrack-to-feature.pipe';
@NgModule({
  declarations: [WmGetIcnPipe, WmGetFilterIcnPipe, WmToArrayPipe, BuildSvgDirective, WmITrackToFeaturePipe],
  imports: [CommonModule, WmPipeModule],
  exports: [WmGetIcnPipe, WmGetFilterIcnPipe, WmToArrayPipe, BuildSvgDirective, WmPipeModule, WmITrackToFeaturePipe],
})
export class PipeModule {}
