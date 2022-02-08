import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { HomeComponent } from './home.component';
import { CardComponent } from './card/card.component';
// import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [HomeComponent,CardComponent],
  imports: [
    CommonModule,
    IonicModule,
    // TranslateModule
  ],
  exports: [HomeComponent],
})
export class HomeModule {}
