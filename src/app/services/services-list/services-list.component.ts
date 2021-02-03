import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AppService } from '../../shared/util/app.service';
import { HelperService } from '../../shared/util/helper.service';
import { ServicesService } from '../../shared/service/services.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import errorMessages from '../../shared/validation-messages/add-service';
import { FormErrorParser } from '../../shared/util/form-error-parser';
import { Service } from '../../shared/interface/service';
import {NgbModal, ModalDismissReasons} from '@ng-bootstrap/ng-bootstrap';
import { NotifierService } from 'angular-notifier';
import { WarningPageComponent } from '../../shared/components/warning-page/warning-page.component';

@Component({
  selector: 'app-services-list',
  templateUrl: './services-list.component.html',
  styleUrls: ['./services-list.component.less'],
  encapsulation: ViewEncapsulation.None
})
export class ServicesListComponent implements OnInit {

  @ViewChild("customNotification", { static: true }) customNotificationTmpl;

  private notifier: NotifierService;

  public serviceCategories:any;
  public vendors:any;

  public role:string = '';
  public servicesList:Service[] = [];
  public servicesTotal:number = 0;
  public p: number = 1;

  //query params
  public limit: number = 20;
  public skip:number = 0;
  public keyword: any;

  public isLoading:Boolean = false;

  //forms
  public form: FormGroup;
  public formErrors = errorMessages;
  public alertMetaData: any;

  public showVendors:any = '';
  public search:any = '';

  public isDirty:boolean = false;
  public isFormDirty:boolean = false;
  public formHasValues: boolean = false;
  public isInit:boolean = true;

  closeResult: string;

  constructor(
    private appService: AppService,
    private helperService : HelperService,
    private router: Router,
    private servicesService : ServicesService,
    private fb: FormBuilder,
    private notifierService : NotifierService,
    private modalService: NgbModal
  ) {
    this.notifier = notifierService;
    this.generateAlertMetaData();
    this.initiateForm();
    this.subscribeData();
    window.addEventListener("beforeunload", (event) => {
      if (this.isFormDirty){
        event.preventDefault();
        event.returnValue = "Unsaved modifications";
        return event;
      }
    });
  }

  ngOnInit() {
    this.getServices();
    this.appService.setFormChange(false);
    this.servicesService.getFuneralMetadata()
      .subscribe((data) => {
        this.serviceCategories = data.serviceCategories;
        this.vendors = data.vendors;
      });
      this.onChanges();
  }

  addServiceModal(content) {
    this.modalService.open(content, { 
        windowClass: 'addServiceModal',
        ariaLabelledBy: 'modal-basic-title',
        centered: true,
        size: 'lg',
        backdrop : 'static'
      }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
    //to get all the dom
    setTimeout(() => {
      this.helperService.ngSelectArrow();
      this.isDirty = false;
    },50);
  }

  onChanges(): void {
    this.form.valueChanges.subscribe((val) => {
      if (!val.serviceName && !val.price && !val.category && !val.vendor && !val.showVendors) {
        this.isDirty = false;
        this.formHasValues = false;
        this.appService.setFormChange(false);
      } else {
        this.isDirty = true;
        this.formHasValues = true;
        this.appService.setFormChange(true);
      }
    });
  }

  exitClick(){
    this.appService.setFormChange(this.isDirty);
    this.appService.setWarningIdentifier('/services');
    if (this.isDirty) {
      const modalRef = this.modalService.open(WarningPageComponent,{
        ariaLabelledBy: 'modal-basic-title',
        centered: true,
        backdrop : 'static'
      });
      modalRef.result.then((result) => {
        this.closeResult = `Closed with: ${result}`;
        this.isDirty = false;
      },(reason) => this.closeResult = `Dismissed ${this.getDismissReason(reason)}`);
    } else {
      this.appService.setFormChange(false);
      this.resetForm();
      this.closeModal();
    }
  }

  onChangedVendor(event){
    setTimeout(() => this.helperService.ngSelectArrow(), 50);
  }

  closeModal():void {
    this.resetForm();
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

  subscribeData(){
    this.appService.serviceChange
      .subscribe((services) => {
        this.servicesList = services;
      },(err) => {
        console.dir(err)
      });
    this.appService.isFormChanged.subscribe((res) => {
      this.isFormDirty = res;
      this.isDirty = res;
    });
  }

  getPage(page: number) {
    this.p = page;
    this.getServices();
  }

  getServices(){
    this.isLoading = true;
    let defaultParams = {
      skip : (this.p - 1) * this.limit,
      limit: this.limit
    };
    let params = Object.assign(defaultParams);
    this.servicesService.getServices(params)
      .subscribe((res) => {
        this.servicesList = res.services;
        this.servicesTotal = res.total;
        this.isLoading = false;
      },(err) => {
        console.log(err);
      });
  }

  //forms

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

  initiateForm(): void {
    this.form = this.fb.group({
      serviceName: ['', [Validators.required]],
      price: ['', [Validators.required]],
      category: ['', [Validators.required]],
      vendor: [],
      showVendors: []
    });
    this.initiateValidator();
  }

  initiateValidator(): void {
    this.form.statusChanges.subscribe(changes => {
      this.formErrors = FormErrorParser.basic(this.formErrors, this.form, 'en', []);
    });
  }

  resetForm(): void {
    this.form.reset({
      serviceName: '',
      price: '',
      category: '',
      vendor: null,
      showVendors : ''
    });
  }

  validateFormBeforeSubmit(): void{
    this.formErrors = FormErrorParser.basic(this.formErrors, this.form, 'en', [], true);
  }

  prepareFields(): void {
    this.validateFormBeforeSubmit();
    this.generateAlertMetaData();
    if (this.form.valid) {
      let formValue = this.form.value;;
      let service = {
        name: formValue.serviceName,
        price: formValue.price,
        category: formValue.category,
        vendor: formValue.vendor
      };
      this.addService(service);
    }
  }

  addService(service){
    this.servicesService.addService(service)
      .subscribe((res) => {
        this.closeModal();
        this.resetForm();
        this.getServices();
        this.notifier.show({
          message: "Service added",
          type: "default",
          template: this.customNotificationTmpl,
          id: "notif_succcess_id"
        });
      },(err) => {
        this.notifier.notify( 'error', this.appService.formatErrorResponse(err));
      })
  }

  findKeyword(data){
    this.servicesList = [];
    this.isLoading = true;
    this.servicesService.getServicesByKeyword(data)
      .subscribe((res) => {
        this.servicesList = res.services;
        this.servicesTotal = res.total;
        this.isLoading = false;
      },(err) => {
        console.log(err)
      })
  }

  formatNumber(num){
    if (Number.isInteger(num)){
      return `${num}.00`;
    }
    return num;
  }

  moveCursorToEnd(event){
    this.helperService.moveCursorToEnd(event);
  }

  canDeactivate(){
    if (this.isDirty){
      this.closeModal();
      return window.confirm('Are you sure you want to leave without saving your changes?');
    }

    if (!this.formHasValues){
      this.closeModal();
    }
    
    return true;
  }
}
