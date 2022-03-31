import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {IonicModule} from '@ionic/angular';
import {HomeComponent} from './home.component';
import {CardComponent} from './card/card.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {TranslateModule} from '@ngx-translate/core';
import {SearchComponent} from './search/search.component';
import {WMCommonModule} from '../common/wm-common.module';
import {PipeModule} from 'src/app/pipes/pipe.module';
// import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [HomeComponent, CardComponent, SearchComponent],
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    TranslateModule,
    ReactiveFormsModule,
    WMCommonModule,
  ],
  exports: [HomeComponent],
})
export class HomeModule {}
