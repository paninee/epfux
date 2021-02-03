import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AppService } from '../shared/util/app.service';

@Component({
  selector: 'app-bookings',
  templateUrl: './bookings.component.html',
  styleUrls: ['./bookings.component.less']
})
export class BookingsComponent implements OnInit {

  constructor(
    private route: ActivatedRoute,
    private router : Router,
    private appService : AppService
  ) {}

  ngOnInit() {
    let home = this.appService.getHome();
    if (!home.active) {
      this.router.navigate(['/settings']);
    }
  }

  checkRoutes(){
    if (this.router.url === '/bookings/invoice' || this.router.url === '/bookings/obituary') {
      return true;
    } else {
      return false;
    }
  }

}
