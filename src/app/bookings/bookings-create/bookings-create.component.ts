import { Component, OnInit, ChangeDetectorRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { FormErrorParser } from '../../shared/util/form-error-parser';
import errorMessages from '../../shared/validation-messages/add-booking';
import { Bookings } from '../../shared/interface/booking';
import { Vendors } from '../../shared/interface/vendors';
import { User } from '../../shared/interface/user';
import { Env } from '../../shared/interface/env';
import { BookingService } from '../../shared/service/booking.service';
import { VendorsService } from '../../shared/service/vendor.service';
import { ServicesService } from '../../shared/service/services.service';
import { BillingService } from '../../shared/service/billing.service';
import { UserService } from '../../shared/service/user.service';
import { AppService } from '../../shared/util/app.service';
import { HelperService } from '../../shared/util/helper.service';
import { SettingsService } from '../../shared/service/settings.service';
import { NgbModal, ModalDismissReasons, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ServicesComponent } from '../../shared/components/services/services.component';
import { WarningPageComponent } from '../../shared/components/warning-page/warning-page.component';
import { NotifierService } from 'angular-notifier';
import * as moment from 'moment';
// import * as _ from 'lodash';


@Component({
  selector: 'app-bookings-create',
  templateUrl: './bookings-create.component.html',
  styleUrls: ['./bookings-create.component.less']
})
export class BookingsCreateComponent implements OnInit {

  @ViewChild("customNotification", { static: true }) customNotificationTmpl;
  
  public env : Env;
  public booking: Bookings;

  public userList: User[] = [];
  public vendorsList:any = [];
  public documents:any = [];
  public serviceCategory:any = [];
  public serviceList:any = [];
  public selectedServiceList:any = [];
  public arrangementSelectedService:any = [];
  public mainServiceSelectedList:any = [];
  public timeStamp:any = [];
  public vehicleServiceList:any = [];
  public serviceBookingData:any = [];

  public maritalStatus:any = [];
  public genderEnums:any = [];
  public relationshipDeceasedEnums:any = [];
  public eventsTypeEnums:any = [];

  public firstName:string = '';
  public familyName:string = '';
  public relationshipDeceased:string  = '';
  public city:string = '';
  public isDirty:boolean = false;
  public isExitButtonClick:boolean = false;
  public isDisabled:boolean = true;
  public isInit:boolean = true;
  public isFormChanges:boolean = false;

  public clientName:string = '';
  public clientFamilyName:string = '';
  public deceasedName:string = '';
  public deceasedFamilyName:string = '';

  public paidAmount:any = 0;
  public payment:any = {
    sourceId: '',
    last4: '',
    type: 'Unknown'
  }

  public calculate:any;
  public alertMetaData: any;

  public openNote:boolean = false;

  public startTtime:string = '';
  public endTime:string = '';
  public imagePath:string = '';
  public discount:string = '$';
  public paymentConfirmation:string = '';
  public clearData:boolean = false;

  public form: FormGroup;
  public formErrors = errorMessages;

  public hasImage:boolean = false;
  public uploadingImages: boolean = false;
  public isLoading:boolean = true;
  public showDiscount:boolean = false;
  public paymentComplete:boolean = false;

  //for service modal
  public calculateDiscount:any;
  public closeResult:string;
  public showService:boolean = false;
  public bookingServices:any = [];
  public updateServiceList:any = [];
  public selectedVendorsList:any = [];
  public invoiceStatus:any = [];
  public discountAmount:any;
  
  private notifier: NotifierService;

  constructor(
    private bookingService : BookingService,
    private vendorsService : VendorsService,
    private userService : UserService,
    private servicesService : ServicesService,
    private settingsService : SettingsService,
    private billingService : BillingService,
    private router: Router,
    private cdRef: ChangeDetectorRef,
    private fb: FormBuilder,
    private modalService: NgbModal,
    private appService : AppService,
    private helperService : HelperService,
    private notifierService : NotifierService
  ) {
    this.notifier = notifierService;
    this.subscribeEvents();
    this.generateAlertMetaData();
    this.initiateForm();
    // window.addEventListener("beforeunload", (event) => {
    //   event.preventDefault();
    //   event.returnValue = "Unsaved modifications";
    //   return event;
    // });
  }

  ngOnInit() {
    window.localStorage.clear();
    window.scrollTo(0,0);
    this.getMetaData();
    this.getFuneralUsers();
    this.addEmployee();
    this.addFamilyMembers();
    this.addFuneralEvents();
    this.getServiceCategory();
    this.timeInterval();
    this.getEnvVariables();
    this.getServices();
    this.onChanges();
    this.appService.setServiceBooking(null);
    this.appService.setCalculateDiscount({
      subTotal : 0,
      tax : 0,
      total : 0
    });
    this.appService.setDiscountAmount({
      discountAmount : 0,
      discountPercentage : 0,
      discountReason : ''
    });
    this.paidAmount = this.billingService.paidAmount ? this.billingService.paidAmount : 0;
    localStorage.setItem('paidAmount',JSON.stringify(this.paidAmount));
    //to get all the dom
    setTimeout(() => {
      this.helperService.ngSelectArrow();
      this.isInit = false;
    },100);
  }

   //subscribe state events
  subscribeEvents(){
    this.appService.serviceBookingChange.subscribe((services)=> this.bookingServices = services);
    this.appService.showServiceChange.subscribe((showService) => this.showService = showService);
    this.appService.selectedVendorsListChange.subscribe((vendors) => this.selectedVendorsList = vendors.filter((item) => item != null));
    this.appService.calculateDiscountChange.subscribe((data) => this.calculateDiscount = data)
    this.appService.discountAmountChange.subscribe((data) => this.discountAmount = data);
    this.appService.serviceBookingDataChange.subscribe((data) => this.serviceBookingData = data);
    this.appService.isExitButtonClickChanged.subscribe((data) => this.isExitButtonClick = data);
    this.billingService.paidAmountChange.subscribe((amount) => this.paidAmount = amount);
    this.billingService.remainingAmountChange.subscribe((amount) => {
      if (amount <= 0){
        this.form.controls.invoiceStatus.setValue('paid');
      }
    });
    this.bookingService.currentInvoiceStatusChange.subscribe((status) => {
      if (this.form) {
        this.form.controls.invoiceStatus.setValue(status);
        this.paymentComplete = (status === 'paid' ? true : false);
      }
    });
  }

  getMetaData(){
    this.bookingService.getMetaData()
      .subscribe((res) => {
        this.invoiceStatus = res.invoiceStatus;
        this.genderEnums = res.deceasedGender;
        this.maritalStatus = res.deceasedMaritalStatus;
        this.relationshipDeceasedEnums = res.familyMembers;
        this.eventsTypeEnums = res.eventsType;
      },(err) => {
        console.dir(err);
      })
  }

  setBookingData(){
    this.booking = this.appService.booking;
    if (!this.booking){
      this.router.navigate(['/bookings']);
    }
    this.calculateDiscount = {
      subTotal: this.booking.subTotal,
      tax : this.booking.tax,
      total : this.booking.total
    };
    this.appService.setCalculateDiscount(this.calculateDiscount);
    this.appService.setUpdateServiceList(this.booking.services);
    this.setSelectedVendor(this.booking);
  }

  setSelectedVendor(data){
    let vendor = data.services;
    for(let key in vendor){
      if ('vendor' in vendor[key]) {
        this.appService.setSelectedVendors(vendor[key].vendor);
      }
    }
  }

  getServiceCategory(){
    this.servicesService.getServicesCategory()
      .subscribe((res) => {
        this.appService.setServiceCategory(res.serviceCategories);
      },(err) => {
        console.dir(err);
      })
  }

  getServices(){
    this.servicesService.getServices(null)
    .subscribe((res) => {
      this.appService.setService(res.services);
    },(err) => {
      console.dir(err);
    })
  }

  getEnvVariables(){
    this.settingsService.getEnvVariables()
      .subscribe((env) => {
        this.env = env;
        this.isLoading = false;
      },(err) => {
        console.log(err);
      })
  }

  getFuneralUsers(){
    this.userService.getUsers()
      .subscribe((res) => {
        this.userList = res.user;
      },(err) => {
        console.dir(err);
      })
  }
  
  addEmployee(){
    if (this.isDisabled && !this.isInit){
      return;
    }

    const employees = this.form.get('employees') as FormArray;
    employees.push(this.fb.group({
      employee: '',
      assignment: '',
    }));

    if (this.isDisabled){
      this.disableInputs('employees');
    }

    setTimeout(() => this.helperService.ngSelectArrow(), 50);
  }

  addFamilyMembers(){
    if (this.isDisabled && !this.isInit){
      return;
    }

    const familyMembers = this.form.get('familyMembers') as FormArray;
    familyMembers.push(this.fb.group({
      firstName: '',
      familyName: '',
      relationshipDeceased: '',
      city: ''
    }));

    if (this.isDisabled){
      this.disableInputs('familyMembers');
    }

    setTimeout(() => this.helperService.ngSelectArrow(), 50);
  }

  addFuneralEvents(){
    if (this.isDisabled && !this.isInit){
      return;
    }
    const events = this.form.get('funeralEvents') as FormArray;
    events.push(this.fb.group({
      eventsType: '',
      location: '',
    }));

    if (this.isDisabled){
      this.disableInputs('funeralEvents');
    }

    setTimeout(() => this.helperService.ngSelectArrow(), 50);
  }

  disableInputs(indentifier) {
    (<FormArray>this.form.get(indentifier))
      .controls
      .forEach(control => control.disable());
  }

  enableInputs() {
    let arr = ['familyMembers', 'funeralEvents', 'employees'];
    for (let key in arr){
      (<FormArray>this.form.get(arr[key]))
      .controls
      .forEach(control => control.enable());
    }
  }

  poplateEulogy(eulogy:string,reset:boolean = false){
    this.form.controls.eulogy.setValue(eulogy);
  }

  populateImages(images: any, reset: boolean = false) {
      this.imagePath = images;
      this.hasImage = true;
      this.form.controls.deceasedImage.setValue(this.imagePath)
  }
  
  setHasImage(){
    this.hasImage = false;
  }
  
  populateIsLoading(bool:boolean,reset:boolean = false){
    this.isLoading = bool;
  }

  populateStartTime(time:string,reset:boolean = false){
    this.startTtime = this.formatTime(time);
  }
  
  populateEndTime(time:string,reset:boolean = false){
    this.endTime = this.formatTime(time);
  }

  populateDocuments(docs:string, reset:boolean = false){
    this.documents = docs;
    this.form.controls.documents.setValue(docs);
  }

  populateError(docs:string, reset:boolean = false){
    this.notifier.notify( 'error', 'Uploading failed');
    this.isLoading = false;
  }
  
  vendorDataFilterDuplicate(){
    return this.helperService.vendorDataFilterDuplicate(this.selectedVendorsList);
  }

  populateServiceToken(token:string,reset:boolean = false){
    let arr =  this.filterAlowedProperty(this.appService.serviceBooking);
    this.addBookingServicePayment(arr,token)
  }

  onChanges(): void {
    this.form.valueChanges.subscribe((val) => {
      this.bookingService.setInvoiceStatus(val.invoiceStatus);
      this.paymentComplete = (val.invoiceStatus === 'paid' ? true : false);
      if (!this.isInit){
        this.isFormChanges = true;
        this.isDirty = true;
        setTimeout(() => this.appService.setFormChange(true),1000)
      }
      if (this.form.valid){
        this.isDisabled = false;
      }
    });
  }

  onchangeEvent(event): void {
    if (this.form.valid && !this.isDisabled){
      this.enableInputs();
    }
  }

  preNeedOnChange(event){
    if (event){
      this.form.controls.dateOfDeath.disable();
      this.form.controls.dateOfDeath.setValue(null);
    } else {
      this.form.controls.dateOfDeath.enable();
    }
  }

  addBookingServicePayment(data,token){
    let discountAmount = this.discountAmount ? this.discountAmount.discountAmount : 0;
    let discountPercentage = this.discountAmount ? this.discountAmount.discountPercentage : 0;
    let service = {
      services : data,
      discountAmount: discountAmount,
      discountPercentage: discountPercentage,
      token : token,
      paidAmount: this.paidAmount
    };
    this.bookingService.addBookingServicePayment(service)
      .subscribe((results) => {
        this.payment = {
          sourceId: results.payment.id,
          last4: results.payment.last4,
          type: results.payment.brand
        };
        this.billingService.setCreditCardNum(this.payment.last4);
        let paidAmount = parseInt(localStorage.getItem('paidAmount'));
        paidAmount = paidAmount  + this.paidAmount;
        this.billingService.setPaidAmount(paidAmount);
        localStorage.setItem('paidAmount', JSON.stringify(paidAmount));
        this.billingService.setRemainingAmount(this.calculateDiscount.total - paidAmount);
        this.paymentConfirmation = results.paymentConfirmation;
        this.paymentComplete = this.paidAmount >= this.calculateDiscount.total ? true : false;
        let invoiceStatus = this.paymentComplete ? 'paid' : 'partially paid';
        this.bookingService.setCurrentInvoiceStatus(invoiceStatus);
        this.form.controls.invoiceStatus.setValue(invoiceStatus);
        this.notifier.show({
          message: "Succesfully Payment successfull",
          type: "default",
          template: this.customNotificationTmpl,
          id: "notif_succcess_id"
        });
      },(err) => {
        this.billingService.setError(true);
        this.billingService.setIsLoading(false);
        this.notifier.notify( 'error', this.appService.formatErrorResponse(err));
      });
  }

  filterAlowedProperty(data){
    return this.helperService.filterAlowedProperty(data);
  }

  exitClick(){
    this.appService.setIsExitButtonClick(true);
    if (this.isDirty) {
      this.appService.setWarningIdentifier('/bookings');
      this.modalService.open(WarningPageComponent, {
        ariaLabelledBy: 'modal-basic-title',
        centered: true,
        backdrop : 'static'
      }).result.then((result) => {
        this.closeResult = `Closed with: ${result}`;
      },(reason) => {
        this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
      });
    } else {
      this.router.navigate(['/bookings']);
    }
  }

  onClick() {
    this.getServices();
    this.modalService.open(ServicesComponent, {
      windowClass: 'addServiceModal',
      ariaLabelledBy: 'modal-basic-title',
      centered: true,
      size: 'lg',
      backdrop : 'static'
    }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    },(reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  closeModal():void {
    this.modalService.dismissAll(this.closeResult);
  }

  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return  `with: ${reason}`;
    }
  }

  isUploading(uploading: boolean) {
    this.uploadingImages = uploading;
    this.cdRef.detectChanges();
  }

  initiateForm(): void {
    this.form = this.fb.group({
      clientName: ['',[Validators.required]],
      clientFamilyName: ['',[Validators.required]],
      clientEmail : [],
      clientPhoneNo: [],
      clientRelationshipDeceased : [],
      clientAddress: [],
      clientAptNo:[],
      clientCity:[],
      clientProvince:[],
      clientCountry:[],
      clientPostalCode:[],
      serviceDate : [],
      serviceStartEnd: [],
      deceasedName: ['',[Validators.required]],
      deceasedMiddleName: [''],
      deceasedFamilyName: ['',[Validators.required]],
      deceasedGender: [''],
      deceasedMaritalStatus: [''],
      deceasedPlaceOfBirth: [''],
      deceasedPlaceOfDeath: [''],
      deceasedSocialInsureNo: [],
      deceasedAge: [],
      deceasedEducationLevel: [],
      deceasedOccupation: [],
      deceasedImage: [],
      deceasedAddress: [],
      deceasedAptNo: [],
      deceasedCity: [],
      deceasedProvince: [],
      deceasedCountry: [],
      deceasedPostalCode: [],
      dateOfDeath: [{value: null,disabled:false}],
      serviceLocation: [],
      eulogy: [],
      services: [],
      discountAmount: [],
      discountReason: [],
      invoiceStatus: [],
      documents: [],
      notes: [],
      employees: this.fb.array([]),
      familyMembers: this.fb.array([]),
      funeralEvents: this.fb.array([]),
      preNeed:[],
    });
    this.initiateValidator();
  }

  resetForm(): void {
    this.form.reset({
      clientName: '',
      clientFamilyName: '',
      clientEmail : '',
      clientPhoneNo: '',
      clientRelationshipDeceased : '',
      clientAddress: '',
      clientAptNo: '',
      clientCity: '',
      clientProvince: '',
      clientCountry: '',
      clientPostalCode: '',
      serviceDate : '',
      serviceStartEnd: '',
      deceasedName: '',
      deceasedMiddleName: '',
      deceasedFamilyName: '',
      deceasedGender: '',
      deceasedMaritalStatus: '',
      deceasedPlaceOfBirth: '',
      deceasedPlaceOfDeath: '',
      deceasedSocialInsureNo: '',
      deceasedAge: '',
      deceasedEducationLevel: '',
      deceasedOccupation: '',
      deceasedImage: '',
      deceasedAddress: '',
      deceasedAptNo: '',
      deceasedCity: '',
      deceasedProvince: '',
      deceasedCountry: '',
      deceasedPostalCode: '',
      dateOfDeath: '',
      serviceLocation: '',
      eulogy: '',
      services: '',
      discountAmount: '',
      discountReason: '',
      invoiceStatus: '',
      documents: '',
      notes: '',
      preNeed: ''
    });
  }

  prepareFields(): void {
    this.validateFormBeforeSubmit();
    this.generateAlertMetaData();
    this.appService.setIsExitButtonClick(true);
    if (this.form.valid) {
      let formValue = this.form.value;
      let booking = {
        clientName: formValue.clientName,
        clientFamilyName: formValue.clientFamilyName,
        clientEmail: formValue.clientEmail,
        clientPhoneNo: formValue.clientPhoneNo,
        clientRelationshipDeceased: formValue.clientRelationshipDeceased,
        clientAddress: {
          street: formValue.clientAddress,
          unitNo: formValue.clientAptNo,
          city: formValue.clientCity,
          province: formValue.clientProvince,
          country: formValue.clientCountry,
          postalCode: formValue.clientPostalCode
        },
        serviceStart: this.formatDate(formValue.serviceDate,this.startTtime),
        serviceEnd:  this.formatDate(formValue.serviceDate,this.endTime),
        deceasedName: formValue.deceasedName,
        deceasedMiddleName: formValue.deceasedMiddleName,
        deceasedFamilyName: formValue.deceasedFamilyName,
        deceasedGender: formValue.deceasedGender,
        deceasedMaritalStatus: formValue.deceasedMaritalStatus,
        deceasedPlaceOfBirth: formValue.deceasedPlaceOfBirth,
        deceasedPlaceOfDeath: formValue.deceasedPlaceOfDeath,
        deceasedSocialInsureNo: formValue.deceasedSocialInsureNo,
        deceasedAge: formValue.deceasedAge,
        deceasedEducationLevel: formValue.deceasedEducationLevel,
        deceasedOccupation: formValue.deceasedOccupation,
        deceasedImage: this.imagePath,
        deceasedAddress: {
          street: formValue.deceasedAddress,
          unitNo: formValue.deceasedAptNo,
          city: formValue.deceasedCity,
          province: formValue.deceasedProvince,
          country: formValue.deceasedCountry,
          postalCode: formValue.deceasedPostalCode
        },
        dateOfDeath: this.formatDate(formValue.dateOfDeath,'00:00:00'),
        serviceLocation: formValue.serviceLocation || '',
        eulogy: formValue.eulogy || '',
        invoiceStatus: formValue.invoiceStatus ? formValue.invoiceStatus : 'inquiry',
        employeeAssignments : this.checkArray(formValue.employees, 'employee'),
        familyMembers: this.checkArray(formValue.familyMembers, 'family'),
        funeralEvents: this.checkArray(formValue.funeralEvents, 'events'),
        documents: formValue.documents || [] ,
        services : this.getBookingSelectedBooking(null),
        discountAmount : this.discountAmount ? this.discountAmount.discountAmount : 0,
        discountPercentage : this.discountAmount ? this.discountAmount.discountPercentage : 0,
        discountReason : this.discountAmount ? this.discountAmount.discountReason : '',
        paymentConfirmation : this.paymentConfirmation,
        notes : this.breakLineNotes(formValue.notes) || [],
        payment: this.payment,
        paidAmount: this.billingService.paidAmount,
        preNeed: formValue.preNeed ? formValue.preNeed : false
      };
      this.addBooking(booking);  
    }
  }

  breakLineNotes(notes){
    if (notes){
      let note = notes.split('\n');
      let data = [];
      for (let key in note){
        let obj = { note: note[key] };
        data.push(obj);
      }
      return data;
    }
  }

  getBookingSelectedBooking(identifier){

    if (identifier === 'email'){
      let arr = this.serviceBookingData.map((item) => {
        if (item.name === 'Transfer of deceased' || item.name === 'Vehicles') {
          item.vehicles = true;
          if (item.name === 'Transfer of deceased') {
            item.additionalInfo[0].transfer = true;
          }
        }
        return item;
      });
      return arr;
    } else {
      let serviceBooking = this.filterAlowedProperty(this.appService.serviceBooking);
      return serviceBooking;
    }
  }

  addBooking(booking){
    this.bookingService.addBooking(booking)
      .subscribe((booking) => {
        //will just retain this code, might the client changed there mind
        // this.notifier.notify( 'success', 'Succesfully saved booking' );
        // this.form.reset();
        // this.clearBookingData();
        this.appService.setFormChange(false);
        this.router.navigate(['/bookings']);
      },(err) => {
        this.notifier.notify( 'error', this.appService.formatErrorResponse(err));
        this.clearBookingData();
      });
  }

  initiateValidator(): void {
    this.form.statusChanges.subscribe(changes => {
      this.formErrors = FormErrorParser.basic(this.formErrors, this.form, 'en', []);
    });
  }

  generateAlertMetaData(type: string = 'reset', errorMessage: string = ''): void {
    if (type === 'reset') {
      this.alertMetaData = {
        'showAlert': false,
        'success': null,
        'message': null,
        'class': ''
      };
    }

    if (type === 'success') {
      this.alertMetaData = {
        'showAlert': true,
        'success': errorMessage,
        'message': errorMessage,
        'class': 'alert-success'
      };
    }

    if (type === 'error') {
      this.alertMetaData = {
        'showAlert': true,
        'success': false,
        'message': errorMessage,
        'class': 'alert-danger'
      };
    }
  }

  validateFormBeforeSubmit(): void{
    this.formErrors = FormErrorParser.basic(this.formErrors, this.form, 'en', [], true);
  }

  checkArray(data, identifier){
    if (identifier === 'employee'){
      for(let key in data) {
        if(data[key].assignment === "" || data[key].employee === "") {
           delete data[key];
        }
      }
      let filtered = data.filter((el) => el != null)
      return filtered;
    } else if (identifier === 'family'){
      for(let key in data) {
        if(data[key].city === "" || data[key].familyName === "" || data[key].firstName === "" || data[key].relationshipDeceased === "") {
           delete data[key];
        }
      }
      let filtered = data.filter((el) => el != null)
      return filtered;
    } else if (identifier === 'events'){
      for(let key in data) {
        if(data[key].eventsType === "" || data[key].location === "") {
           delete data[key];
        }
      }
      let filtered = data.filter((el) => el != null)
      return filtered;
    }
  }

  formatDate(date,time){
    if (date){
      let m = date.month;
      let d = date.day;
      let y = date.year;
      let t = (time ? time : "00:00:00");
      let dateTime = `${m}-${d}-${y} ${t}`;
      let event = new Date(dateTime);
      return event.toISOString();
    } else {
      return '';
    }
  }

  formatDateEmail(date){
    if (!date) return;
    let m = date.month;
    let d = date.day;
    let y = date.year;
    let dateTime = `${m}-${d}-${y}`;
    let momentDate = moment(dateTime).format('ll');
    return momentDate;
  }
  
  formatTime(time){
    if(time){
      let hh = new Date(`2000-01-01 ${time}`).getHours();
      let mm = new Date(`2000-01-01 ${time}`).getMinutes();
      return `${hh}:${mm}`;
    }
  }

  splitString(str){
    return this.helperService.splitString(str);
  }

  trackByFn(index, item) {
    return index;
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

  formatToPrice(num){
    return this.helperService.formatToPrice(num);
  }

  goToInvoice(){
    let formValue = this.form.value;
    let booking = {
      clientName: formValue.clientName,
      clientFamilyName: formValue,
      clientEmail: formValue.clientEmail,
      clientPhoneNo: formValue.clientPhoneNo,
      clientRelationshipDeceased: formValue.clientRelationshipDeceased,
      clientAddress: {
        street: formValue.clientAddress,
        unitNo: formValue.clientAptNo,
        city: formValue.clientCity,
        province: formValue.clientProvince,
        country: formValue.clientCountry,
        postalCode: formValue.clientPostalCode
      },
      serviceStart: this.formatDate(formValue.serviceDate,this.startTtime),
      serviceEnd:  this.formatDate(formValue.serviceDate,this.endTime),
      deceasedName: formValue.deceasedName,
      deceasedMiddleName: formValue.deceasedMiddleName,
      deceasedFamilyName: formValue.deceasedFamilyName,
      deceasedGender: formValue.deceasedGender,
      deceasedMaritalStatus: formValue.deceasedMaritalStatus,
      deceasedPlaceOfBirth: formValue.deceasedPlaceOfBirth,
      deceasedPlaceOfDeath: formValue.deceasedPlaceOfDeath,
      deceasedSocialInsureNo: formValue.deceasedSocialInsureNo,
      deceasedAge: formValue.deceasedAge,
      deceasedEducationLevel: formValue.deceasedEducationLevel,
      deceasedOccupation: formValue.deceasedOccupation,
      deceasedImage: this.imagePath,
      deceasedAddress: {
        street: formValue.deceasedAddress,
        unitNo: formValue.deceasedAptNo,
        city: formValue.deceasedCity,
        province: formValue.deceasedProvince,
        country: formValue.deceasedCountry,
        postalCode: formValue.deceasedPostalCode
      },
      dateOfDeath: this.formatDate(formValue.dateOfDeath,'00:00:00'),
      serviceLocation: formValue.serviceLocation,
      eulogy: formValue.eulogy,
      invoiceStatus: formValue.invoiceStatus ? formValue.invoiceStatus : 'inquiry',
      employeeAssignments : this.checkArray(formValue.employees, 'employee'),
      familyMembers: this.checkArray(formValue.familyMembers, 'family'),
      funeralEvents: this.checkArray(formValue.funeralEvents, 'events'),
      documents: formValue.documents,
      services : this.getBookingSelectedBooking(null),
      discountAmount : this.discountAmount ? this.discountAmount.discountAmount : 0,
      discountPercentage : this.discountAmount ? this.discountAmount.discountPercentage : 0,
      discountReason : this.discountAmount ? this.discountAmount.discountReason : '',
      paymentConfirmation : this.paymentConfirmation,
      subTotal: this.calculateDiscount ? this.formatToPrice(this.calculateDiscount.subTotal) : 0,
      tax: this.calculateDiscount ? this.formatToPrice(this.calculateDiscount.tax) : 0,
      total: this.calculateDiscount ? this.formatToPrice(this.calculateDiscount.total) : 0,
      home: this.appService.getHome(),
      preNeed: formValue.preNeed ? formValue.preNeed : false,
      notes: [{
        note : formValue.notes ? formValue.notes : ''
      }]
    };
    localStorage.setItem('booking',JSON.stringify(booking));
    window.open('/bookings/invoice', '_blank');
  }

  sendBookingInvoiceEmail(){
    let formValue = this.form.value;
    let booking = {
      clientName: formValue.clientName,
      clientFamilyName: formValue.clientFamilyName,
      clientEmail: formValue.clientEmail,
      clientPhoneNo: formValue.clientPhoneNo,
      clientRelationshipDeceased: formValue.clientRelationshipDeceased,
      clientAddress: {
        street: formValue.clientAddress,
        unitNo: formValue.clientAptNo,
        city: formValue.clientCity,
        province: formValue.clientProvince,
        country: formValue.clientCountry,
        postalCode: formValue.clientPostalCode
      },
      serviceStart: this.formatDate(formValue.serviceDate,this.startTtime),
      serviceEnd:  this.formatDate(formValue.serviceDate,this.endTime),
      deceasedName: formValue.deceasedName,
      deceasedMiddleName: formValue.deceasedMiddleName,
      deceasedFamilyName: formValue.deceasedFamilyName,
      deceasedGender: formValue.deceasedGender,
      deceasedMaritalStatus: formValue.deceasedMaritalStatus,
      deceasedPlaceOfBirth: formValue.deceasedPlaceOfBirth,
      deceasedPlaceOfDeath: formValue.deceasedPlaceOfDeath,
      deceasedSocialInsureNo: formValue.deceasedSocialInsureNo,
      deceasedAge: formValue.deceasedAge,
      deceasedEducationLevel: formValue.deceasedEducationLevel,
      deceasedOccupation: formValue.deceasedOccupation,
      deceasedImage: this.imagePath,
      deceasedAddress: {
        street: formValue.deceasedAddress,
        unitNo: formValue.deceasedAptNo,
        city: formValue.deceasedCity,
        province: formValue.deceasedProvince,
        country: formValue.deceasedCountry,
        postalCode: formValue.deceasedPostalCode
      },
      dateOfDeath: this.formatDateEmail(formValue.dateOfDeath),
      serviceLocation: formValue.serviceLocation,
      eulogy: formValue.eulogy,
      invoiceStatus: formValue.invoiceStatus ? formValue.invoiceStatus : 'inquiry',
      employeeAssignments : this.checkArray(formValue.employees, 'employee'),
      familyMembers: this.checkArray(formValue.familyMembers, 'family'),
      funeralEvents: this.checkArray(formValue.funeralEvents, 'events'),
      documents: formValue.documents,
      services : this.getBookingSelectedBooking('email'),
      discountAmount : this.discountAmount ? this.discountAmount.discountAmount : 0,
      discountPercentage : this.discountAmount ? this.discountAmount.discountPercentage : 0,
      discountReason : this.discountAmount ? this.discountAmount.discountReason : '',
      paymentConfirmation : this.paymentConfirmation,
      subTotal: this.calculateDiscount ? this.formatToPrice(this.calculateDiscount.subTotal) : 0,
      tax: this.calculateDiscount ? this.formatToPrice(this.calculateDiscount.tax) : 0,
      total: this.calculateDiscount ? this.formatToPrice(this.calculateDiscount.total) : 0,
      home: this.appService.getHome(),
      ppreNeed: formValue.preNeed ? formValue.preNeed : false,
      notes: [{
        note : formValue.notes ? formValue.notes : ''
      }],
      showDiscount: this.discountAmount.discountAmount == 0 ? false : true
    };
    let data = {data : booking, identifier : 'invoice'};
    this.bookingService.sendBookingInvoiceEmail(data)
      .subscribe((results) => {
        this.notifier.show({
          message: "Succesfully sent invoice to email",
          type: "default",
          template: this.customNotificationTmpl,
          id: "notif_succcess_id"
        });
      },(err) => {
        console.dir(err);
      })
  }

  ngOnDestroy(){
    this.clearBookingData();
  }

  clearBookingData(){
    this.appService.setServiceBooking(null);
    this.appService.setUpdateServiceList(null);
    this.appService.setCalculateDiscount({
      subTotal : 0,
      tax : 0,
      total : 0
    });
    this.appService.setDiscountAmount({
      discountAmount : 0,
      discountPercentage : 0,
      discountReason : ''
    });
    this.imagePath = '';
    this.hasImage = false;
    this.documents = [];
    this.clearData = true;
  }

  //validate service
   filterServiceBookingArray(identifier){
    let arr = this.appService.filterServiceBookingArray(identifier);
    return arr;
  }

  filterServiceBookingTransportation(identifier){
    let arr = this.appService.filterServiceBookingTransportation(identifier);
    return arr;
  }

  validateIfHasData(){
    if ( this.filterServiceBookingArray('arrangement').length <= 0 && this.filterServiceBookingTransportation('transportation').length <= 0 && this.filterServiceBookingArray('interment').length <= 0 && this.filterServiceBookingArray('cremation').length <= 0 && this.filterServiceBookingArray('yourservice').length <= 0 && this.filterServiceBookingArray('embalming').length <= 0 && this.filterServiceBookingArray('quick_service').length <= 0 ) {
      return false;
    } else {
      return true
    }
  }

  isEmptyService(){
    return this.validateIfHasData() || this.updateServiceList.length > 0;
  }

  editNotes(){
    this.openNote = this.openNote ? false : true;
  }

  canDeactivate(){
    if (this.isDirty && !this.isExitButtonClick){
      return window.confirm('Are you sure you want to leave without saving your changes?')
    }
    return true;
  }

}
