import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TargetPracticeComponent } from './target-practice.component';

const routes: Routes = [{ path: '', component: TargetPracticeComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TargetPracticeRoutingModule { }
