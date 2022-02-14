import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TrackDetailsComponent } from './track-details.component';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { PipeModule } from 'src/app/pipes/pipe.module';
import { TrackTechnicalDataComponent } from './track-technical-data/track-technical-data.component';
import { TrackDownloadUrlsComponent } from './track-download-urls/track-download-urls.component';
import { TrackDescriptionComponent } from './track-description/track-description.component';
import { TrackElevationChartComponent } from './track-elevation-chart/track-elevation-chart.component';
import { GalleryComponent } from './gallery/gallery.component';
import { SwiperModule } from 'swiper/angular';
import { ModalGalleryComponent } from './modal-gallery/modal-gallery.component';

@NgModule({
  declarations: [
    TrackDetailsComponent,
    TrackTechnicalDataComponent,
    TrackDownloadUrlsComponent,
    TrackDescriptionComponent,
    TrackElevationChartComponent,
    GalleryComponent,
    ModalGalleryComponent
  ],
  imports: [CommonModule, FormsModule, IonicModule, PipeModule, SwiperModule],
  exports: [TrackDetailsComponent],
})
export class TrackDetailsModule { }
