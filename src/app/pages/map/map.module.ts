import {WmCoreModule} from 'src/app/shared/wm-core/projects/wm-core/src/wm-core.module';

import {CommonModule} from '@angular/common';
import {DrawTrackModule} from 'src/app/components/draw-track/draw-track.module';
import {FormsModule} from '@angular/forms';
import {HomeModule} from 'src/app/components/home/home.module';
import {IonicModule} from '@ionic/angular';
import {MapPageRoutingModule} from './map-routing.module';
import {NgModule} from '@angular/core';
import {PipeModule} from 'src/app/pipes/pipe.module';
import {PoiPopupModule} from 'src/app/components/poi-popup/poi-popup.module';
import {SharedModule} from 'src/app/shared/shared.module';
import {TrackDetailsModule} from 'src/app/components/track-details/track-details.module';
import {MapPage} from './map.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MapPageRoutingModule,
    PipeModule,
    TrackDetailsModule,
    HomeModule,
    PoiPopupModule,
    SharedModule,
    DrawTrackModule,
    WmCoreModule,
  ],
  declarations: [MapPage],
})
export class MapPageModule {}
