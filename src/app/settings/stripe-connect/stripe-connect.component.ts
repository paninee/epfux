import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BillingService } from '../../shared/service/billing.service';

@Component({
  selector: 'app-stripe-connect',
  templateUrl: './stripe-connect.component.html',
  styleUrls: ['./stripe-connect.component.less']
})
export class StripeConnectComponent implements OnInit {

  constructor(
    private route: ActivatedRoute,
    private billingService : BillingService,
    private router : Router
  ) {
    this.getQueryParams();
  }

  ngOnInit() {
  }

  getQueryParams(){

    
    this.route.queryParams
      .subscribe((params) => {
        this.sendPayout(params.code)
      },(err) => {
        console.dir(err)
      })
  }

  sendPayout(code){
    this.billingService.sendPayoutId(code)
      .subscribe((response) => {
        this.router.navigate(['/settings']);
      },(err) => {
        this.router.navigate(['/settings']);
      })
  }

}
