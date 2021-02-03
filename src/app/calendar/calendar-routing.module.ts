import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CalendarComponent } from './calendar.component';
import { CalendarListComponent } from './calendar-list/calendar-list.component';
import { AuthGuard } from './../auth/auth.guard';


const routes: Routes = [
  {
    path: '',
    component : CalendarComponent,
    canActivate : [AuthGuard],
    children : [
      {
        path : '',
        component : CalendarListComponent,
        canActivate : [AuthGuard]
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CalendarRoutingModule { }
