import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TargetPracticeRoutingModule } from './target-practice-routing.module';
import { TargetPracticeComponent } from './target-practice.component';
import { SharedModule } from "../shared/shared.module";
import { MatSidenavModule } from '@angular/material/sidenav';
import {MatButtonModule} from "@angular/material/button";
import {MatButtonToggleModule} from "@angular/material/button-toggle";
import {MatToolbarModule} from "@angular/material/toolbar";
import {MatIconModule} from "@angular/material/icon";


@NgModule({
    declarations: [
        TargetPracticeComponent
    ],
  imports: [
    CommonModule,
    TargetPracticeRoutingModule,
    SharedModule,
    MatSidenavModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatToolbarModule,
    MatIconModule,
  ]
})
export class TargetPracticeModule { }
