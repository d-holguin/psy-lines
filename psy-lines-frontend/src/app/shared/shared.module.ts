import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {DrawingComponent} from './drawing/drawing.component';


@NgModule({
  declarations: [
    DrawingComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [DrawingComponent]
})
export class SharedModule {
}
