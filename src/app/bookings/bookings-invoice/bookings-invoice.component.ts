import { Component, OnInit } from '@angular/core';
import { AppService } from '../../shared/util/app.service';
import { HelperService } from '../../shared/util/helper.service';

@Component({
  selector: 'app-bookings-invoice',
  templateUrl: './bookings-invoice.component.html',
  styleUrls: ['./bookings-invoice.component.less']
})
export class BookingsInvoiceComponent implements OnInit {

  public booking:any = [];
  public home:any = [];
  public user:any = [];
  public serviceList:any = [];

  constructor(
    private appService : AppService,
    private helperService : HelperService,
  ) { }

  formatToPrice(num){
    return this.helperService.formatToPrice(num);
  }

  ngOnInit() {
      this.booking = JSON.parse(localStorage.getItem('booking'));
      this.home = this.appService.getHome();
      this.serviceList = this.booking.services;
      console.log(this.booking)
      window.print();
  }

}
