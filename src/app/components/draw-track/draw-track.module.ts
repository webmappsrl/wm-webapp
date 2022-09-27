import {CommonModule} from '@angular/common';
import {DrawTrackComponent} from './draw-track/draw-track.component';
import {FormsModule} from '@angular/forms';
import {IonicModule} from '@ionic/angular';
import {NgModule} from '@angular/core';
import {PipeModule} from 'src/app/pipes/pipe.module';
import {TrackDetailsModule} from '../track-details/track-details.module';

@NgModule({
  declarations: [DrawTrackComponent],
  imports: [CommonModule, FormsModule, TrackDetailsModule, IonicModule, PipeModule],
  exports: [DrawTrackComponent],
})
export class DrawTrackModule {}
