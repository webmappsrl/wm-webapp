import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WebmappTranslatePipe } from './webmapp-translate.pipe';

@NgModule({
  declarations: [WebmappTranslatePipe],
  imports: [CommonModule],
  exports: [WebmappTranslatePipe],
})
export class PipeModule {}
