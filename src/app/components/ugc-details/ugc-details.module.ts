import {FormsModule} from '@angular/forms';

import {CommonModule} from '@angular/common';
import {IonicModule} from '@ionic/angular';
import {NgModule} from '@angular/core';
import {PipeModule} from 'src/app/pipes/pipe.module';
import {SwiperModule} from 'swiper/angular';
import {WMCommonModule} from '../common/wm-common.module';
import {WmCoreModule} from 'src/app/shared/wm-core/projects/wm-core/src/wm-core.module';
import {UgcTrackDataComponent} from './ugc-track-data/ugc-track-data.component';
import {TrackDetailsModule} from '../track-details/track-details.module';

@NgModule({
  declarations: [UgcTrackDataComponent],
  imports: [
    CommonModule,
    WMCommonModule,
    FormsModule,
    IonicModule,
    PipeModule,
    SwiperModule,
    WmCoreModule,
    TrackDetailsModule,
  ],
})
export class UgcDetailsModule {}
