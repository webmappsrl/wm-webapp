import {FormsModule, ReactiveFormsModule} from '@angular/forms';

import {CommonModule} from '@angular/common';
import {HomeComponent} from './home.component';
import {IonicModule} from '@ionic/angular';
import {NgModule} from '@angular/core';
import {PipeModule} from 'src/app/pipes/pipe.module';
import {WMCommonModule} from '../common/wm-common.module';
import {WmCoreModule} from '@wm-core/wm-core.module';

@NgModule({
  declarations: [HomeComponent],
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    ReactiveFormsModule,
    PipeModule,
    WMCommonModule,
    WmCoreModule,
  ],
  exports: [HomeComponent],
})
export class HomeModule {}
