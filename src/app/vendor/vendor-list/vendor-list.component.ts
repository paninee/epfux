import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AppService } from '../../shared/util/app.service';
import { VendorsService } from '../../shared/service/vendor.service';
import { Vendors } from '../../shared/interface/vendors';
import { NotifierService } from 'angular-notifier';

@Component({
  selector: 'app-vendor-list',
  templateUrl: './vendor-list.component.html',
  styleUrls: ['./vendor-list.component.less']
})
export class VendorListComponent implements OnInit {

  public role:string = '';
  public vendorList: Vendors[] = [];
  public vendorTotal:number = 0;
  public p: number = 1;
  public search:string = '';

  private notifier: NotifierService;

  //query params
  public limit: number = 20;
  public skip:number = 0;
  public keyword: any;

  public isLoading:Boolean = true;
  public fileIsLoading:Boolean = false;

  constructor(
    private appService: AppService,
    private vendorsService : VendorsService,
    private router: Router,
    private notifierService : NotifierService
  ) {
    this.notifier = notifierService;
  }

  ngOnInit() {
    this.getVendors();
    this.role = this.appService.getUserRole();
    this.appService.setFormChange(false);
  }

  getPage(page: number) {
    this.p = page;
    this.getVendors();
  }

  getVendors(){
    this.isLoading = true;
    let defaultParams = {
      skip : (this.p - 1) * this.limit,
      limit: this.limit
    };
    let params = Object.assign(defaultParams);
    this.vendorsService.getVendors(params)
      .subscribe((res) => {
        this.vendorList = res.vendors;
        this.vendorTotal = res.total;
        this.isLoading = false;
      },(err) => {
        console.log(err);
      });
  }

  showVendorDetails(vendor){
    this.vendorsService.setVendorDetails(vendor);
    this.router.navigate([`/vendors/${vendor._id}`]);
  }

  findKeyword(data){
    this.vendorList = [];
    this.isLoading = true;
    this.vendorsService.getVendorsByKeyword(data)
      .subscribe((res) => {
        this.vendorList = res.vendors;
        this.vendorTotal = res.total;
        this.isLoading = false;
      },(err) => {
        console.dir(err);
      })
  }


  populateIsLoading(bool:boolean,reset:boolean = false){
    this.fileIsLoading = bool;
    this.isLoading = bool;
  }

  populateDocuments(docs:string, reset:boolean = false){
    let data = { sourceUrl : docs[0] };
    this.vendorsService.importVendorCsv(data)
      .subscribe((res) => {
        this.notifier.notify( 'default', 'Succesfully importing vendor' );
        this.fileIsLoading = false;
        this.getVendors();
      },(err) => {
        this.fileIsLoading = false;
        this.notifier.notify( 'error', 'Theres an error when importing vendor' );
      })
  }

  populateErrorMessage(bool:boolean,reset:boolean = false){
    this.notifier.notify( 'error', 'Uploading failed');
    // this.fileIsLoading = false;
    // this.isLoading = false;
  }
  
}
