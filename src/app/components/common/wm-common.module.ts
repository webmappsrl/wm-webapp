import {CommonModule} from '@angular/common';
import {ImageModalComponent} from './image-modal/image-modal.component';
import {IonicModule} from '@ionic/angular';
import {LayerBoxComponent} from './layer-box/layer-box.component';
import {NgModule} from '@angular/core';
import {PipeModule} from 'src/app/pipes/pipe.module';
import {PoiBoxComponent} from './poi-box/poi-box.component';
import {RelatedUrlsComponent} from './related-urls.component';
import {SearchBoxComponent} from './search-box/search-box.component';
import {TrackAudioComponent} from './track-audio/track-audio.component';
import {GalleryComponent} from './gallery/gallery.component';
import {WmCoreModule} from '@wm-core/wm-core.module';

const components = [
  RelatedUrlsComponent,
  ImageModalComponent,
  SearchBoxComponent,
  LayerBoxComponent,
  PoiBoxComponent,
  TrackAudioComponent,
  GalleryComponent,
];
@NgModule({
  declarations: components,
  imports: [CommonModule, PipeModule, IonicModule, WmCoreModule],
  exports: components,
})
export class WMCommonModule {}
