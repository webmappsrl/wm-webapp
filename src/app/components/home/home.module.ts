import {FormsModule, ReactiveFormsModule} from '@angular/forms';

import {CardComponent} from './card/card.component';
import {CommonModule} from '@angular/common';
import {HomeComponent} from './home.component';
import {InnerHtmlComponent} from '../project/project.page.component';
import {IonicModule} from '@ionic/angular';
import {NgModule} from '@angular/core';
import {SearchComponent} from './search/search.component';
import {TranslateModule} from '@ngx-translate/core';
import {WMCommonModule} from '../common/wm-common.module';

// import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [HomeComponent, CardComponent, SearchComponent, InnerHtmlComponent],
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
