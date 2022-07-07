import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';

import {IonicModule} from '@ionic/angular';

import {MapPageRoutingModule} from './map-routing.module';

import {MapPage} from './map.page';
import {MapModule} from 'src/app/components/map/map.module';
import {PipeModule} from 'src/app/pipes/pipe.module';
import {TrackDetailsModule} from 'src/app/components/track-details/track-details.module';
import {HomeModule} from 'src/app/components/home/home.module';
import {PoiPopupModule} from 'src/app/components/poi-popup/poi-popup.module';
import {SharedModule} from 'src/app/shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MapPageRoutingModule,
    MapModule,
    PipeModule,
    TrackDetailsModule,
    HomeModule,
    PoiPopupModule,
    SharedModule,
  ],
  declarations: [MapPage],
})
export class MapPageModule {}
