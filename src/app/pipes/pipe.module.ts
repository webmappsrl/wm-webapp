import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {WebmappTranslatePipe} from './webmapp-translate.pipe';
import {WmGetIcnPipe} from './webmapp-get-icn.pipe';

@NgModule({
  declarations: [WebmappTranslatePipe, WmGetIcnPipe],
  imports: [CommonModule],
  exports: [WebmappTranslatePipe, WmGetIcnPipe],
})
export class PipeModule {}
