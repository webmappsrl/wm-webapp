import {WmCoreModule} from 'src/app/shared/wm-core/projects/wm-core/src/wm-core.module';

import {CommonModule} from '@angular/common';
import {DrawTrackModule} from 'src/app/components/draw-track/draw-track.module';
import {FormsModule} from '@angular/forms';
import {IonicModule} from '@ionic/angular';
import {MapPageRoutingModule} from './map-routing.module';
import {NgModule} from '@angular/core';
import {PipeModule} from 'src/app/pipes/pipe.module';
import {PoiPopupModule} from 'src/app/components/poi-popup/poi-popup.module';
import {SharedModule} from 'src/app/shared/shared.module';
import {MapPage} from './map.page';
import {ProfileModule} from 'src/app/components/profile-popup/profile.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MapPageRoutingModule,
    PipeModule,
    PoiPopupModule,
    ProfileModule,
    SharedModule,
    DrawTrackModule,
    WmCoreModule,
  ],
  declarations: [MapPage],
})
export class MapPageModule {}
