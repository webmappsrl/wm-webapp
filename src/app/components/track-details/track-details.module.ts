import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TrackDetailsComponent } from './track-details.component';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { PipeModule } from 'src/app/pipes/pipe.module';
import { TrackTechnicalDataComponent } from './track-technical-data/track-technical-data.component';

@NgModule({
  declarations: [TrackDetailsComponent, TrackTechnicalDataComponent],
  imports: [CommonModule, FormsModule, IonicModule, PipeModule],
  exports: [TrackDetailsComponent, TrackTechnicalDataComponent],
})
export class TrackDetailsModule {}
