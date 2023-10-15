import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TargetPracticeRoutingModule } from './target-practice-routing.module';
import { TargetPracticeComponent } from './target-practice.component';
import { SharedModule } from "../shared/shared.module";
import { MatSidenavModule } from '@angular/material/sidenav';
import {MatButtonModule} from "@angular/material/button";


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
    ]
})
export class TargetPracticeModule { }
