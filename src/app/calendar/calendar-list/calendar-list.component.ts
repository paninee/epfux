import { Component, ViewChild } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { BookingService } from '../../shared/service/booking.service';
import { AppService } from '../../shared/util/app.service';
import { ActivatedRoute, Router } from '@angular/router';
import { EventInput } from '@fullcalendar/core';
import { FullCalendarComponent } from '@fullcalendar/angular';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGrigPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import * as moment from 'moment';

@Component({
  selector: 'app-calendar-list',
  templateUrl: './calendar-list.component.html',
  styleUrls: ['./calendar-list.component.less']
})
export class CalendarListComponent {

  @ViewChild('calendar', {static: false}) calendarComponent: FullCalendarComponent; // the #calendar in the template

  public calendarPlugins = [dayGridPlugin, timeGrigPlugin, interactionPlugin];
  public events:EventInput = [];
  public viewDate = new Date();
  public calendarWeekends = true;

  constructor(
    private modal: NgbModal,
    private bookingService : BookingService,
    private appService : AppService,
    private router: Router
    ) {}

  ngOnInit() {
    this.getBookingSchedule();
    this.appService.setFormChange(false);
  }

  getBookingSchedule(){
    let daysInMonth = moment(this.viewDate,'YYYY-MM').daysInMonth();
    let month = moment(this.viewDate).format('MM');
    let year = moment(this.viewDate).format('YYYY');
    let defaultParams = {
      from: `${year}-${month}-01T00:00:00-07:00`,
      to: `${year}-${month}-${daysInMonth}T00:00:00-07:00`,
    };
    let params = Object.assign(defaultParams);
    this.bookingService.getBookingSchedule(params)
      .subscribe((response) => {
        this.addBookingEvents(response.bookings);
      },(err) => {
        console.log(err);
      })
  }

  addBookingEvents(data){
    this.events = [];
    for (let key in data){
      this.events.push({
        title: `${data[key].clientName}`,
        start: new Date(data[key].serviceStart),
        end: new Date(data[key].serviceEnd),
        data: data[key]
      })
    }
  }

  next() {
    let calendarApi = this.calendarComponent.getApi();
    calendarApi.next();
    this.viewDate = calendarApi.getDate();
    this.getBookingSchedule();
  }

  back(){
    let calendarApi = this.calendarComponent.getApi();
    calendarApi.prev();
    this.viewDate = calendarApi.getDate();
    this.getBookingSchedule();
  }

  formatDate(date,format){
    if (date && format) {
      let newDate = moment(date).format(format);
      return newDate;
    } else {
      return '';
    }
  }

  trackByFn(index, item) {
    return index;
  }

  async handleDateClick(info){
    let data = info.event.extendedProps.data;
    await this.appService.setBooking(data);
    await this.router.navigate(['/bookings', data._id]);
  }
}
