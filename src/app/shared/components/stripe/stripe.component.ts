import { Component, OnInit, Input, Output, EventEmitter, ViewChild  } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import errorMessages from '../../validation-messages/add-billing';
import { FormErrorParser } from '../../util/form-error-parser';
import { BillingService } from '../../service/billing.service';
import { BookingService } from '../../service/booking.service';
import { HelperService } from '../../util/helper.service';
import { AppService } from '../../util/app.service';
import { SettingsService } from '../../service/settings.service';
import { Router,NavigationEnd } from '@angular/router';
import { NotifierService } from 'angular-notifier';

import { 
  Elements, Element as StripeElement, ElementsOptions, 
  StripeInstance, StripeFactoryService
} from "ngx-stripe";
import { bool } from 'aws-sdk/clients/signer';

@Component({
  selector: 'app-stripe-test',
  templateUrl: 'stripe.component.html',
  styleUrls: ['./stripe.component.less']
})

export class StripeComponent implements OnInit {

  @ViewChild("customNotification", { static: true }) customNotificationTmpl;


  @Input() STRIPE_API_KEY: string;
  @Input() IDENTIFIER: string;
  @Input() BOOKING_ID:string;

  @Output() addServiceBooking = new EventEmitter();

  private stripe : StripeInstance;
  private card: StripeElement;
  private cardCvc: StripeElement;
  private cardExpiry: StripeElement;
  private notifier: NotifierService;

  elements: Elements;
  elementsOptions: ElementsOptions = {
    locale: 'en'
  };

  paymentForm: FormGroup;
  public formErrors = errorMessages;
  public alertMetaData: any;

  public isLoading:boolean = false;

  //billing observables
  public billingLoading:boolean = true;
  public billingError:boolean = false;
  public setErrorMessage:string = '';
  public isFormChanged:boolean = false;
  public totalPrice:any = 0;
  public remainingBalance:any = 0;
  public remainingAmount:any = 0;

  constructor(
    private fb: FormBuilder,
    private stripeFactory: StripeFactoryService,
    private billingService: BillingService,
    private settingsService : SettingsService,
    private bookingService : BookingService,
    private appService : AppService,
    private helperService : HelperService,
    private router : Router,
    private notifierService : NotifierService
  ) {
      this.notifier = notifierService;
      this.subscribeEvents();
      this.generateAlertMetaData();
  }

  subscribeEvents(){
    this.billingService.errorChange.subscribe((res) => this.billingError = res);
    this.billingService.isLoadingChange.subscribe((res) => this.billingLoading = res);
    this.billingService.errorMessageChange.subscribe((res) => this.setErrorMessage = res);
    this.appService.calculateDiscountChange.subscribe((discount) => this.totalPrice = discount.total);
    this.billingService.remainingAmountChange.subscribe((amount) => this.remainingBalance = amount);
  }

  initiateForm(){
    if(this.IDENTIFIER === 'createBooking') {
      this.paymentForm = this.fb.group({
        fullname: ['', []],
        total:['',[]],
        zip_postal: ['', [Validators.required]]
      });
    } else {
      this.paymentForm = this.fb.group({
        fullname: ['', [Validators.required]],
        zip_postal: ['', [Validators.required]],
        total:['',[]],
      });
    }
    this.initiateValidator();
  }

  initiateValidator(): void {
    this.paymentForm.statusChanges.subscribe(changes => {
      this.formErrors = FormErrorParser.basic(this.formErrors, this.paymentForm, 'en', []);
    });
  }

  ngOnInit() {
    this.initiateForm();
    this.onChanges();
    this.stripe = this.stripeFactory.create(this.STRIPE_API_KEY);
    this.remainingAmount = this.billingService.remainingAmount;
    this.totalPrice = this.remainingAmount ? this.remainingAmount : 0;
    this.remainingBalance = this.totalPrice ? this.totalPrice : 0;
  }
  

  initiateStripe(){
    this.stripe.elements(this.elementsOptions)
      .subscribe((elements) => {
        if (!this.card) {
          let options = {
            style: {
              base: {
                iconColor: '#666EE8',
                color: '#31325F',
                fontWeight: 300,
                fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
                fontSize: '18px',
                '::placeholder': {
                  color: '#CFD7E0'
                }
              }
            }
          };
          this.card = elements.create('cardNumber', options);
          this.card.mount('#cardNumber');
          this.card.on('change', (event) => {
            var iconClass;
            var brandElement = document.getElementById('brand-icon');;
            console.log(event.brand)
            // switch (event.brand) {
            //   case "visa":
            //     iconClass = 'fab fa-cc-visa';
            //     break;

            //   case "mastercard":
            //     iconClass = 'fab fa-cc-mastercard';
            //     break;

            //   case "amex":
            //     iconClass = 'fab fa-cc-amex';
            //     break;

            //   case "discover":
            //     iconClass = 'fab fa-cc-discover';
            //     break;

            //   case "diners":
            //     iconClass = 'fab fa-cc-diners-club';
            //     break;

            //   case "jcb":
            //     iconClass = 'fab fa-cc-jcb';
            //     break;
              
            //   default:
            //     iconClass = 'fas fa-credit-card';
            //     break;
            // }
            // brandElement.className = iconClass;
          });

          this.cardExpiry = elements.create('cardExpiry', options);
          this.cardExpiry.mount('#cardExpiry');

          this.cardCvc = elements.create('cardCvc', options);
          this.cardCvc.mount('#cardCvc');
        }
      },(err) => {
        console.dir(err)
      })
  }

  ngAfterViewInit(){
    this.initiateStripe();
  }

  prepareFields() {
    this.validateFormBeforeSubmit();
    this.generateAlertMetaData();
    if (this.paymentForm.valid) {
      let formValue = this.paymentForm.value;
      if (this.IDENTIFIER !== 'createBooking'){
        let billing = {
          name: formValue.fullname,
          zip: formValue.zip_postal
        }
        this.isLoading = true;
        this.getToken(billing);
      } else {
        let data = {
          name: formValue.fullname,
          zip: formValue.zip_postal,
          amount: formValue.total
        };
        this.billingService.setPaidAmount(formValue.total);
        this.getToken(data);
      }
    }
  }
  
  getToken(data){
    this.isLoading = true;
    this.stripe
      .createToken(this.card, data)
      .subscribe((results) => {
        if (results.token) {
          if (this.IDENTIFIER === 'createBooking') {
            this.addServiceBooking.emit(results.token.id);
            setTimeout(() => {
              if (!this.billingLoading) {
                if (this.billingError){
                  this.isLoading = false;
                  this.resetFormValues();
                  document.getElementById('closemodal').click();
                }
              } else {
                this.isLoading = false;
                this.resetFormValues();
                document.getElementById('closemodal').click();
              }
            },1000)
          } else {
            this.sentPaymentId(results.token.id);
            this.isLoading = false;
          }
        } else {
          this.notifier.notify( 'error', results.error.message );
          this.isLoading = false;
        }
      },(err) => {
        this.notifier.notify( 'error', 'error' );
        this.isLoading = false;
      })
  }

  sentPaymentId(token){
    this.billingService.sendPaymentId(token)
      .subscribe((results) => {
        this.resetFormValues();
        this.setHome(results);
        document.getElementById('closemodal').click();
        this.isLoading = false;
        this.notifier.show({
          message: "Updated payment method",
          type: "default",
          template: this.customNotificationTmpl,
          id: "notif_succcess_id"
        });
      },(err) => {
        this.notifier.notify('error', err.error.msg);
        this.resetFormValues();
        this.isLoading = false;
      })
  }
  

  setHome(home){
    this.appService.setHome(home.home);
  }

  onChanges(): void {
    this.paymentForm.valueChanges.subscribe((val) => {
      this.isFormChanged = true;
      this.totalPrice = this.billingService.remainingAmount;
      if ( val.total <= this.totalPrice){
        this.remainingBalance = this.totalPrice - val.total;
      } else {
        this.paymentForm.controls.total.setValue(this.billingService.remainingAmount);
        this.remainingBalance = 0;
      }
    });
  }

  chargeTotalPrice(){
    let total = this.paymentForm.get('total').value || 0;
    return `Charge $${total <= this.totalPrice ? this.formatsNUm(total) : this.formatsNUm(this.totalPrice)}`;
  }

  validateFormBeforeSubmit(): void{
    this.formErrors = FormErrorParser.basic(this.formErrors, this.paymentForm, 'en', [], true);
  }

  resetFormValues() {
    this.paymentForm.reset();
    this.paymentForm.controls.total.setValue('');
    this.paymentForm.controls.fullname.setValue('');
    this.paymentForm.controls.zip_postal.setValue('');
    this.card.clear();
    this.cardCvc.clear();
    this.cardExpiry.clear();
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

  moveCursorToEnd(event){
    this.helperService.moveCursorToEnd(event);
  }

  formatsNUm(number){
    return number.toFixed(2);
  }
}