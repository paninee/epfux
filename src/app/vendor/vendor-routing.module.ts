import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {VendorComponent} from './vendor.component';
import {VendorListComponent} from './vendor-list/vendor-list.component';
import {VendorDetailsComponent} from './vendor-details/vendor-details.component';
import { VendorCreateComponent } from './vendor-create/vendor-create.component';

import { AuthGuard } from './../auth/auth.guard';
import { CanDeactivateGuard } from './../auth/can-deactivate-guard.service';

const routes: Routes = [
  {
    path : '',
    component : VendorComponent,
    canActivate : [AuthGuard],
    children : [
      {
        path : '',
        component : VendorListComponent,
        canActivate : [AuthGuard]
      },
      {
        path : 'create',
        component : VendorCreateComponent,
        canActivate : [AuthGuard],
        canDeactivate : [CanDeactivateGuard]
      },
      {
        path : ':id',
        component : VendorDetailsComponent,
        canActivate : [AuthGuard]
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class VendorRoutingModule { }
