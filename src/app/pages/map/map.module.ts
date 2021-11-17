import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MapPageRoutingModule } from './map-routing.module';

import { MapPage } from './map.page';
import { MapModule } from 'src/app/components/map/map.module';
import { PipeModule } from 'src/app/pipes/pipe.module';
import { TrackDetailsModule } from 'src/app/components/track-details/track-details.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MapPageRoutingModule,
    MapModule,
    PipeModule,
    TrackDetailsModule,
  ],
  declarations: [MapPage],
})
export class MapPageModule {}
