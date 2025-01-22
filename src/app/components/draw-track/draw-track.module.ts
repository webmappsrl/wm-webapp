import {CommonModule} from '@angular/common';
import {DrawTrackComponent} from './draw-track/draw-track.component';
import {FormsModule} from '@angular/forms';
import {IonicModule} from '@ionic/angular';
import {NgModule} from '@angular/core';
import {WmCoreModule} from 'src/app/shared/wm-core/projects/wm-core/src/wm-core.module';

@NgModule({
  declarations: [DrawTrackComponent],
  imports: [CommonModule, FormsModule, IonicModule, WmCoreModule],
  exports: [DrawTrackComponent],
})
export class DrawTrackModule {}
