import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {PoiPopupComponent} from './poi-popup.component';
import {PipeModule} from 'src/app/pipes/pipe.module';
import {WMCommonModule} from '../common/wm-common.module';

@NgModule({
  declarations: [PoiPopupComponent],
  imports: [CommonModule, PipeModule, WMCommonModule],
  exports: [PoiPopupComponent],
})
export class PoiPopupModule {}
