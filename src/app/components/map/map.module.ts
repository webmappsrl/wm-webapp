import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MapComponent} from './map.component';
import {IonicModule} from '@ionic/angular';
import {WMCommonModule} from '../common/wm-common.module';
import {NavMapTrackDirective} from './track.directive';
// import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [MapComponent, NavMapTrackDirective],
  imports: [
    CommonModule,
    WMCommonModule,
    IonicModule,
    // TranslateModule
  ],
  exports: [MapComponent],
})
export class MapModule {}
