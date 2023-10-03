import {FormsModule} from '@angular/forms';

import {CommonModule} from '@angular/common';
import {IonicModule} from '@ionic/angular';
import {ModalGalleryComponent} from './modal-gallery/modal-gallery.component';
import {NgModule} from '@angular/core';
import {PipeModule} from 'src/app/pipes/pipe.module';
import {SwiperModule} from 'swiper/angular';
import {TrackDescriptionComponent} from './track-description/track-description.component';
import {TrackDetailsComponent} from './track-details.component';
import {TrackDownloadUrlsComponent} from './track-download-urls/track-download-urls.component';
import {TrackPoiComponent} from './track-poi/track-poi.component';
import {TrackRelatedUrlsComponent} from './track-related-urls/track-related-urls.component';
import {TrackTechnicalDataComponent} from './track-technical-data/track-technical-data.component';
import {WMCommonModule} from '../common/wm-common.module';
import {WmCoreModule} from '../../shared/wm-core/wm-core.module';

@NgModule({
  declarations: [
    TrackDetailsComponent,
    TrackTechnicalDataComponent,
    TrackDownloadUrlsComponent,
    TrackDescriptionComponent,
    TrackPoiComponent,
    ModalGalleryComponent,
    TrackRelatedUrlsComponent,
  ],
  exports: [
    TrackPoiComponent,
    TrackDetailsComponent,
    TrackTechnicalDataComponent,
    TrackDownloadUrlsComponent,
    TrackDescriptionComponent,
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
