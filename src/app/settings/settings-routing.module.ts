import { NgModule } from '@angular/core';
import { Routes, RouterModule,UrlSegment } from '@angular/router';

import {SettingsComponent} from './settings.component';
import {SettingsBillingComponent} from './settings-billing/settings-billing.component';

import { AuthGuard } from './../auth/auth.guard';
import { CanDeactivateGuard } from './../auth/can-deactivate-guard.service';


const routes: Routes = [
  {
    path : '',
    component : SettingsComponent,
    canActivate : [AuthGuard],
    children : [
      {
        path : '',
        component : SettingsBillingComponent,
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
export class SettingsRoutingModule { }
