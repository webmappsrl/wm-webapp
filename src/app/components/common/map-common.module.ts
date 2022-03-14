import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RelatedUrlsComponent} from './related-urls.component';
import {ImageModalComponent} from './image-modal/image-modal.component';
const components = [RelatedUrlsComponent, ImageModalComponent];
@NgModule({
  declarations: components,
  imports: [CommonModule],
  exports: components,
})
export class MapCommonModule {}
