import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {Feature1Component} from "./feature1/feature1.component";
import {HomeComponent} from "./home/home.component";

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'feature1', component: Feature1Component },

];


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
