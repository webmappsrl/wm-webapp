import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { HomeComponent } from './home.component';
import { CardComponent } from './card/card.component';
import { ResultComponent } from './result/result.component';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
// import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [HomeComponent,CardComponent,ResultComponent],
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    TranslateModule
  ],
  exports: [HomeComponent],
})
export class HomeModule {}
