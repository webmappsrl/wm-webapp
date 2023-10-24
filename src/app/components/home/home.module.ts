import {FormsModule, ReactiveFormsModule} from '@angular/forms';

import {CardComponent} from './card/card.component';
import {CommonModule} from '@angular/common';
import {HomeComponent} from './home.component';
import {InnerHtmlComponent} from '../project/project.page.component';
import {IonicModule} from '@ionic/angular';
import {NgModule} from '@angular/core';
import {SearchComponent} from './search/search.component';
import {WMCommonModule} from '../common/wm-common.module';
import {PipeModule} from 'src/app/pipes/pipe.module';
import {WmCoreModule} from 'shared/wm-core/wm-core.module';

@NgModule({
  declarations: [HomeComponent, CardComponent, SearchComponent, InnerHtmlComponent],
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    ReactiveFormsModule,
    PipeModule,
    WMCommonModule,
    WmCoreModule,
  ],
  exports: [HomeComponent],
})
export class HomeModule {}
