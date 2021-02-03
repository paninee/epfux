import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ServicesComponent } from './services.component';
import { AuthGuard } from './../auth/auth.guard';
import { CanDeactivateGuard } from './../auth/can-deactivate-guard.service';
//children components
import { ServicesListComponent } from './services-list/services-list.component';


const routes: Routes = [
  {
    path : '',
    component : ServicesComponent,
    canActivate : [AuthGuard],
    children : [
      {
        path : '',
        component : ServicesListComponent,
        canActivate : [AuthGuard],
        canDeactivate : [CanDeactivateGuard]
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ServicesRoutingModule { }
