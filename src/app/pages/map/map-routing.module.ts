import { RouterModule, Routes } from '@angular/router';

import { MapPage } from './map.page';
import { NgModule } from '@angular/core';

const routes: Routes = [
  {
    path: '',
    component: MapPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MapPageRoutingModule {}
