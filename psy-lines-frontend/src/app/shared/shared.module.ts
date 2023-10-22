import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {DrawingComponent} from './drawing/drawing.component';
import { NavBarService } from '../navbar/navbar.service';


@NgModule({
    declarations: [
        DrawingComponent,
        DrawingComponent,
    ],
  imports: [
    CommonModule
  ],
    exports: [DrawingComponent, DrawingComponent]
})
export class SharedModule {
}
