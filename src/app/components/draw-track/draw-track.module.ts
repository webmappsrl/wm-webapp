import {CommonModule} from '@angular/common';
import {DrawTrackComponent} from './draw-track/draw-track.component';
import {FormsModule} from '@angular/forms';
import {IonicModule} from '@ionic/angular';
import {NgModule} from '@angular/core';
import {PipeModule} from 'src/app/pipes/pipe.module';
import {TrackDetailsModule} from '../track-details/track-details.module';
import {WmCoreModule} from 'src/app/shared/wm-core/wm-core.module';

@NgModule({
  declarations: [DrawTrackComponent],
  imports: [CommonModule, FormsModule, TrackDetailsModule, IonicModule, PipeModule, WmCoreModule],
  exports: [DrawTrackComponent],
})
export class DrawTrackModule {}
