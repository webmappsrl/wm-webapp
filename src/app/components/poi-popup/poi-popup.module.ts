import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {PoiPopupComponent} from './poi-popup.component';
import {PipeModule} from 'src/app/pipes/pipe.module';
import {MapCommonModule} from '../common/map-common.module';

@NgModule({
  declarations: [PoiPopupComponent],
  imports: [CommonModule, PipeModule, MapCommonModule],
  exports: [PoiPopupComponent],
})
export class PoiPopupModule {}
