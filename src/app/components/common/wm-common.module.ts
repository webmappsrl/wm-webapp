import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RelatedUrlsComponent} from './related-urls.component';
import {ImageModalComponent} from './image-modal/image-modal.component';
import {SearchBoxComponent} from './search-box/search-box.component';
import {CompactHorizontalComponent} from './compact-horizontal/compact-horizontal.component';
import {LayerBoxComponent} from './layer-box/layer-box.component';
import {PipeModule} from 'src/app/pipes/pipe.module';

const components = [
  RelatedUrlsComponent,
  ImageModalComponent,
  SearchBoxComponent,
  LayerBoxComponent,
  CompactHorizontalComponent,
];
@NgModule({
  declarations: components,
  imports: [CommonModule, PipeModule],
  exports: components,
})
export class WMCommonModule {}
