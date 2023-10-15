import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {DrawingComponent} from './drawing/drawing.component';
import { NavBarService } from '../navbar/navbar.service';


@NgModule({
  declarations: [
    DrawingComponent,
  ],
  imports: [
    CommonModule
  ],
  exports: [DrawingComponent]
})
export class SharedModule {
}
