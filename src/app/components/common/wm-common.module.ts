import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RelatedUrlsComponent} from './related-urls.component';
import {ImageModalComponent} from './image-modal/image-modal.component';
import {BoxComponent} from './box/box.component';
const components = [RelatedUrlsComponent, ImageModalComponent, BoxComponent];
@NgModule({
  declarations: components,
  imports: [CommonModule],
  exports: components,
})
export class WMCommonModule {}
