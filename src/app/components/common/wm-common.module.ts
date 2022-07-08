import {CommonModule} from '@angular/common';
import {CompactHorizontalComponent} from './compact-horizontal/compact-horizontal.component';
import {ImageModalComponent} from './image-modal/image-modal.component';
import {IonicModule} from '@ionic/angular';
import {LayerBoxComponent} from './layer-box/layer-box.component';
import {NgModule} from '@angular/core';
import {PipeModule} from 'src/app/pipes/pipe.module';
import {RelatedUrlsComponent} from './related-urls.component';
import {SearchBoxComponent} from './search-box/search-box.component';

const components = [
  RelatedUrlsComponent,
  ImageModalComponent,
  SearchBoxComponent,
  LayerBoxComponent,
  CompactHorizontalComponent,
];
@NgModule({
  declarations: components,
  imports: [CommonModule, PipeModule, IonicModule],
  exports: components,
})
export class WMCommonModule {}
