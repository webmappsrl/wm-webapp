import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MapComponent} from './map.component';
import {IonicModule} from '@ionic/angular';
import {MapCommonModule} from '../common/map-common.module';
// import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [MapComponent],
  imports: [
    CommonModule,
    MapCommonModule,
    IonicModule,
    // TranslateModule
  ],
  exports: [MapComponent],
})
export class MapModule {}
