import { Component, OnInit, ChangeDetectorRef, OnDestroy, ViewChild,ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { FormErrorParser } from '../../shared/util/form-error-parser';
import errorMessages from '../../shared/validation-messages/add-booking';
import { BookingService } from '../../shared/service/booking.service';
import { VendorsService } from '../../shared/service/vendor.service';
import { ServicesService } from '../../shared/service/services.service';
import { BillingService } from '../../shared/service/billing.service';
import { AWSService } from '../../shared/service/aws.service';
import { UserService } from '../../shared/service/user.service';
import { AppService } from '../../shared/util/app.service';
import { HelperService } from '../../shared/util/helper.service';
import { SettingsService } from '../../shared/service/settings.service';
import { Bookings } from '../../shared/interface/booking';
import { User } from '../../shared/interface/user';
import { Env } from '../../shared/interface/env';
import { NgbModal, ModalDismissReasons, NgbModalRef, NgbDateAdapter, NgbDateStruct, NgbDateNativeAdapter } from '@ng-bootstrap/ng-bootstrap';
import { ServicesComponent } from '../../shared/components/services/services.component';
import { WarningPageComponent } from '../../shared/components/warning-page/warning-page.component';
import { NotifierService } from 'angular-notifier';
import html2canvas from 'html2canvas';
import * as moment from 'moment';
import * as _ from 'lodash';

@Component({
  selector: 'app-bookings-view-edit',
  templateUrl: './bookings-view-edit.component.html',
  styleUrls: ['./bookings-view-edit.component.less']
})
export class BookingsViewEditComponent implements OnInit {

  @ViewChild("customNotification", { static: true }) customNotificationTmpl;
  @ViewChild("obituaryPreview", {static : true}) obituaryPreview: ElementRef;
  @ViewChild('canvas',{static : true}) canvas: ElementRef;
  @ViewChild('downloadLink',{static : true}) downloadLink: ElementRef;

  public env : Env;
  public userList: User[] = [];
  public documents:any = [];
  public showContactInfo:boolean = false;
  public vitalInfo:boolean = false;
  public booking_id:string = '';
  public openNote:boolean = false;

  public maritalStatus:any = [];
  public genderEnums:any = [];
  public relationshipDeceasedEnums:any = [];
  public eventsTypeEnums:any = [];
  

  //for form
  public form: FormGroup;
  public formErrors = errorMessages;
  public alertMetaData: any;
  public paidAmount:any;

  public booking:Bookings;
  public startEndTime:any;

  public hasImage:boolean = true;
  public ifHasError:boolean = false;
  public paymentComplete:boolean = false;
  public isLoading:boolean = true;
  public isImageLoading:boolean = false;
  public isUploadingDocs:boolean = false;
  public paymentConfirmation:string = '';
  public uploadingImages: boolean = false;

  public startTtime:string = '';
  public endTime:string = '';
  public imagePath:string = '';
  public imageWithTimestamp:string = '';
  public isInit:boolean = true;

  public isDirty:boolean = false;
  public isExitButtonClick:boolean = false;

  //for service modal
  public calculateDiscount:any;
  public closeResult:string;
  public showService:boolean = false;
  public bookingServices:any = [];
  public serviceBookingData:any = [];
  public updateServiceList:any = [];
  public selectedVendorsList:any = [];
  public invoiceStatus:any = [];
  public discountAmount:any;

  public addEulogy:string = '';
  public obituaryEmail:string = '';
  public modalReference:NgbModalRef;

  private notifier: NotifierService;
  public isFormChanges:Boolean = false;
  public loading:Boolean = false;

  constructor(
    private bookingService : BookingService,
    private vendorsService : VendorsService,
    private userService : UserService,
    private servicesService : ServicesService,
    private settingsService : SettingsService,
    private router: Router,
    private cdRef: ChangeDetectorRef,
    private fb: FormBuilder,
    private modalService: NgbModal,
    private appService : AppService,
    private helperService : HelperService,
    private billingService : BillingService,
    private notifierService : NotifierService,
    private datePipe: DatePipe,
    private aws : AWSService
  ) {
    this.notifier = notifierService;
    this.setBookingData();
    this.subscribeEvents();
    this.generateAlertMetaData();
    this.initiateForm();
    window.addEventListener("beforeunload", (event) => {
      event.preventDefault();
      event.returnValue = "Unsaved modifications";
      return event;
    });
  }

  ngOnInit() {
    window.localStorage.clear();
    window.scrollTo(0,0);
    this.getServiceCategory();
    this.getFuneralUsers();
    this.populateFuneralEvents();
    this.populateFamilyMembers();
    this.populateEmployee();
    this.getServices();
    this.getMetaData();
    this.getEnvVariables();
    this.populateFormData();
    this.hasImage = (this.booking.deceasedImage.length <= 0 ? false : true);
    this.imagePath = this.booking.deceasedImage;
    this.updateServiceList = this.appService.updateServiceList;
    this.paymentConfirmation = this.booking.paymentConfirmation;
    this.paymentComplete = (this.booking.invoiceStatus === 'paid' ? true : false);
    this.calculateDiscount = this.appService.calculateDiscount;
    this.appService.setDiscountAmount({
      discountPercentage: this.booking.discountPercentage,
      discountAmount: this.booking.discountAmount
    });
    this.billingService.setRemainingAmount(this.booking.total - this.booking.paidAmount);
    this.booking_id = this.booking._id;
    this.onChanges();
    const timestamp = new Date().getTime();
    this.imageWithTimestamp = this.imagePath.includes('?') ? `${this.imagePath}&v=${timestamp}` : `${this.imagePath}?v=${timestamp}`;
    setTimeout(() => this.helperService.ngSelectArrow(), 100);
    this.preNeedOnChange(this.form.controls.preNeed.value);
    this.isUploadingDocs = false;
    this.isInit = false;
  }

  //get service category
  getServiceCategory(){
    this.servicesService.getServicesCategory()
      .subscribe((res) => {
        this.appService.setServiceCategory(res.serviceCategories);
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
      });
  }

  //get service

  getServices(){
    this.servicesService.getServices(null)
    .subscribe((res) => {
      this.appService.setService(res.services);
    },(err) => {
      console.dir(err);
    })
  }

  editToggle(identifier){
    if (identifier === 'contact'){
      this.showContactInfo = this.showContactInfo ? false : true;
    } else if (identifier === 'vitals'){
      this.vitalInfo = this.vitalInfo ? false : true;
      setTimeout(() => this.helperService.ngSelectArrow(), 100);
    }
  }

  populateFormData(){

    this.imagePath = this.booking.deceasedImage;
    let dateOfDeath = this.formatDate('dateOfDeath' in this.booking ? this.booking.dateOfDeath : null);
    let serviceDate = this.formatDate('serviceStart' in this.booking ? this.booking.serviceStart : null);
    let notes = this.populateNotes(this.booking.notes);
    this.form.controls.serviceStartEnd.setValue(this.booking.serviceEnd);
    this.form.controls.notes.setValue(notes);
    this.bookingService.setCurrentInvoiceStatus(this.booking.invoiceStatus);
    this.documents = this.booking.documents || [];
    this.startEndTime = {
      serviceStart : this.booking.serviceStart,
      serviceEnd : this.booking.serviceEnd
    };

    this.form.patchValue({
      clientName: this.booking.clientName,
      clientFamilyName: this.booking.clientFamilyName,
      clientEmail: this.booking.clientEmail,
      clientPhoneNo: this.booking.clientPhoneNo,
      clientRelationshipDeceased: this.booking.clientRelationshipDeceased,
      clientAddress: this.booking.clientAddress ? this.booking.clientAddress.street : '',
      clientAptNo: this.booking.clientAddress ? this.booking.clientAddress.city : '',
      clientCity: this.booking.clientAddress ? this.booking.clientAddress.city : '',
      clientProvince: this.booking.clientAddress ? this.booking.clientAddress.province : '',
      clientCountry: this.booking.clientAddress ? this.booking.clientAddress.country : '',
      clientPostalCode: this.booking.clientAddress ? this.booking.clientAddress.postalCode : '',
      deceasedName: this.booking.deceasedName,
      deceasedMiddleName: this.booking.deceasedMiddleName,
      deceasedFamilyName: this.booking.deceasedFamilyName,
      dateOfDeath: dateOfDeath,
      deceasedGender: this.booking.deceasedGender,
      deceasedImage: this.booking.deceasedImage,
      deceasedAge: this.booking.deceasedAge,
      deceasedEducationLevel: this.booking.deceasedEducationLevel,
      deceasedMaritalStatus: this.booking.deceasedMaritalStatus,
      deceasedOccupation: this.booking.deceasedOccupation,
      deceasedPlaceOfBirth: this.booking.deceasedPlaceOfBirth,
      deceasedPlaceOfDeath: this.booking.deceasedPlaceOfDeath,
      deceasedSocialInsureNo: this.booking.deceasedSocialInsureNo,
      deceasedAddress: this.booking.deceasedAddress ? this.booking.deceasedAddress.street : '',
      deceasedAptNo: this.booking.deceasedAddress ? this.booking.deceasedAddress.city : '',
      deceasedCity: this.booking.deceasedAddress ? this.booking.deceasedAddress.city : '',
      deceasedProvince: this.booking.deceasedAddress ? this.booking.deceasedAddress.province : '',
      deceasedCountry: this.booking.deceasedAddress ? this.booking.deceasedAddress.country : '',
      deceasedPostalCode: this.booking.deceasedAddress ? this.booking.deceasedAddress.postalCode : '',
      serviceDate: serviceDate,
      eulogy: this.booking.eulogy,
      invoiceStatus: this.booking.invoiceStatus,
      documents: this.booking.documents || [],
      preNeed: this.booking.preNeed ? this.booking.preNeed : false,
      notes: notes
    });
  }

  //subscribe state events
  subscribeEvents(){
    this.appService.serviceBookingChange.subscribe((services) => this.bookingServices = services);
    this.appService.showServiceChange.subscribe((showService) => this.showService = showService);
    this.appService.selectedVendorsListChange.subscribe((vendors) => this.selectedVendorsList = vendors.filter((item) => item != null));
    this.appService.calculateDiscountChange.subscribe((data) => this.calculateDiscount = data)
    this.appService.discountAmountChange.subscribe((data)=> this.discountAmount = data);
    this.appService.changeFieldsChange.subscribe((data) => this.isFormChanges = data);
    this.appService.isExitButtonClickChanged.subscribe((data) => this.isExitButtonClick = data);
    this.appService.serviceBookingDataChange.subscribe((data) => this.serviceBookingData = data);
    this.billingService.paidAmountChange.subscribe((amount) => this.paidAmount = amount);
    this.billingService.remainingAmountChange.subscribe((amount) => {
      if (this.form){
        if (amount <= 0){
          if (!this.isInit){
            this.form.controls.invoiceStatus.setValue('paid');
          }
        }
      }
    });
    this.bookingService.currentInvoiceStatusChange.subscribe((status) => {
      if (this.form) {
        this.form.controls.invoiceStatus.setValue(status);
        this.paymentComplete = (status === 'paid' ? true : false);
      }
    });
  }
  
  //populate form value

  populateNotes(notesArr) {
    const arr = notesArr.map(item => item.note);
    return arr.join('\r\n');
  }

  populateServiceToken(token:string,reset:boolean = false){
    let arr =  this.filterAlowedProperty(this.appService.serviceBooking);
    let updateServiceArr = this.appService.updateServiceList.filter((item) => item.delete !== true);
    for (let key in updateServiceArr){
      arr.push(updateServiceArr[key]);
    }
    this.addBookingServicePayment(arr,token)
  }

  filterAlowedProperty(data){
    return this.helperService.filterAlowedProperty(data);
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
      return this.serviceBookingData.filter((item) => Object.keys(item).length !==0 );
    }
  }

  addBookingServicePayment(data,token){
    let discountAmount = this.booking.discountAmount;
    let discountPercentage = this.booking.discountPercentage;
    //updating the invoiceStatus of booking
    let totalPaid = this.booking.paidAmount + this.paidAmount
    this.paymentComplete = totalPaid >= this.calculateDiscount.total ? true : false;
    let invoiceStatus = this.paymentComplete ? 'paid' : 'partially paid';

    let service = {
      services : data,
      discountAmount: discountAmount,
      discountPercentage: discountPercentage,
      token : token,
      paidAmount: this.paidAmount,
      booking_id: this.booking_id,
      invoiceStatus:invoiceStatus
    };

    this.bookingService.addBookingServicePayment(service)
      .subscribe((results) => {
        this.billingService.setRemainingAmount(this.calculateDiscount.total - results.booking.paidAmount);
        this.billingService.setPaidAmount(results.booking.paidAmount);
        this.billingService.setCreditCardNum(results.booking.payment.last4);
        this.paymentConfirmation = results.paymentConfirmation;
        this.paidAmount = results.booking.paidAmount;
        this.form.controls.invoiceStatus.setValue(results.booking.invoiceStatus);
      },(err) => {
        this.billingService.setError(true);
        this.billingService.setIsLoading(false);
        this.notifier.notify( 'error', this.appService.formatErrorResponse(err));
      });
  }

  isUploading(uploading: boolean) {
    this.uploadingImages = uploading;
    this.cdRef.detectChanges();
  }

  populateImages(images: any, reset: boolean = false) {
    this.imagePath = images;
    this.hasImage = true;
    this.form.controls.deceasedImage.setValue(this.imagePath);
    const timestamp = new Date().getTime();
    this.imageWithTimestamp = this.imagePath.includes('?') ? `${this.imagePath}&v=${timestamp}` : `${this.imagePath}?v=${timestamp}`;
  }

  poplateEulogy(eulogy:string,reset:boolean = false){
    this.form.controls.eulogy.setValue(eulogy);
  }

  setBookingData(){
    this.booking = this.appService.booking;
    if (!this.booking){
      this.router.navigate(['/bookings']);
      return;
    }
    this.calculateDiscount = {
      subTotal: this.booking.subTotal,
      tax : this.booking.tax,
      total : this.booking.total
    };
    this.appService.setCalculateDiscount(this.calculateDiscount);
    this.appService.setUpdateServiceList(this.booking.services);
    this.appService.setServiceBookingData(this.booking.services);
    this.billingService.setPaidAmount(this.booking.paidAmount);
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

  populateStartTime(time:string,reset:boolean = false){
    this.startTtime = this.formatTime(time);
    let startTime = this.formatNewDate(this.form.controls.serviceDate.value,time);
    this.booking.serviceStart = startTime;
    this.startEndTime.serviceStart = startTime;
    this.isFormChanges = true;
  }
  
  populateEndTime(time:string,reset:boolean = false){
    this.endTime = this.formatTime(time);
    let endTime = this.formatNewDate(this.form.controls.serviceDate.value,this.endTime);
    this.startEndTime.serviceEnd = endTime;
    this.isFormChanges = true;
  }

  vendorDataFilterDuplicate(){
    return this.helperService.vendorDataFilterDuplicate(this.selectedVendorsList);
  }

  addObituaryModal(content){
    this.addEulogy = this.form.controls.eulogy.value;
    this.modalReference = this.modalService.open(content,{
      windowClass: 'addObituaryModal',
      ariaLabelledBy: 'modal-basic-title',
      centered: true,
      scrollable: true,
      size : 'lg',
      backdrop : 'static'
    });
    this.modalReference
      .result.then((result) => {
        this.closeResult = `Closed with: ${result}`;
      },(reason) => {
        this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
      });
  }

  addEmailModal(content){
    this.modalReference = this.modalService.open(content,{
      windowClass: 'addEmailModal',
      ariaLabelledBy: 'modal-basic-title',
      centered: true,
      scrollable: true,
      size : 'lg',
      backdrop : 'static'
    });
    this.modalReference
      .result.then((result) => {
        this.closeResult = `Closed with: ${result}`;
      },(reason) => {
        this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
      });

      let arrowElem = document.querySelector('.addemail-container .ng-arrow-wrapper');
      arrowElem.remove();
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
    this.modalReference = this.modalService.open(ServicesComponent,{
      windowClass: 'addServiceModal',
      ariaLabelledBy: 'modal-basic-title',
      centered: true,
      size: 'lg',
      backdrop : 'static'
    });
    this.modalReference
      .result.then((result) => {
        this.closeResult = `Closed with: ${result}`;
      },(reason) => {
        this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
      })
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

  initiateForm(): void {
    this.form = this.fb.group({
      clientName: ['',[Validators.required]],
      clientFamilyName: ['',[Validators.required]],
      clientEmail : [''],
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

  onChanges(): void {
    this.form.valueChanges.subscribe((val) => {
      this.bookingService.setInvoiceStatus(val.invoiceStatus);
      this.paymentComplete = (val.invoiceStatus === 'paid' ? true : false);
      if (!this.isInit){
        this.isDirty = true;
        this.isFormChanges = true;
        this.appService.setFormChange(true);
      }
    });
  }

  preNeedOnChange(event){
    if (event){
      this.form.controls.dateOfDeath.disable();
      this.form.controls.dateOfDeath.setValue(null);
    } else {
      this.form.controls.dateOfDeath.enable();
    }
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

  prepareFields(): void {
    this.validateFormBeforeSubmit();
    this.generateAlertMetaData();
    this.notifier.hideAll();
    if (this.form.valid) {
      let formValue = this.form.value;
      let booking = {
        _id : this.booking._id,
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
        serviceStart: this.formatNewDate(formValue.serviceDate,this.startTtime) || '',
        serviceEnd: this.formatNewDate(formValue.serviceDate,this.endTime) || '',
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
        dateOfDeath: this.formatNewDate(formValue.dateOfDeath,'00:00:00') || '',
        serviceLocation: formValue.serviceLocation || '',
        eulogy: formValue.eulogy || '',
        invoiceStatus: formValue.invoiceStatus ? formValue.invoiceStatus : 'inquiry',
        employeeAssignments : this.checkArray(formValue.employees),
        documents: this.documents || [],
        familyMembers: formValue.familyMembers,
        funeralEvents: formValue.funeralEvents,
        services : this.getBookingSelectedBooking(null),
        discountAmount : this.discountAmount.discountAmount,
        discountPercentage : this.discountAmount.discountPercentage,
        discountReason : this.booking.discountReason,
        paymentConfirmation : this.paymentConfirmation,
        paidAmount: this.paidAmount,
        subTotal: this.calculateDiscount.subTotal,
        tax: this.calculateDiscount.tax,
        total: this.calculateDiscount.total,
        notes : this.breakLineNotes(formValue.notes) || [],
        preNeed: formValue.preNeed ? formValue.preNeed : false
      };
      this.updateBooking(booking);  
    }
  }

  breakLineNotes(notes){
    if(notes){
      let note = notes.split('\n');
      let data = [];
      for (let key in note){
        let obj = { note: note[key] };
        data.push(obj);
      }
      return data;
    }
  }

  updateBooking(data){
    this.bookingService.updateBooking(data)
      .subscribe((booking) => {
        this.isDirty = false;
        this.notifier.show({
          message: "Booking updated",
          type: "default",
          template: this.customNotificationTmpl,
          id: "notif_succcess_id"
        });
      },(err) => {
        this.notifier.notify( 'error', this.appService.formatErrorResponse(err));
      })
  }

  setHasImage(){
    if (this.hasImage){
      this.hasImage = false;
    } else {
      this.hasImage = true;
    }
  }

  checkArray(data){
    for(let key in data) {
      if(data[key].assignment === "" || data[key].employee === "") {
         delete data[key];
      }
    }
    return data;
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

  getFuneralUsers(){
    this.userService.getUsers()
      .subscribe((res) => {
        this.userList = res.user;
      },(err) => {
        console.dir(err);
      })
  }

  populateEmployee(){
    const employees = this.form.get('employees') as FormArray;
    const employeeAssignments = this.booking.employeeAssignments;
    for (let key in this.booking.employeeAssignments) {
      if (!this.booking.employeeAssignments[key] || !this.booking.employeeAssignments[key].employee){
        break;
      } else {
        let obj = {
          employee : employeeAssignments[key].employee._id,
          assignment : employeeAssignments[key].assignment
        };
        employees.push(this.fb.group(obj));
      }
    }
  }

  populateFuneralEvents(){
    const events = this.form.get('funeralEvents') as FormArray;
    const funeralEvents = this.booking.funeralEvents;
    for (let key in funeralEvents) {
      if (!funeralEvents[key] || !funeralEvents[key]._id){
        break;
      } else {
        let obj = {
          eventsType: funeralEvents[key].eventsType,
          location: funeralEvents[key].location
        };
        events.push(this.fb.group(obj));
      }
    }
  }

  addFuneralEvents(){
    const events = this.form.get('funeralEvents') as FormArray;
    events.push(this.fb.group({
      eventsType: '',
      location: '',
    }));
    setTimeout(() => this.helperService.ngSelectArrow(), 50);
  }

  
  addFamilyMembers(){
    const familyMembers = this.form.get('familyMembers') as FormArray;
    familyMembers.push(this.fb.group({
      firstName: '',
      familyName: '',
      relationshipDeceased: '',
      city: ''
    }));
    setTimeout(() => this.helperService.ngSelectArrow(), 50);
  }

  populateFamilyMembers(){
    const fam = this.form.get('familyMembers') as FormArray;
    const familyMembers = this.booking.familyMembers;
    for (let key in familyMembers) {
      if (!familyMembers[key] || !familyMembers[key]._id){
        break;
      } else {
        let obj = {
          firstName: familyMembers[key].firstName,
          familyName: familyMembers[key].familyName,
          relationshipDeceased: familyMembers[key].relationshipDeceased,
          city: familyMembers[key].city
        };
        fam.push(this.fb.group(obj));
      }
    }
  }

  populateDocuments(docs:any, reset:boolean = false){
    for (let key in docs){
      this.documents.push(docs[key]);
    }
    this.isFormChanges = true;
    this.notifier.show({
      message: "Succesfully uploaded document'",
      type: "default",
      template: this.customNotificationTmpl,
      id: "notif_succcess_id"
    });
  }

  populateIsLoading(bool:boolean,reset:boolean = false){
    this.isUploadingDocs = bool;
  }

  populateError(bool:boolean,reset:boolean = false) {
    this.notifier.notify( 'error', 'Uploading failed');
    this.isImageLoading = false;
  }

  addEmployee(){
    const employees = this.form.get('employees') as FormArray;
    employees.push(this.fb.group({
      employee: '',
      assignment: '',
    }));
    setTimeout(() => this.helperService.ngSelectArrow(), 50);
  }

  formatDate(date){
    if (!date) return;
    let obj = {
      year : parseInt(moment(date).format('YYYY')),
      month : parseInt(moment(date).format('M')),
      day : parseInt(moment(date).format('D'))
    };
    return obj;
  }

  formatMomentDate(date){
    if (date){
      let m = moment(`${date.year}-${date.month}-${date.day}`, 'YYYY-MM-DD').format('dddd ll');
      return m;
    } else {
      return '';
    }
  }

  formatNewDate(date,time){
    if (!date) return;
    let m = date.month;
    let d = date.day;
    let y = date.year;
    let t = (time ? time : "00:00:00");
    let dateTime = `${m}-${d}-${y} ${t}`;
    let event = new Date(dateTime);
    return moment(event).format('ll');
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
  
  splitString(str){
    return this.helperService.splitString(str);
  }

  formatTime(time){
    if(time){
      let hh = new Date(`2000-01-01 ${time}`).getHours();
      let mm = new Date(`2000-01-01 ${time}`).getMinutes();
      return `${hh}:${mm}`;
    }
  }

  trackByFn(index, item) {
    return index;
  }

  ngOnDestroy(){
    this.appService.setServiceBooking(null);
    this.appService.setUpdateServiceList(null);
    this.billingService.setRemainingAmount(0);
    this.billingService.setPaidAmount(0);
    this.billingService.setCreditCardNum('');
    this.appService.setBooking(null);
    this.bookingService.setCurrentInvoiceStatus('');
  }

  goToInvoice(){
    let formValue = this.form.value;
    let booking = {
      _id : this.booking._id,
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
      serviceStart: this.formatNewDate(formValue.serviceDate,this.startTtime) || '',
      serviceEnd: this.formatNewDate(formValue.serviceDate,this.endTime) || '',
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
      dateOfDeath: this.formatNewDate(formValue.dateOfDeath,'00:00:00') || '',
      serviceLocation: formValue.serviceLocation || '',
      eulogy: formValue.eulogy || '',
      invoiceStatus: formValue.invoiceStatus ? formValue.invoiceStatus : 'inquiry',
      employeeAssignments : this.checkArray(formValue.employees),
      documents: this.documents || [],
      familyMembers: formValue.familyMembers,
      funeralEvents: formValue.funeralEvents,
      services : this.getBookingSelectedBooking(null),
      discountAmount : this.discountAmount.discountAmount,
      discountPercentage : this.discountAmount.discountPercentage,
      discountReason : this.booking.discountReason,
      paymentConfirmation : this.paymentConfirmation,
      paidAmount: this.paidAmount,
      subTotal: this.calculateDiscount.subTotal,
      tax: this.calculateDiscount.tax,
      total: this.calculateDiscount.total,
      notes : this.breakLineNotes(formValue.notes) || [],
      preNeed: formValue.preNeed ? formValue.preNeed : false
    };

    localStorage.setItem('booking', JSON.stringify(booking));
    window.open('/bookings/invoice', '_blank');
  }

  sendBookingInvoiceEmail(){
    let formValue = this.form.value;
    let booking = {
      _id : this.booking._id,
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
      serviceStart: this.formatNewDate(formValue.serviceDate,this.startTtime) || '',
      serviceEnd: this.formatNewDate(formValue.serviceDate,this.endTime) || '',
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
      dateOfDeath: this.formatNewDate(formValue.dateOfDeath,'00:00:00'),
      serviceLocation: formValue.serviceLocation || '',
      eulogy: formValue.eulogy || '',
      invoiceStatus: formValue.invoiceStatus ? formValue.invoiceStatus : 'inquiry',
      employeeAssignments : this.checkArray(formValue.employees),
      documents: this.documents || [],
      familyMembers: formValue.familyMembers,
      funeralEvents: formValue.funeralEvents,
      services : this.getBookingSelectedBooking('email'),
      discountAmount : this.discountAmount.discountAmount,
      discountPercentage : this.discountAmount.discountPercentage,
      discountReason : this.booking.discountReason,
      paymentConfirmation : this.paymentConfirmation,
      paidAmount: this.paidAmount,
      subTotal: this.calculateDiscount.subTotal,
      tax: this.calculateDiscount.tax,
      total: this.calculateDiscount.total,
      notes : this.breakLineNotes(formValue.notes) || [],
      preNeed: formValue.preNeed ? formValue.preNeed : false,
      home: this.appService.getHome(),
      contractNo: this.booking.contractNo,
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
      });
  }

  publishFacebook(){
    //need this code to avoid very huge space on the capture image
    window.scrollTo({ top: 0});
    this.loading = true;
    html2canvas(document.querySelector('.pdf-container'),{
      allowTaint: false,
      useCORS: true,
    })
    .then((canvas) => {
    canvas.toBlob((blob) =>{
      this.canvas.nativeElement.src = canvas.toDataURL();
      this.canvas.nativeElement.setAttribute('crossorigin', 'anonymous');
      let data = canvas.toDataURL('image/jpeg');
      var blobData = this.dataURItoBlob(data);
      const imageFile = new File([blobData], `obituary`, { type: 'image/jpeg' });
      this.uploadFile(imageFile);
    },'image/png');
    });
  }

  dataURItoBlob(dataURI){
    let binary = atob(dataURI.split(',')[1]);
    let array = [];
    for(let i = 0; i < binary.length; i++) {
        array.push(binary.charCodeAt(i));
    }
    return new Blob([new Uint8Array(array)], {type: 'image/jpeg'})
  }

  uploadFile(files){
    const file = files;
    let filename = file.name;
    filename = filename.replace(/\s+/g, '');
    let path = `assets/share/${Date.now()}.${filename}`;
    this.aws.uploadToS3(path, file, file.type, (status, filepath) => {
      if (status){
        this.loading = false;
        this.publishPost(filepath);
      }
    });
  }

  publishPost(sharePost){
    var facebookWindow = window.open('https://www.facebook.com/sharer/sharer.php?u=' + sharePost, 'facebook-popup', 'height=350,width=600');
    if(window.focus) {
      window.focus();
    }
  }

  closeNotif(id){
    this.notifier.hide(id);
  }

  printObituary(){
    let formValue = this.form.value;
    let booking = {
        _id : this.booking._id,
        clientName: formValue.clientName,
        clientEmail: formValue.clientEmail,
        clientPhoneNo: formValue.clientPhoneNo,
        clientRelationshipDeceased: formValue.clientRelationshipDeceased,
        serviceStart: this.formatNewDate(formValue.serviceDate,this.startTtime),
        serviceEnd: this.formatNewDate(formValue.serviceDate,this.endTime),
        deceasedName: formValue.deceasedName,
        deceasedImage: this.imagePath,
        dateOfDeath: this.formatNewDate(formValue.dateOfDeath,'00:00:00'),
        serviceLocation: formValue.serviceLocation,
        eulogy: formValue.eulogy,
        invoiceStatus: formValue.invoiceStatus ? formValue.invoiceStatus : 'inquiry',
        employeeAssignments : this.checkArray(formValue.employees),
        documents: this.documents,
        services : this.getBookingSelectedBooking(null),
        discountAmount : this.discountAmount.discountAmount,
        discountPercentage : this.discountAmount.discountPercentage,
        discountReason : this.booking.discountReason,
        paymentConfirmation : this.paymentConfirmation,
        subTotal: this.calculateDiscount.subTotal,
        tax: this.calculateDiscount.tax,
        contractNo: this.booking.contractNo,
        total: this.calculateDiscount.total,
        notes: [{
          note : formValue.notes ? formValue.notes : ''
        }]
    };
    localStorage.setItem('obituary', JSON.stringify(booking));
    window.open('/bookings/obituary', '_blank');
  }

  emailObituary(){
    let formValue = this.form.value;
    let booking = {
      _id : this.booking._id,
      clientName: formValue.clientName,
      clientFamilyName: formValue.clientFamilyName,
      clientEmail: this.obituaryEmail,
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
      serviceDate: this.formatDatePipe(this.formatNewDate(formValue.serviceDate,this.startTtime), null),
      serviceStart: this.formatDatePipe(this.formatNewDate(formValue.serviceDate,this.startTtime), 'time'),
      serviceEnd: this.formatDatePipe(this.formatNewDate(formValue.serviceDate,this.endTime), 'time'),
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
      dateOfDeath: this.formatDatePipe(this.formatNewDate(formValue.dateOfDeath,'00:00:00'), null),
      serviceLocation: formValue.serviceLocation || '',
      eulogy: formValue.eulogy || '',
      invoiceStatus: formValue.invoiceStatus ? formValue.invoiceStatus : 'inquiry',
      employeeAssignments : this.checkArray(formValue.employees),
      documents: this.documents || [],
      familyMembers: formValue.familyMembers,
      funeralEvents: formValue.funeralEvents,
      services : this.getBookingSelectedBooking(null),
      discountAmount : this.discountAmount.discountAmount,
      discountPercentage : this.discountAmount.discountPercentage,
      discountReason : this.booking.discountReason,
      paymentConfirmation : this.paymentConfirmation,
      paidAmount: this.paidAmount,
      subTotal: this.calculateDiscount.subTotal,
      tax: this.calculateDiscount.tax,
      total: this.calculateDiscount.total,
      notes : this.breakLineNotes(formValue.notes) || [],
      preNeed: formValue.preNeed ? formValue.preNeed : false
    };
    if (!this.ifHasError) {
      let data = {data : booking, identifier : 'obituary'};
      this.bookingService.sendBookingInvoiceEmail(data)
        .subscribe((results) => {
          this.notifier.show({
            message: "Succesfully sent obituary to email",
            type: "default",
            template: this.customNotificationTmpl,
            id: "notif_succcess_id"
          });
          this.obituaryEmail = '';
          this.modalReference.close();
        },(err) => {
          console.dir(err);
      });
    }
  }

  formatDatePipe(date,identifier){
    if (!date) return '';
    if (!identifier) {
      return this.datePipe.transform(date, 'EEEE, MMMM d, y');
    } else {
      return this.datePipe.transform(date, 'shortTime');
    }
  }

  formatToPrice(num){
    return this.helperService.formatToPrice(num);
  }

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
    let filter = this.updateServiceList.filter((item) => item.delete !== true && item.name)
    return this.validateIfHasData() || filter.length > 0;
  }
  
  parseLastDigit(str){
    if (str){
      return this.helperService.parseLastDigit(str);
    }
    return '';
  }

  editNotes(){
    this.openNote = this.openNote ? false : true;
  }

  canDeactivate(){
    if (this.isDirty && !this.isExitButtonClick){
      return window.confirm('Are you sure you want to leave without saving your changes?');
    }
    return true;
  }
}
