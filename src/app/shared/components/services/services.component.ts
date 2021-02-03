import { Component, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { 
  NgbModal, 
  ModalDismissReasons, 
  NgbDateAdapter, 
  NgbDateStruct, 
  NgbDateNativeAdapter, 
  NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ServicesService } from '../../service/services.service';
import { AppService } from '../../util/app.service';
import { HelperService } from '../../util/helper.service';
import { VendorsService } from '../../service/vendor.service';
import { BookingService } from '../../service/booking.service';
import { BillingService } from '../../service/billing.service';
import { NotifierService } from 'angular-notifier';
import * as moment from 'moment';
import * as _ from 'lodash';

@Component({
  selector: 'app-services',
  templateUrl: './services.component.html',
  styleUrls: ['./services.component.less']
})
export class ServicesComponent implements OnInit {

  @ViewChild("customNotification", { static: true }) customNotificationTmpl;

  public closeResult: string;
  public home:any;
  public timeStamp:any = [];
  private notifier: NotifierService;

  //Service Category Modal
  public calculate:any;
  public listService:boolean = true;
  public arrangementService:boolean = false;
  public transportationService:boolean = false;
  public intermentService:boolean = false;
  public cremationService:boolean = false;
  public embalmingService:boolean = false;
  public otherService:boolean = false;
  public quickService:boolean = false;
  public showAutoComplete:boolean = false;
  public selectedService:string = 'All services';
  public serviceId:string = '';
  public identifier:string = '';
  public paidAmount:any = 0;
  public currentInvoiceStatus:string = '';
  public invoiceStatus:string = '';

  public selectedServiceList:any = [];
  public serviceList:any = [];
  public serviceCategory:any = [];
  public vendorsList:any = [];
  public selectedVendorsList:any = [];
  public mainServiceSelectedList:any = [];
  public vehicleServiceList:any = [];

  public isLoading:boolean = false;
  public showService:boolean = false;
  public discountAmount:any = 0;
  public discountPercentage:any = 0;
  public showDiscount:boolean = false;

  public limit:number = 6;

  //model data for form modal

  public arrangement = {
    adjudicator : {
      category : '',
      name : 'Adjudicator',
      vendor : null,
      vendor_name : '',
      price : 0,
      check: false,
      identifier: 'arrangement'
    },
    casket : {
      category : '',
      name : 'Casket Rental',
      vendor : null,
      vendor_name : '',
      price : 0,
      check : false,
      identifier: 'arrangement'
    },
    grave : {
      category : '',
      name : 'Grave clothes/shroud',
      vendor : null,
      vendor_name : '',
      price : 0,
      check : false,
      identifier: 'arrangement'
    },
    staffProf : {
      category : '',
      name : 'Staff and professional services',
      vendor : null,
      vendor_name : '',
      price : 0,
      check : false,
      identifier: 'arrangement'
    },
    facilities : {
      category : '',
      name : 'Facilities',
      vendor : null,
      vendor_name : '',
      price : 0,
      check : false,
      identifier: 'arrangement'
    },
    floral : {
      category : '',
      name : 'Floral',
      vendor : null,
      vendor_name : '',
      price : 0,
      check : false,
      identifier: 'arrangement'
    },
    prepare : {
      category : '',
      name : 'Prepare shelter remains',
      vendor : null,
      vendor_name : '',
      price : 0,
      check : false,
      identifier: 'arrangement'
    }
  };

  public transportation = {
    vehicles : {
      check: false,
      identifier: 'transportation',
      price : 0,
      data : null
    },
    transferOfDeceased : {
      category : '',
      name : 'Transfer of deceased',
      vendor : null,
      check: false,
      identifier: 'transportation',
      price : 0,
      additionalInfo : [{
        name : 'Vehicle',
        value : 0,
      }],
    }
  };
  
  public interment = {
    interment : {
      category : '',
      name : 'Interment',
      vendor : null,
      vendor_name : '',
      price : 0,
      check : false,
      identifier: 'interment',
      burial_date : '',
      burial_time : '',
      plot_owner : '',
      plot_number : '',
      additionalInfo : [{
        name: "Burial date/time",
        value : null
      }]
    },
    casket : {
      category : '',
      name : 'Casket',
      vendor : null,
      vendor_name : '',
      price : 0,
      check : false,
      identifier: 'interment',
    },
    gravesideService : {
      category : '',
      name : 'Graveside service',
      vendor : null,
      vendor_name : '',
      price : 0,
      check : false,
      identifier: 'interment',
    }
  };
  
  public cremation = {
    cremation : {
      category : '',
      name : 'Cremation',
      vendor : null,
      vendor_name : '',
      price : 0,
      check : false,
      identifier: 'cremation',
    },
    urn : {
      category : '',
      name : 'Urn',
      vendor : null,
      vendor_name : '',
      price : 0,
      check : false,
      identifier: 'cremation',
    }
  };
  
  public embalming = {
    embalming : {
      category : '',
      name : 'Embalming',
      vendor : null,
      vendor_name : '',
      price : 0,
      check : false,
      identifier: 'embalming',
    }
  };
  
  public quick_service = {
    quick_service : {
      category : null,
      name : '',
      vendor : null,
      price : 0,
      check : false,
      identifier: 'quick_service',
    }
  };

  constructor(
    public activeModal: NgbActiveModal,
    private modalService: NgbModal,
    private servicesService : ServicesService,
    private appService : AppService,
    private helperService : HelperService,
    private vendorsService : VendorsService,
    private bookingService : BookingService,
    private billingService: BillingService,
    private notifierService : NotifierService
    ) {
      this.notifier = notifierService;
    }

  ngOnInit() {
    this.subscribeData();
    this.timeInterval();
    this.serviceCategory = this.appService.serviceCategory;
    this.serviceList = this.appService.service;
    this.currentInvoiceStatus = this.bookingService.currentInvoiceStatus;
    this.invoiceStatus = this.bookingService.invoiceStatus;
    this.home = this.appService.getHome();
  }

  subscribeData(){
    this.appService.serviceChange.subscribe((service) => this.serviceList = service);
    this.billingService.paidAmountChange.subscribe((amount) => this.paidAmount = amount);
    this.bookingService.currentInvoiceStatusChange.subscribe((status) => this.currentInvoiceStatus = status);
    this.bookingService.invoiceStatusChange.subscribe((status) => this.invoiceStatus = status);
  }

  closeServices(){
    this.modalService.dismissAll(this.closeResult);
  }

   //search keyword on the API

   search(keyword, identifier){
    this.identifier = identifier;
    let defaultParams = {
      q : keyword.length > 0 ? keyword : null,
      limit: this.limit
    };
    let params = Object.assign(defaultParams);
    this.vendorsService.getVendorsByKeyword(params)
      .subscribe((results) => {
        this.showAutoComplete = true;
        this.vendorsList = results.vendors
      },(err) => {
        console.dir(err);
      })
  }

   //open selecting a vendor on the query of the API, it will just populate the
  //needed data form and save the vendor._id

  populateVendorName(data:any,reset:boolean = false){
    this.pushArrayVendor(data);
    switch(data.id){
      case 'arrangement':
        this.arrangement[data.identifier].vendor_name = data.vendor.name;
        this.arrangement[data.identifier].vendor = data.vendor._id;
        break;
      case 'interment':
        this.interment[data.identifier].vendor_name = data.vendor.name;
        this.interment[data.identifier].vendor = data.vendor._id;
        break;
      case 'casket':
        this.interment[data.identifier].vendor_name = data.vendor.name;
        this.interment[data.identifier].vendor = data.vendor._id;
        break;
      case 'cremation':
        this.cremation[data.identifier].vendor_name = data.vendor.name;
        this.cremation[data.identifier].vendor = data.vendor._id;
        break;
      case 'embalming' :
        this.embalming[data.identifier].vendor_name = data.vendor.name;
        this.embalming[data.identifier].vendor = data.vendor._id;
        break;
      default : console.log('nothing to add');
    };
  }

  populateShowAutoComplete(show:any,boolean = false){
    this.showAutoComplete = false;
  }

  //this is to reset the visibility of the form
  showServiceList(){
    this.listService = true;
    this.arrangementService = false;
    this.transportationService = false;
    this.intermentService = false;
    this.cremationService = false;
    this.embalmingService = false;
    this.otherService = false;
    this.quickService = false;
    this.selectedService = 'All services';
  }

  //openService Details modal

  openServiceDetails(content,id){
    this.listService = false;
    this.serviceId = id;
    switch(content){
      case 'Arrangement':
        this.selectedService = 'Arrangement';
        this.arrangementService = true;
        break;
      case 'Transportation':
        this.selectedService = 'Transportation';
        this.transportationService = true;
        break;
      case 'Interment':
        this.selectedService = 'Interment';
        this.intermentService = true;
        break;
      case 'Cremation':
        this.selectedService = 'Cremation';
        this.cremationService = true;
        break;
      case 'Embalming':
        this.selectedService = 'Embalming';
        this.embalmingService = true;
        break;
      case 'quickService':
        this.selectedService = 'Quick service';
        this.quickService = true;
        break;
      default: this.otherService = true;
      break;
    }
  }

  //adding price autocheckbox

  onChangedPrice(event,data,identifier,index){
    if ( identifier === 'arrangement' ) {
      this.arrangement[data].check = true;
      if (this.arrangement[data].check){
        this.arrangement[data].category = this.serviceId;
        this.pushToArray(this.arrangement[data]);
      }
    } else if (identifier === 'transportation') {
      this.transportation[data].check = true;
      if (this.transportation[data].check){
        this.transportation[data].category = this.serviceId;
        this.pushToArray(this.transportation[data]);
      }
    } else if (identifier === 'interment') {
      this.interment[data].check = true;
      if (this.interment[data].check){
        this.interment[data].category = this.serviceId;
        this.pushToArray(this.interment[data]);
      }
    } else if (identifier === 'cremation') {
      this.cremation[data].check = true;
      if (this.cremation[data].check){
        this.cremation[data].category = this.serviceId;
        this.pushToArray(this.cremation[data]);
      }
    } else if (identifier === 'embalming') {
      this.embalming[data].check = true;
      if (this.embalming[data].check){
        this.embalming[data].category = this.serviceId;
        this.pushToArray(this.embalming[data]);
      }
    } else if (identifier === 'yourservice') {
      this.serviceList[index].check = true;
      if (this.serviceList[index].check){
        this.serviceList[index];
        this.serviceList[index].identifier = 'yourservice';
        this.validateAndPush(this.serviceList[index]);
      }
    } else if (identifier === 'quick_service'){
      this.quick_service[data].check = true;
      if (this.quick_service[data].check){
        this.pushToArray(this.quick_service[data]);
      }
    } else if (identifier === 'transportation'){
      this.transportation[data].check = true;
      if (this.transportation[data].check){
        this.transportation[data].category = this.serviceId;
        this.pushToArray(this.transportation[data]);
      }
    }
  }

  //checking the service checkbox event.

  onSelectService(event,data,identifier,index){
    if (identifier === 'arrangement') {
      if (this.arrangement[data].check) {
          this.arrangement[data].category = this.serviceId;
          this.pushToArray(this.arrangement[data]);
      }
    } else if (identifier === 'transportation') {
        if (this.transportation[data].check){
          this.transportation[data].category = this.serviceId;
          this.pushToArray(this.transportation[data]);
        }
    } else if (identifier === 'interment') {
      if (this.interment[data].check){
          this.interment[data].category = this.serviceId;
          this.pushToArray(this.interment[data]);
      }
    } else if (identifier === 'cremation') {
      if (this.cremation[data].check){
        this.cremation[data].category = this.serviceId;
        this.pushToArray(this.cremation[data]);
      }
    } else if (identifier === 'embalming') {
      if (this.embalming[data].check){
        this.embalming[data].category = this.serviceId;
        this.pushToArray(this.embalming[data]);
      }
    } else if (identifier === 'yourservice') {
      if (this.serviceList[index].check){
        this.serviceList[index];
        this.serviceList[index].identifier = 'yourservice';
        this.validateAndPush(this.serviceList[index]);
      }
    } else if (identifier === 'quick_service'){
      if (this.quick_service[data].check){
        this.pushToArray(this.quick_service[data]);
      }
    }
  }

   //getting data by identifier
  
getDataByIdentifier(identifier){
  let filteredService;
  if (identifier === 'transportation'){
    filteredService = this.selectedServiceList.filter((item) => item.identifier === identifier && item.name !== 'Vehicles' );
  } else {
    filteredService = this.selectedServiceList.filter((item) => item.identifier === identifier && item.check !== false );
  }
  return filteredService;
}

 //getting total price of service by identifier

 getDataPriceByIdentifier(identifier){
  let filteredService = this.selectedServiceList.filter((item) => item.identifier === identifier && item.check !== false );
  let sum = filteredService.reduce((accumulator,currentValue) => {
    return currentValue.price + accumulator;
  },0);
  return sum;
}

  //sum of all service price

  getServicePrice(){
    let filteredService = this.selectedServiceList.filter((item) => item.check !== false );
    let sum = filteredService.reduce((accumulator,currentValue) => {
      return currentValue.price + accumulator;
    },0);
    return sum;
  }

    //adding vehicle input

  addVehicle(){
    this.vehicleServiceList.push({
      category : this.serviceId,
      name : 'Vehicles',
      price : 0,
      identifier: 'transportation',
      additionalInfo : [{
        name : 'Vehicles',
        value : ''
      }]
    });
    let lastIndex = this.vehicleServiceList.length - 1;
    this.selectedServiceList.push(this.vehicleServiceList[lastIndex]);
    //to get all the dom
    setTimeout(() => this.helperService.ngSelectArrow(), 100);
  }

 //this is for vehicle filter, special case for vehicle

  getTransportationData(identifier){
    let filteredService = this.selectedServiceList.filter((item) => item.identifier === identifier && item.check !== false && item.data !== null );
    return filteredService;
  }

  //getting all the data in selectedServiceList array

  getSelectedService(){
    let service = this.selectedServiceList.filter((item) => item.check !== false && item.name);
    return service;
  }

  //update or push array find by mongodb _id

  validateAndPush(data){
    const index = this.selectedServiceList.findIndex((e) => e.name === data.name);
    if (index === -1){
      this.selectedServiceList.push(data);
    } else {
      this.selectedServiceList[index] = data;
    }
  }

  //setting or updating the array data

  pushToArray(data){
    const index = this.selectedServiceList.findIndex((e) => e.name === data.name);
    if (index === -1){
      this.selectedServiceList.push(data);
    } else {
      this.selectedServiceList[index] = data;
    }
  }

  //push vendor
  pushArrayVendor(data){
    this.appService.setSelectedVendors(data.vendor);
  }

  addInvoice(){
    this.notifier.hideAll();
    if (this.arrangementService) {
      let arrangement = this.getDataByIdentifier('arrangement');
      this.showServiceList();
    } else if (this.transportationService) {
      let transportation = this.getTransportationData('transportation');
      this.showServiceList();
    } else if (this.intermentService) {
      let interment = this.getDataByIdentifier('interment');
      this.interment['interment'].additionalInfo[0].value = this.formatDate(this.interment['interment'].burial_date, this.interment['interment'].burial_time);
      this.showServiceList();
    } else if (this.embalmingService){
      let embalming = this.getDataByIdentifier('embalming');
      this.showServiceList();
    } else if (this.otherService){
      let yourservice = this.getDataByIdentifier('yourservice');
      this.showServiceList();
    } else if (this.quickService){
      let quick_service = this.getDataByIdentifier('quick_service');
      this.showServiceList();
    } else {
      if (this.selectedServiceList.length <= 0) {
        this.closeServices();
      } else {
        this.pushtoMainServiceArr(this.selectedServiceList);
        let arr =  this.filterAlowedProperty(this.mainServiceSelectedList);
        this.appService.setServiceBooking(this.mainServiceSelectedList);
        this.appService.setChangeFields(true);
        this.addBookingService();
        this.clearModalData();
        this.closeServices();
      }
    }
  }

  addBookingService(){
    let updateServiceList = this.appService.updateServiceList;
    if (updateServiceList.length > 0){
      for (let key in updateServiceList){
        this.appService.serviceBooking.push(updateServiceList[key]);
      }
    }
    
    
    this.isLoading = true;
    let service = {
      services : this.filterAlowedProperty(this.appService.serviceBooking),
      discountAmount: parseInt(this.discountAmount),
      discountPercentage: parseInt(this.discountPercentage)
    };
    
    this.bookingService.addBookingService(service)
      .subscribe((res) => {
        this.isLoading = false;
        this.appService.setshowService(true);
        this.appService.setCalculateDiscount(res);
        this.appService.setShowDiscount(false);
        this.appService.setServiceBookingData(service.services);
        this.billingService.setRemainingAmount(res.total - this.billingService.paidAmount);
        let status = this.invoiceStatus === 'paid' ? 'partially paid' : this.invoiceStatus;
        this.bookingService.setCurrentInvoiceStatus(status);
        this.notifier.show({
          message: "Succesfully add a service",
          type: "default",
          template: this.customNotificationTmpl,
          id: "notif_succcess_id"
        });
      },(err) => {
        console.dir(err);
      });
  }

  clearModalData(){
    this.arrangement = {
      adjudicator : {
        category : '',
        name : 'Adjudicator',
        vendor : null,
        vendor_name : '',
        price : 0,
        check: false,
        identifier: 'arrangement'
      },
      casket : {
        category : '',
        name : 'Casket Rental',
        vendor : null,
        vendor_name : '',
        price : 0,
        check : false,
        identifier: 'arrangement'
      },
      grave : {
        category : '',
        name : 'Grave clothes/shroud',
        vendor : null,
        vendor_name : '',
        price : 0,
        check : false,
        identifier: 'arrangement'
      },
      staffProf : {
        category : '',
        name : 'Staff and professional services',
        vendor : null,
        vendor_name : '',
        price : 0,
        check : false,
        identifier: 'arrangement'
      },
      facilities : {
        category : '',
        name : 'Facilities',
        vendor : null,
        vendor_name : '',
        price : 0,
        check : false,
        identifier: 'arrangement'
      },
      floral : {
        category : '',
        name : 'Floral',
        vendor : null,
        vendor_name : '',
        price : 0,
        check : false,
        identifier: 'arrangement'
      },
      prepare : {
        category : '',
        name : 'Prepare shelter remains',
        vendor : null,
        vendor_name : '',
        price : 0,
        check : false,
        identifier: 'arrangement'
      }
    };
  
    this.transportation = {
      vehicles : {
        check: false,
        identifier: 'transportation',
        price : 0,
        data : null
      },
      transferOfDeceased : {
        category : '',
        name : 'Transfer of deceased',
        vendor : null,
        check: false,
        identifier: 'transportation',
        price : 0,
        additionalInfo : [{
          name : 'Vehicle',
          value : 0,
        }],
      }
    };
  
    this.interment = {
      interment : {
        category : '',
        name : 'Interment',
        vendor : null,
        vendor_name : '',
        price : 0,
        check : false,
        identifier: 'interment',
        burial_date : '',
        burial_time : '',
        plot_owner : '',
        plot_number : '',
        additionalInfo : [{
          name: "Burial date/time",
          value : null
        }]
      },
      casket : {
        category : '',
        name : 'Casket',
        vendor : null,
        vendor_name : '',
        price : 0,
        check : false,
        identifier: 'interment',
      },
      gravesideService : {
        category : '',
        name : 'Graveside service',
        vendor : null,
        vendor_name : '',
        price : 0,
        check : false,
        identifier: 'interment',
      }
    };
  
    this.cremation = {
      cremation : {
        category : '',
        name : 'Cremation',
        vendor : null,
        vendor_name : '',
        price : 0,
        check : false,
        identifier: 'cremation',
      },
      urn : {
        category : '',
        name : 'Urn',
        vendor : null,
        vendor_name : '',
        price : 0,
        check : false,
        identifier: 'cremation',
      }
    };
  
    this.embalming = {
      embalming : {
        category : '',
        name : 'Embalming',
        vendor : null,
        vendor_name : '',
        price : 0,
        check : false,
        identifier: 'embalming',
      }
    };
  
    this.quick_service = {
      quick_service : {
        category : null,
        name : '',
        vendor : null,
        price : 0,
        check : false,
        identifier: 'quick_service',
      }
    };
    
    this.appService.setService(null);
    //this.serviceList = [];
  }

  pushtoMainServiceArr(data){
    try {
      for (let key = 0; key < data.length; key++){
        this.mainServiceSelectedList.push(data[key]);
      }
      //clear data
      this.selectedServiceList = [];
      return;
    } catch(err) {
      console.dir(err);
    }
  }

  filterAlowedProperty(data){
    return this.helperService.filterAlowedProperty(data);
  }

  formatDate(date,time){
    if (date){
      let m = date.month;
      let d = date.day;
      let y = date.year;
      let t = (time ? time : "00:00:00");
      let dateTime = `${m}-${d}-${y} ${t}`;
      let momentDate = moment(dateTime).format();
      return momentDate;
    } else {
      return;
    }
  }

  formatNumber(num){
    if (Number.isInteger(num)){
      return `${num}.00`;
    }
    return num;
  }

  timeInterval(){
    let x = 30;
    let tt = 0;
    let ap = ['AM', 'PM'];

    for (let  i= 0; tt < 24*60; i++) {
      let hh = Math.floor( tt / 60);
      let mm = ( tt % 60 );
      this.timeStamp[i] = ("0" + ( (hh % 12 !== 0 ? hh % 12 : 12) )).slice(-2) + ':' + ("0" + mm).slice(-2) + ' ' + ap[Math.floor(hh/12)];
      tt = tt + x;
    }
  }

  moveCursorToEnd(event){
    this.helperService.moveCursorToEnd(event);
  }

  trackByFn(index, item) {
    return index;
  }
  
}
