import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MapComponent } from './map.component';
import { IonicModule } from '@ionic/angular';
// import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [MapComponent],
  imports: [
    CommonModule,
    IonicModule,
    // TranslateModule
  ],
  exports: [MapComponent],
})
export class MapModule {}
