import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../shared/components/shared.module';
import { CalendarRoutingModule } from './calendar-routing.module';
import {CalendarComponent} from './calendar.component';
import { CalendarListComponent } from './calendar-list/calendar-list.component';
import { FullCalendarModule } from '@fullcalendar/angular';

@NgModule({
  declarations: [CalendarComponent, CalendarListComponent],
  imports: [
    CommonModule,
    CalendarRoutingModule,
    SharedModule,
    FullCalendarModule
  ]
})
export class CalendarComponentModule { }
