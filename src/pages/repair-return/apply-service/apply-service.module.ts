import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ApplyServicePage } from './apply-service';
import { ImgLazyLoadDirectiveModule } from "../../../directives/img-lazy-load/img-lazy-load.module";

@NgModule({
  declarations: [
    ApplyServicePage,
  ],
  imports: [
    IonicPageModule.forChild(ApplyServicePage),
    ImgLazyLoadDirectiveModule
  ],
  exports: [
    ApplyServicePage
  ]
})
export class ApplyServicePageModule {}
