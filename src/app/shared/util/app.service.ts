/**
 * Updated by John Jermel Alibudbud on 2019-01-27.
 */

import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { Observable, Subscription, Observer, Subject, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import clientConfig from './client-config';
import { CookieService } from 'ngx-cookie-service';
import { User } from './../interface/user';
import { Home } from './../interface/home';
import { Env } from './../interface/env';
import { Bookings } from './../interface/booking';
import { Service } from '../../shared/interface/service';

@Injectable({
  providedIn: 'root',
})
export class AppService {
  public busyIndicatorSubscription: Subscription;

  public user: User;
  public home: Home;
  public env: Env;
  public booking: Bookings;
  public service: Service;

  public serviceCategory:any;
  public discountAmount:any;
  public calculateDiscount:any;

  public serviceBooking:any = [];
  public selectedVendorsList:any = [];
  public updateServiceList:any = [];
  public serviceBookingData:any = [];

  public showService:boolean = false;
  public showDiscount:boolean = false;
  public changeFields:boolean = false;
  public formChange:boolean = false;
  public isExitButtonClick:boolean = false;

  public currentLang: string = 'en';
  public apiKey:string = '';
  public connectClient:string = '';
  public warningIdentifier:string = '';

  /*
  * Updated syntax for listening to observables (angular 7)
  * TODO: refactor the others to use this syntax
  */

  // Observable string sources
  private userChangedSource = new Subject<any>();
  private homeChangedSource = new Subject<any>();
  private envChangedSource = new Subject<any>();
  private serviceChangedSource = new Subject<any>();
  private bookingChangedSource = new Subject<any>();
  private serviceCategorySource = new Subject<any>();
  private serviceBookingSource = new Subject<any>();
  private showServiceSource = new Subject<any>();
  private calculateDiscountSource = new Subject<any>();
  private showDiscountSource = new Subject<any>();
  private updateServiceListSouce = new Subject<any>();
  private selectedVendorsListSource = new Subject<any>();
  private discountAmountSource = new Subject<any>();
  private changeFieldsSource = new Subject<any>();
  private serviceBookingDataSource = new Subject<any>();
  private warningIdentifierSource = new Subject<any>();
  private formChangeSource = new Subject<any>();
  private isExitButtonClickSource = new Subject<any>();

  // // Observable string streams
  public userChange = this.userChangedSource.asObservable();
  public homeChange = this.homeChangedSource.asObservable();
  public envChange = this.envChangedSource.asObservable();
  public serviceChange = this.serviceChangedSource.asObservable();
  public bookingChange = this.bookingChangedSource.asObservable();
  public serviceCategoryChange = this.serviceCategorySource.asObservable();
  public serviceBookingChange = this.serviceBookingSource.asObservable();
  public showServiceChange = this.showServiceSource.asObservable();
  public calculateDiscountChange = this.calculateDiscountSource.asObservable();
  public showDiscountChange = this.showDiscountSource.asObservable();
  public selectedVendorsListChange = this.selectedVendorsListSource.asObservable();
  public updateServiceListChange = this.updateServiceListSouce.asObservable();
  public discountAmountChange = this.discountAmountSource.asObservable();
  public changeFieldsChange = this.changeFieldsSource.asObservable();
  public serviceBookingDataChange = this.serviceBookingDataSource.asObservable();
  public warningIdentifierChange = this.warningIdentifierSource.asObservable();
  public isFormChanged = this.formChangeSource.asObservable();
  public isExitButtonClickChanged = this.isExitButtonClickSource.asObservable();

  constructor( 
    public cookieService : CookieService
  ) {}

  //warning page

  setIsExitButtonClick(bool:boolean){
    this.isExitButtonClick = bool;
    this.isExitButtonClickSource.next(this.isExitButtonClick);
  }

  setWarningIdentifier(identifier){
    this.warningIdentifier = identifier;
    this.warningIdentifierSource.next(this.warningIdentifier);
  }

  setFormChange(bool:boolean){
    this.formChange = bool;
    this.formChangeSource.next(this.formChange);
  }

  //start of booking services

  setShowDiscount(show){
    this.showDiscount = show;
    this.showDiscountSource.next(this.showDiscount);
  }

  setCalculateDiscount(discount){
    this.calculateDiscount = discount;
    this.calculateDiscountSource.next(this.calculateDiscount);
  }

  setDiscountAmount(amount){
    this.discountAmount = amount;
    this.discountAmountSource.next(this.discountAmount);
  }

  setUpdateServiceList(service){
    if (!service){
      this.updateServiceList = [];
      this.updateServiceListSouce.next(this.updateServiceList)
    } else {
      this.updateServiceList = service;
      this.updateServiceListSouce.next(this.updateServiceList)
    }
  }

  setshowService(show){
    this.showService = show;
    this.showServiceSource.next(this.showService);
  }

  setSelectedVendors(vendors){
    this.selectedVendorsList.push(vendors);
    this.selectedVendorsListSource.next(this.selectedVendorsList);
  }

  //change fields in services

  setChangeFields(bool){
    this.changeFields = bool;
    this.changeFieldsSource.next(this.changeFields);
  }

  setServiceBooking(services){
    if (!services) {
      this.serviceBooking = [];
      this.serviceBookingSource.next(this.serviceBooking);
    } else {
      for (let key in services){
        this.serviceBooking.push(services[key]);
      }
      this.serviceBookingSource.next(this.serviceBooking);
    }
  }

  setServiceBookingData(services){
    this.serviceBookingData = services;
    this.serviceBookingDataSource.next(this.serviceBookingData);
  }

  //end of booking services

  setUser(user: User){
    this.user = user;
    this.userChangedSource.next(this.user);
  }

  setBooking(booking : Bookings){
    this.booking = booking;
    this.bookingChangedSource.next(this.booking);
  }

  setServiceCategory(service){
    this.serviceCategory = service;
    this.serviceCategorySource.next(this.serviceCategory);
  }

  getUserRole(){
    let role = this.cookieService.get('currentUserRole');
    return role;
  }

  getHome(){
    let home = this.cookieService.get('home');
    let str = home.split('j:')[1];
    return JSON.parse(str);
  }

  setHome(home: Home){
    this.home = home;
    this.homeChangedSource.next(this.home);
  }

  setEnv(env: Env){
    this.env = env;
    this.envChangedSource.next(this.env);
  }

  setService(service : Service){
    this.service = service;
    this.serviceChangedSource.next(this.service);
  }

  formatErrorResponse(err: any) {
    var message = 'unable to process request';
    if (err.hasOwnProperty('error') && err.error.msg) {
      message = err.error.msg.replace(/_/g, " ");
    } else if(err.hasOwnProperty('message')) {
      message = err.message.replace(/_/g, " ");
    }
    return message;
  }

  filterDeletedUpdateServiceList(){
    let arr = this.updateServiceList.filter((item) => item.delete !== true);
    return arr;
  }

  deleteSelectedVendorList(index){
    this.selectedVendorsList.splice(index,1);
    this.selectedVendorsListSource.next(this.selectedVendorsList);
  }

  filterServiceBookingArray(identifier){
    if (identifier === 'transportation'){
      let filterTransportation = this.serviceBooking.filter((item) => item.identifier === identifier && item.name !== 'Vehicles' && item.delete !== true );
      return filterTransportation;
    } else {
      let filteredService = this.serviceBooking.filter((item) => item.identifier === identifier && item.check !== false && item.delete !== true );
      return filteredService;
    }
  }

  filterServiceBookingTransportation(identifier){
    let filteredService = this.serviceBooking.filter((item) => item.identifier === identifier && item.check !== false && item.data !== null && item.delete !== true );
    return filteredService;
  }

  ckEditorConfig() {
  
    let ckEditorConfig: any = {
      extraPlugins : 'autogrow',
      autoGrow_minHeight : 200,
      autoGrow_maxHeight : 600,
      autoGrow_bottomSpace : 50,
      allowedContent: true,
      toolbar: [
        { name: 'basicstyles', items: [ 'Bold', 'Italic', 'Underline', 'Strike', 'Subscript', 'Superscript', 'RemoveFormat' ] },
        { name: 'paragraph', items: [ 'NumberedList', 'BulletedList', 'Outdent', 'Indent', 'Blockquote', 'JustifyLeft', 'JustifyCenter', 'JustifyRight', 'JustifyBlock' ] }
      ]
    };

    return ckEditorConfig;
  }
}
