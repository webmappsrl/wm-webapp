import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TrackDetailsComponent } from './track-details.component';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { PipeModule } from 'src/app/pipes/pipe.module';
import { TrackTechnicalDataComponent } from './track-technical-data/track-technical-data.component';
import { TrackDownloadUrlsComponent } from './track-download-urls/track-download-urls.component';

@NgModule({
  declarations: [
    TrackDetailsComponent,
    TrackTechnicalDataComponent,
    TrackDownloadUrlsComponent,
  ],
  imports: [CommonModule, FormsModule, IonicModule, PipeModule],
  exports: [
    TrackDetailsComponent,
    TrackTechnicalDataComponent,
    TrackDownloadUrlsComponent,
  ],
})
export class TrackDetailsModule {}
