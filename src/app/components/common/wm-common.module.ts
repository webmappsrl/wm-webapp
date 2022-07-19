import {BoxComponent} from './box/box.component';
import {CommonModule} from '@angular/common';
import {ConvertToItemTracksPipe} from './tracks-box/convert-to-base-box.pipe';
import {ImageModalComponent} from './image-modal/image-modal.component';
import {IonicModule} from '@ionic/angular';
import {LayerBoxComponent} from './layer-box/layer-box.component';
import {NgModule} from '@angular/core';
import {PipeModule} from 'src/app/pipes/pipe.module';
import {PoiBoxComponent} from './poi-box /poi-box.component';
import {RelatedUrlsComponent} from './related-urls.component';
import {SearchBoxComponent} from './search-box/search-box.component';
import {TitleComponent} from './title/title.component';
import {TracksBoxComponent} from './tracks-box/tracks-box.component';

const components = [
  TitleComponent,
  RelatedUrlsComponent,
  ImageModalComponent,
  SearchBoxComponent,
  LayerBoxComponent,
  TracksBoxComponent,
  PoiBoxComponent,
  BoxComponent,
  ConvertToItemTracksPipe,
];
@NgModule({
  declarations: components,
  imports: [CommonModule, PipeModule, IonicModule],
  exports: components,
})
export class WMCommonModule {}
