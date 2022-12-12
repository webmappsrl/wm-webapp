import {FormsModule, ReactiveFormsModule} from '@angular/forms';

import {CommonModule} from '@angular/common';
import {GalleryComponent} from './gallery/gallery.component';
import {IonicModule} from '@ionic/angular';
import {ModalGalleryComponent} from './modal-gallery/modal-gallery.component';
import {NgModule} from '@angular/core';
import {PipeModule} from 'src/app/pipes/pipe.module';
import {SwiperModule} from 'swiper/angular';
import {TrackAudioComponent} from '../common/track-audio/track-audio.component';
import {TrackDescriptionComponent} from './track-description/track-description.component';
import {TrackDetailsComponent} from './track-details.component';
import {TrackDownloadUrlsComponent} from './track-download-urls/track-download-urls.component';
import {TrackElevationChartComponent} from './track-elevation-chart/track-elevation-chart.component';
import {TrackPoiComponent} from './track-poi/track-poi.component';
import {TrackRelatedUrlsComponent} from './track-related-urls/track-related-urls.component';
import {TrackTechnicalDataComponent} from './track-technical-data/track-technical-data.component';
import {WMCommonModule} from '../common/wm-common.module';

@NgModule({
  declarations: [
    TrackDetailsComponent,
    TrackTechnicalDataComponent,
    TrackDownloadUrlsComponent,
    TrackDescriptionComponent,
    TrackElevationChartComponent,
    TrackPoiComponent,
    GalleryComponent,
    ModalGalleryComponent,
    TrackRelatedUrlsComponent,
  ],
  imports: [CommonModule, WMCommonModule, FormsModule, IonicModule, PipeModule, SwiperModule],
  exports: [
    TrackPoiComponent,
    TrackDetailsComponent,
    TrackElevationChartComponent,
    TrackTechnicalDataComponent,
    TrackDownloadUrlsComponent,
  ],
})
export class TrackDetailsModule {}
