import {CommonModule} from '@angular/common';
import {IonicModule} from '@ionic/angular';
import {NgModule} from '@angular/core';
import {PipeModule} from 'src/app/pipes/pipe.module';
import {PoiPopupComponent} from './poi-popup.component';
import {WMCommonModule} from '../common/wm-common.module';

@NgModule({
  declarations: [PoiPopupComponent],
  imports: [CommonModule, PipeModule, WMCommonModule, IonicModule],
  exports: [PoiPopupComponent],
})
export class PoiPopupModule {}
