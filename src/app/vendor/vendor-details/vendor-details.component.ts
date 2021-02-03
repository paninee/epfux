import { Component, OnInit } from '@angular/core';
import { VendorsService } from '../../shared/service/vendor.service';
import { Vendors } from '../../shared/interface/vendors';
import { Router } from '@angular/router';

@Component({
  selector: 'app-vendor-details',
  templateUrl: './vendor-details.component.html',
  styleUrls: ['./vendor-details.component.less']
})
export class VendorDetailsComponent implements OnInit {

  public vendor: Vendors;

  constructor(
    private vendorsService : VendorsService,
    private router : Router
  ) { }

  ngOnInit() {
    this.vendor = this.vendorsService.vendors;
    if (!this.vendor) {
      this.router.navigate(['/vendors']);
    }
  }

  deleteVendor(){
    this.vendorsService.deleteVendor(this.vendor._id)
      .subscribe((res) => {
        this.router.navigate([`/vendors`]);
      },(err) => {
        console.dir(err);
      })
  }

}
