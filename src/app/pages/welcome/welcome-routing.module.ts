import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { WelcomeComponent } from './welcome.component';
import {CalculateComponent} from "../calculate/calculate.component";
import {ResultComponent} from "../result/result.component";

const routes: Routes = [
  { path: '', component: WelcomeComponent },
  { path: 'calculate', component: CalculateComponent},
  { path: 'display', component: ResultComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class WelcomeRoutingModule { }
