import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MapPageRoutingModule } from './map-routing.module';

import { MapPage } from './map.page';
import { MapModule } from 'src/app/components/map/map.module';
import { DetailsComponent } from './details/details.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MapPageRoutingModule,
    MapModule,
  ],
  declarations: [MapPage, DetailsComponent],
})
export class MapPageModule {}
