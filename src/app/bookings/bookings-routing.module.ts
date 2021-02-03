import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
//components
import { BookingsComponent } from './bookings.component';
import { BookingsListComponent } from './bookings-list/bookings-list.component';
import { BookingsCreateComponent } from './bookings-create/bookings-create.component';
import { BookingsViewEditComponent } from './bookings-view-edit/bookings-view-edit.component';
import { BookingsInvoiceComponent } from './bookings-invoice/bookings-invoice.component';
import { BookingsObituaryComponent } from './bookings-obituary/bookings-obituary.component';
import { AuthGuard } from './../auth/auth.guard';
import { CanDeactivateGuard } from './../auth/can-deactivate-guard.service';


const routes: Routes = [
  {
    path: '',
    component : BookingsComponent,
    canActivate : [AuthGuard],
    children : [
      {
        path : '',
        component : BookingsListComponent,
        canActivate : [AuthGuard]
      },
      {
        path : 'create',
        component : BookingsCreateComponent,
        canActivate : [AuthGuard],
        canDeactivate : [CanDeactivateGuard]
      },
      {
        path : 'invoice',
        component : BookingsInvoiceComponent,
        canActivate : [AuthGuard]
      },
      {
        path : 'obituary',
        component : BookingsObituaryComponent,
        canActivate : [AuthGuard]
      },
      {
        path : ':id',
        component : BookingsViewEditComponent,
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
export class BookingsRoutingModule { }
