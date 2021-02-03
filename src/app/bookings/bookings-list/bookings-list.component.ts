import { Component, OnInit } from '@angular/core';
import { BookingService } from '../../shared/service/booking.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Bookings } from '../../shared/interface/booking';
import { AppService } from '../../shared/util/app.service';
import * as moment from 'moment';
import { NotifierService } from 'angular-notifier';

@Component({
  selector: 'app-bookings-list',
  templateUrl: './bookings-list.component.html',
  styleUrls: ['./bookings-list.component.less']
})

export class BookingsListComponent implements OnInit {

  public isLoading:boolean = false;
  public bookingList: Bookings[] = [];
  public bookingTotal:number = 0;

  //query params
  public limit: number = 20;
  public skip:number = 0;
  public keyword: any;
  public p: number = 1;

  public search:any = '';

  private notifier: NotifierService;
  
  constructor(
    private bookingService : BookingService,
    private appService : AppService,
    private router: Router,
    private notifierService : NotifierService
  ) { 
    this.notifier = notifierService;
  }

  ngOnInit() {
    window.scrollTo(0,0);
    this.getBookings();
    this.appService.setFormChange(false);
  }

  getBookings(){
    this.isLoading = true;
    let defaultParams = {
      skip : (this.p - 1) * this.limit,
      limit: this.limit
    };
    let params = Object.assign(defaultParams);
    this.bookingService.getBookings(params)
      .subscribe((res) => {
        this.bookingList = res.bookings;
        this.bookingTotal = res.total;
        this.isLoading = false;
      },(err) => {
        this.notifier.notify( 'error', this.appService.formatErrorResponse(err));
        this.isLoading = false;
      });
  }

  async viewEditBooking(data){
    await this.appService.setBooking(data);
    await this.router.navigate(['/bookings', data._id]);
  }

  //for custom datatables

  getPage(page: number) {
    this.p = page;
    this.getBookings();
  }

  findKeyword(data){
    this.bookingList = [];
    this.isLoading = true;
    this.bookingService.getBookingByKeyword(data)
      .subscribe((res) => {
        this.bookingList = res.bookings;
        this.bookingTotal = res.total;
        this.isLoading = false;
      },(err) => {
        console.log(err)
      })
  }

  formatNumber(num){
    if (Number.isInteger(num)){
      return `${num}.00`;
    }
    return num;
  }

}
