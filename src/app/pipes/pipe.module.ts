import {BuildSvgDirective} from './build-svg.directive';
import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {WebmappTranslatePipe} from './webmapp-translate.pipe';
import {WmGetFilterIcnPipe} from './webmapp-get-filter-icn.pipe';
import {WmGetIcnPipe} from './webmapp-get-icn.pipe';

@NgModule({
  declarations: [WebmappTranslatePipe, WmGetIcnPipe, WmGetFilterIcnPipe, BuildSvgDirective],
  imports: [CommonModule],
  exports: [WebmappTranslatePipe, WmGetIcnPipe, WmGetFilterIcnPipe, BuildSvgDirective],
})
export class PipeModule {}
