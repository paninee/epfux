import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { AppService } from '../../../util/app.service';
import { HelperService } from '../../../util/helper.service';
import { BookingService } from '../../../service/booking.service';
import { BillingService } from '../../../service/billing.service';
import { NotifierService } from 'angular-notifier';
import * as _ from 'lodash';

@Component({
  selector: 'app-service-list',
  templateUrl: './service-list.component.html',
  styleUrls: ['./service-list.component.less']
})
export class ServiceListComponent implements OnInit {

  @ViewChild('discountAmountElem', {static: false}) discountElem: ElementRef;
  @ViewChild('discountPercentageElem', {static: false}) percentageElem: ElementRef;
  @ViewChild("customNotification", { static: true }) customNotificationTmpl;

  public calculateDiscount:any;
  public showDiscount:boolean = false;
  public discount:string = '$';

  public discountAmount:any = 0;
  public discountPercentage:any = 0;
  public discountPercentageFields:any = 0;
  public discountAmountFields:any = 0;
  public remainingAmount:any = 0;
  public paidAmount:any = 0;
  public creditCardNum:string = '';

  public discountValue:any = 0;
  public discountReason:string = '';

  public updateServiceList:any = [];

  public isLoading:Boolean = true;
  private notifier: NotifierService;

  private changeDiscount:Boolean = false;

  public totalPrice:any = 0;
  public booking:any;

  //for arr of each service category

  public arrangementService:any = [];
  public transportationService:any = [];
  public intermentService:any = [];
  public cremationService:any = [];
  public embalmingService:any = [];
  public yourservice:any = [];
  public quickService:any = [];


  constructor(
    private appService : AppService,
    private helperService : HelperService,
    private bookingService : BookingService,
    private billingService : BillingService,
    private notifierService : NotifierService
  ) {
    this.notifier = notifierService;
    this.subscribeData();
  }

  ngOnInit() {
    this.calculateDiscount = this.appService.calculateDiscount;
    this.updateServiceList = this.appService.updateServiceList;
    this.discountAmount =  (this.appService.discountAmount ? this.appService.discountAmount.discountAmount : 0);
    this.discountPercentage = (this.appService.discountAmount ? this.appService.discountAmount.discountPercentage : 0);
    this.discountAmountFields = ( this.discountAmount !== 0 ?  this.discountAmount : 0);
    this.discountPercentageFields = ( this.discountPercentage !== 0 ? this.discountPercentage : 0 );
    this.discount = (this.discountPercentageFields > 0 ? '%' : '$');
    this.totalPrice = this.calculateDiscount.total;
    this.booking = this.appService.booking;
    this.paidAmount = this.booking ? this.booking.paidAmount : 0;

    let creditNum = this.booking ? this.booking.payment : '';
    this.creditCardNum = creditNum ? creditNum.last4 : '';
  }

  subscribeData(){
    this.appService.discountAmountChange.subscribe((data) => {
      this.discountPercentage = data.discountPercentage;
      this.discountAmount = data.discountAmount;
    });
    this.appService.serviceBookingChange.subscribe((services) => {
      this.arrangementService = services.filter((item) => item.identifier === 'arrangement' && item.check !== false && item.delete !== true );
      this.transportationService = services.filter((item) => item.identifier === 'transportation' && item.check !== false && item.data !== null && item.delete !== true );
      this.intermentService = services.filter((item) => item.identifier === 'interment' && item.check !== false && item.delete !== true );
      this.cremationService = services.filter((item) => item.identifier === 'cremation' && item.check !== false && item.delete !== true );
      this.embalmingService = services.filter((item) => item.identifier === 'embalming' && item.check !== false && item.delete !== true );
      this.yourservice = services.filter((item) => item.identifier === 'yourservice' && item.check !== false && item.delete !== true );
      this.quickService = services.filter((item) => item.identifier === 'quick_service' && item.check !== false && item.delete !== true );
    });
    this.appService.calculateDiscountChange.subscribe((discount) => this.calculateDiscount = discount);
    this.appService.showDiscountChange.subscribe((show) => this.showDiscount = show);
    this.appService.updateServiceListChange.subscribe((services) => this.updateServiceList = services);
    this.billingService.remainingAmountChange.subscribe((amount) => this.remainingAmount = amount);
    this.billingService.paidAmountChange.subscribe((paidAmount) => this.paidAmount = paidAmount);
    this.billingService.creditCardNumChange.subscribe((creditCardNum) => this.creditCardNum = creditCardNum);
  }

  setShowDiscount(bool){
    this.appService.setShowDiscount(bool);
  }

  addDiscount(){
    this.notifier.hideAll();
    this.totalPrice = this.getTotalPrice();
    if (this.discount === '$') {
      if (this.discountAmountFields > this.totalPrice) {
        this.notifier.notify( 'error', 'Discount should not greater than total price');
        return;
      }
      this.discountPercentageFields = 0;
    } else {
      if (this.discountPercentageFields > 100) {
        this.notifier.notify( 'error', 'Discount should not greater than 100%');
        return;
      }
      this.discountAmountFields = 0
    }
    let arr = this.filterAlowedProperty(this.appService.serviceBooking);
    let obj = {
      discountPercentage: this.discountPercentageFields,
      discountAmount: this.discountAmountFields,
      discountReason : this.discountReason
    };
    this.appService.setDiscountAmount(obj);
    this.addBookingService(arr,null);
  }

  getTotalPrice(){
    let mainArr = this.appService.serviceBooking.filter((item) => item.delete !== true);
    let filterUpdateServiceList = this.appService.filterDeletedUpdateServiceList();
    if (filterUpdateServiceList.length > 0){
      for (let key in filterUpdateServiceList){
        mainArr.push(filterUpdateServiceList[key]);
      }
    }
    let total = mainArr.reduce((accumulator, currentValue) => {
      return accumulator + currentValue.price
    },0);
    
    return total;
  }

  filterAlowedProperty(data){
    return this.helperService.filterAlowedProperty(data);
  }

  addBookingService(data,identifier){  
    this.isLoading = true;
    let mainArr = data.filter((item) => item.delete !== true);
    let filterUpdateServiceList = this.appService.filterDeletedUpdateServiceList();
    if (filterUpdateServiceList.length > 0){
      for (let key in filterUpdateServiceList){
        mainArr.push(filterUpdateServiceList[key]);
      }
    }
    let service = {
      services : mainArr,
      discountAmount: parseInt(this.discountAmount),
      discountPercentage: parseInt(this.discountPercentage)
    };

    this.bookingService.addBookingService(service)
      .subscribe((res) => {
        this.isLoading = false;
        this.appService.setshowService(true);
        this.appService.setCalculateDiscount(res);
        this.appService.setShowDiscount(false);
        this.appService.setChangeFields(true);
        this.appService.setServiceBookingData(service.services);
        this.billingService.setRemainingAmount(res.total - this.billingService.paidAmount);
        if (identifier === 'remove'){
          this.notifier.show({
            message: "Succesfully remove a service",
            type: "default",
            template: this.customNotificationTmpl,
            id: "notif_succcess_id"
          });
        } else {
          this.notifier.show({
            message: "Succesfully added discount",
            type: "default",
            template: this.customNotificationTmpl,
            id: "notif_succcess_id"
          });
        }
      },(err) => {
        this.notifier.notify( 'error', this.appService.formatErrorResponse(err));
      });
  }

  removeService(index,identifier){
    let arr;
    this.notifier.hideAll();
    switch(identifier){
      case 'updateBooking':
        arr = this.appService.updateServiceList;
        arr[index].delete = true;
        let newArr = arr.filter((item) => item.delete !== true);
        this.appService.setUpdateServiceList(newArr);
        this.addBookingService(this.appService.serviceBooking,'remove');
        if (arr[index].vendor !== null){
          if (arr[index].hasOwnProperty('vendor')){
            const vendor = this.appService.selectedVendorsList.findIndex((e) => e && e._id === arr[index].vendor);
            this.appService.deleteSelectedVendorList(vendor); 
          }
        }
        break;
      case 'arrangement':
        arr = this.arrangementService;
        arr[index].delete = true;
        this.arrangementService = arr.filter((item) => item.identifier === identifier && item.check !== false && item.delete !== true );
        break;
      case 'transportation':
        arr = this.transportationService;
        arr[index].delete = true;
        this.transportationService = arr.filter((item) => item.identifier === identifier && item.check !== false && item.data !== null && item.delete !== true );
        break;
      case 'interment':
        arr = this.intermentService;
        arr[index].delete = true;
        this.intermentService = arr.filter((item) => item.identifier === identifier && item.check !== false && item.delete !== true );
        break;
      case 'cremation':
        arr = this.cremationService;
        arr[index].delete = true;
        this.cremationService = arr.filter((item) => item.identifier === identifier && item.check !== false && item.delete !== true );
        break;
      case 'embalming':
        arr = this.embalmingService;
        arr[index].delete = true;
        this.embalmingService = arr.filter((item) => item.identifier === identifier && item.check !== false && item.delete !== true );
        break;
      case 'yourservice':
        arr = this.yourservice;
        arr[index].delete = true;
        this.yourservice = arr.filter((item) => item.identifier === identifier && item.check !== false && item.delete !== true );
        break;
      case 'quick_service':
        arr = this.quickService;
        arr[index].delete = true;
        this.quickService = arr.filter((item) => item.identifier === identifier && item.check !== false && item.delete !== true );
        break;
      }

    if (identifier !== 'updateBooking'){
      if (arr[index].vendor !== null){
        if (arr[index].hasOwnProperty('vendor')){
          const vendor = this.appService.selectedVendorsList.findIndex((e) => e && e._id === arr[index].vendor);
          this.appService.deleteSelectedVendorList(vendor); 
        }
      }
      let filterArr =  this.filterAlowedProperty(this.appService.serviceBooking);
      this.addBookingService(filterArr,'remove');
    }    
  }

  isDisabled(){
    return this.discountAmountFields !== 0 || this.discountPercentageFields !== 0 || this.changeDiscount;
  }

  onChangedDiscount(events){
    this.changeDiscount = true;
  }

  discountDisabled(){
    let filter = this.updateServiceList.filter((item) => item.delete !== true && item.name)
    return this.validateIfHasData() || filter.length > 0;
  }

  //for invoice services 

  filterServiceBookingArray(identifier){
    let arr = this.appService.filterServiceBookingArray(identifier);
    return arr ? arr : [];
  }

  filterServiceBookingTransportation(identifier){
    let arr = this.appService.filterServiceBookingTransportation(identifier);
    return arr ? arr : [];
  }

  validateIfHasData(){
    if ( this.filterServiceBookingArray('arrangement').length <= 0 && this.filterServiceBookingTransportation('transportation').length <= 0 && this.filterServiceBookingArray('interment').length <= 0 && this.filterServiceBookingArray('cremation').length <= 0 && this.filterServiceBookingArray('yourservice').length <= 0 && this.filterServiceBookingArray('embalming').length <= 0 && this.filterServiceBookingArray('quick_service').length <= 0 ) {
      return false;
    } else {
      return true
    }
  }

  formatNumber(num){
    if (Number.isInteger(num)){
      return `${num}.00`;
    }
    return num;
  }

  formatsNUm(number){
    return number.toFixed(2);
  }

  moveCursorToEnd(event){
    this.helperService.moveCursorToEnd(event);
  }

  trackByFn(index, item) {
    return index;
  }

}
