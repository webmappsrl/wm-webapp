import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {IonicModule} from '@ionic/angular';
import {HomeComponent} from './home.component';
import {CardComponent} from './card/card.component';
import {ResultComponent} from './result/result.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {TranslateModule} from '@ngx-translate/core';
import {SearchComponent} from './search/search.component';
// import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [HomeComponent, CardComponent, ResultComponent, SearchComponent],
  imports: [CommonModule, IonicModule, FormsModule, TranslateModule, ReactiveFormsModule],
  exports: [HomeComponent],
})
export class HomeModule {}
