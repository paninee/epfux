import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AppService } from '../../shared/util/app.service';
import { HelperService } from '../../shared/util/helper.service';
import { SettingsService } from '../../shared/service/settings.service';
import { BillingService} from '../../shared/service/billing.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import errorMessages from '../../shared/validation-messages/add-location';
import { FormErrorParser } from '../../shared/util/form-error-parser';
import { Home } from '../../shared/interface/home';
import { Env } from '../../shared/interface/env';
import { NotifierService } from 'angular-notifier';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { WarningPageComponent } from '../../shared/components/warning-page/warning-page.component';

@Component({
  selector: 'app-settings-billing',
  templateUrl: './settings-billing.component.html',
  styleUrls: ['./settings-billing.component.less']
})

export class SettingsBillingComponent implements OnInit {

  @ViewChild("customNotification", { static: true }) customNotificationTmpl;

  public home: Home;
  public env : Env;

  public payment:any = [];
  public payout:any = [];
  public imageSrc:string = ''
  public stripeAuth = 'https://connect.stripe.com/express/oauth/authorize?client_id=';

  public form: FormGroup;
  public formErrors = errorMessages;
  public alertMetaData: any;

  public isLoading:Boolean = true;

  private notifier: NotifierService;

  public isDirty:boolean = false;
  public isExitButtonClick:boolean = false;
  public closeResult:string;
  public isCancellingSubscription: boolean;

  constructor(
    private appService:AppService,
    private helperService : HelperService,
    private fb: FormBuilder,
    private billingService : BillingService,
    private settingsService : SettingsService,
    private notifierService : NotifierService,
    private modalService: NgbModal,
    private router: Router,
  ) {
    this.notifier = notifierService;
    this.generateAlertMetaData();
    this.initiateForm();
    this.subscribeEvent();
    window.addEventListener("beforeunload", (event) => {
      if (this.isDirty){
        event.preventDefault();
        event.returnValue = "Unsaved modifications";
        return event;
      }
    });
  }

  ngOnInit() {
    window.scrollTo(0,0);
    this.home = this.appService.getHome();
    this.appService.setFormChange(false);
    this.appService.homeChange.subscribe((home)=>{
      this.home = home;
      this.payment = home.payment;
      this.payout = home.payout;
    });

    this.payment = (this.home ? this.home.payment : this.payment);
    this.payout = (this.home ? this.home.payout : this.payout);

    this.settingsService.getEnvVariables()
      .subscribe((env) => {
        this.env = env;
        this.isLoading = false;
      },(err) => {
        console.log(err);
      });
    this.onChanges();
    //to get all the dom
    setTimeout(() => this.helperService.ngSelectArrow(), 100);
  }

  subscribeEvent(){
    this.appService.isExitButtonClickChanged.subscribe((data) => this.isExitButtonClick = data);
  }

  exitClick(){
    this.appService.setIsExitButtonClick(true);
    if (this.isDirty) {
      this.appService.setWarningIdentifier('/accounts');
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
      this.router.navigate(['/accounts']);
    }
  }

  openCancelSubscriptionModal(content){
    this.modalService.open(content, {ariaLabelledBy: 'modal-basic-title', centered: true,backdrop : 'static',windowClass: 'changedPasswordModalBox',}).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  onChanges(): void {
    this.form.valueChanges.subscribe((val) => {
      this.isDirty = true;
      this.appService.setFormChange(true);
    });
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

  payOut():void{
    let clientId = this.appService.env.STRIPE_CONNECT_CLIENT
    window.location.href = `${this.stripeAuth}${clientId}`;
  }

  initiateForm(): void {
    this.form = this.fb.group({
      address: [],
      unitNo: [],
      city: [],
      province: [],
      country: [],
      postalCode: [],
      phoneNo: [],
      unitOfMeasurement: ['', [Validators.required]],
      currency: ['', [Validators.required]],
      taxPercentage : []
    });
    this.initiateValidator();
    this.initFormValue();
  }

  initFormValue(){
    this.home = this.appService.getHome();
    this.form.patchValue({
      address:'address' in this.home ? this.home.address.street : '',
      unitNo: 'address' in this.home ? this.home.address.unitNo : '', 
      city: 'address' in this.home ? this.home.address.city : '', 
      province: 'address' in this.home ? this.home.address.province : '', 
      country: 'address' in this.home ? this.home.address.country : '', 
      postalCode: 'address' in this.home ? this.home.address.postalCode : '', 
      phoneNo: 'address' in this.home ? this.home.phoneNo : '', 
      unitOfMeasurement: 'address' in this.home ? this.home.unitOfMeasurement : '', 
      currency: 'address' in this.home ? this.home.currency : '',
      taxPercentage : 'taxPercentage' in this.home ? this.home.taxPercentage : ''
    });
  }
  
  initiateValidator(): void {
    this.form.statusChanges.subscribe(changes => {
      this.formErrors = FormErrorParser.basic(this.formErrors, this.form, 'en', []);
    });
  }

  resetForm(): void {
    this.form.reset({
      address: '',
      unitNo: '',
      city: '',
      province: '',
      country: '',
      postalCode: '',
      phoneNo: '',
      unitOfMeasurement: '',
      currency: '',
      taxPercentage : ''
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
    if (this.form.valid) {
      let formValue = this.form.value
      let location = {
        address : {
          street : formValue.address,
          city : formValue.city,
          country : formValue.country,
          province : formValue.province,
          postalCode : formValue.postalCode,
          unitNo : formValue.unitNo
        },
        currency : formValue.currency,
        phoneNo : formValue.phoneNo,
        unitOfMeasurement : formValue.unitOfMeasurement,
        taxPercentage : formValue.taxPercentage,
        _id : this.home._id
      };

      this.saveBillingLocation(location);
    }
  }

  saveBillingLocation(location){
    this.appService.busyIndicatorSubscription = 
      this.billingService.saveBillingLocation(location)
        .subscribe((res) => {
          this.isDirty = false;
          this.notifier.show({
            message: "Succesfully updated home",
            type: "default",
            template: this.customNotificationTmpl,
            id: "notif_succcess_id"
          });
        },(err) => {
          this.notifier.notify( 'error', this.appService.formatErrorResponse(err));
        });    
  }

  moveCursorToEnd(event){
    this.helperService.moveCursorToEnd(event);
  }

  cancelSubscription(): void {
    this.isCancellingSubscription = true;
    this.appService.busyIndicatorSubscription = this.billingService.deletePayment().subscribe(response => {
      this.isCancellingSubscription = false;
      this.payment = null;
      this.modalService.dismissAll();
    }, error => {
      this.isCancellingSubscription = false;
      this.modalService.dismissAll();
    });
  }

  canDeactivate(){
    if (this.isDirty && !this.isExitButtonClick){
      return window.confirm('Are you sure you want to leave without saving your changes?');
    }
    return true;
  }

}
