import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import {AccountsComponent} from './accounts.component';
import {AccountListComponent} from './account-list/account-list.component';
import {AccountDetailComponent} from './account-detail/account-detail.component';
import { AuthGuard } from './../auth/auth.guard';
import { CanDeactivateGuard } from './../auth/can-deactivate-guard.service';


const routes: Routes = [
  {
    path : '',
    component : AccountsComponent,
    canActivate : [AuthGuard],
    children : [
      {
        path : '',
        component : AccountListComponent,
        canActivate : [AuthGuard]
      },
      {
        path : ':id',
        component : AccountDetailComponent,
        canActivate : [AuthGuard],
        canDeactivate: [CanDeactivateGuard]
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AccountsRoutingModule { }
