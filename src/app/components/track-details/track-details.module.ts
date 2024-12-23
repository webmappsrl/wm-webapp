import {FormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {IonicModule} from '@ionic/angular';
import {ModalGalleryComponent} from './modal-gallery/modal-gallery.component';
import {NgModule} from '@angular/core';
import {PipeModule} from 'src/app/pipes/pipe.module';
import {SwiperModule} from 'swiper/angular';
import {TrackDescriptionComponent} from './track-description/track-description.component';
import {TrackDetailsComponent} from './track-details.component';
import {TrackPoiComponent} from './track-poi/track-poi.component';
import {TrackRelatedUrlsComponent} from './track-related-urls/track-related-urls.component';
import {WMCommonModule} from '../common/wm-common.module';
import {WmCoreModule} from 'src/app/shared/wm-core/projects/wm-core/src/wm-core.module';
import { TrackActivityComponent } from './track-activity/track-activity.component';

@NgModule({
  declarations: [
    TrackDetailsComponent,
    TrackDescriptionComponent,
    TrackPoiComponent,
    ModalGalleryComponent,
    TrackRelatedUrlsComponent,
    TrackActivityComponent,
  ],
  exports: [
    TrackPoiComponent,
    TrackDetailsComponent,
    TrackDescriptionComponent,
    TrackActivityComponent,
  ],
  imports: [
    CommonModule,
    WMCommonModule,
    FormsModule,
    IonicModule,
    PipeModule,
    SwiperModule,
    WmCoreModule,
  ],
})
export class TrackDetailsModule {}
