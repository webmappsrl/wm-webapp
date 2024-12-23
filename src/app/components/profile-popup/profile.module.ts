import {CommonModule} from '@angular/common';
import {IonicModule} from '@ionic/angular';
import {NgModule} from '@angular/core';
import {PipeModule} from 'src/app/pipes/pipe.module';
import {WMCommonModule} from '../common/wm-common.module';
import {ProfileComponent} from './profile.component';
import {WmProfileModule} from '@wm-core/profile/profile.module';

@NgModule({
  declarations: [ProfileComponent],
  imports: [CommonModule, PipeModule, WMCommonModule, IonicModule, WmProfileModule],
  exports: [ProfileComponent],
})
export class ProfileModule {}
