import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import errorMessages from '../../shared/validation-messages/add-vendors';
import { FormErrorParser } from '../../shared/util/form-error-parser';
import { AppService } from '../../shared/util/app.service';
import { UserService } from '../../shared/service/user.service';
import { Vendors } from '../../shared/interface/vendors';
import { VendorsService } from '../../shared/service/vendor.service';
import { NotifierService } from 'angular-notifier';
import { WarningPageComponent } from '../../shared/components/warning-page/warning-page.component';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-vendor-create',
  templateUrl: './vendor-create.component.html',
  styleUrls: ['./vendor-create.component.less']
})
export class VendorCreateComponent implements OnInit {

  @ViewChild("customNotification", { static: true }) customNotificationTmpl;

  public vendors: Vendors;
  public form: FormGroup;
  public formErrors = errorMessages;
  public alertMetaData: any;

  private notifier: NotifierService;
  public closeResult:string;
  public isDirty:boolean = false;
  public isExitButtonClick:boolean = false;

  constructor(
    private activatedRoute: ActivatedRoute, 
    private router: Router,
    private userService: UserService,
    public appService: AppService,
    public vendorsService : VendorsService,
    private fb: FormBuilder,
    private notifierService : NotifierService,
    private modalService: NgbModal,
  ) {
    this.notifier = notifierService;
    this.generateAlertMetaData();
    this.initiateForm();
    this.subscribeEvent();
    window.addEventListener("beforeunload", (event) => {
      event.preventDefault();
      event.returnValue = "Unsaved modifications";
      return event;
    });
   }

  ngOnInit() {
    this.onChanges();
  }

  subscribeEvent(){
    this.appService.isExitButtonClickChanged.subscribe((data) => this.isExitButtonClick = data);
  }

  exitClick(){
    this.appService.setIsExitButtonClick(true);
    if (this.isDirty) {
      this.appService.setWarningIdentifier('/vendors');
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
      this.router.navigate(['/vendors']);
    }
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

  onChanges(): void {
    this.form.valueChanges.subscribe((val) => this.isDirty = true);
  }

  initiateForm(): void {
    this.form = this.fb.group({
      contactName: ['', Validators.required],
      vendor: ['',Validators.required],
      funeralName : [],
      role : [],
      contactPosition: [],
      email: ['',Validators.email],
      phoneNo: [],
      street: [],
      unitNo: [],
      city: [],
      province: [],
      country: [],
      postalCode: [],
      website: [],
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
      contactName: '',
      vendor: '',
      role: '',
      funeralName: '',
      contactPosition: '',
      email: '',
      phoneNo: '',
      street: '',
      unitNo:'',
      city: '',
      province: '',
      country: '',
      postalCode: '',
      website: '',
    });
  }

  prepareFields(): void {
    this.validateFormBeforeSubmit();
    this.generateAlertMetaData();
    if (this.form.valid) {
      let formValue = this.form.value;;
      let vendors = {
        name: formValue.vendor,
        contactName: formValue.contactName,
        contactPosition: formValue.role,
        address : {
          street: formValue.street,
          unitNo: formValue.unitNo,
          city: formValue.city,
          province: formValue.province,
          country: formValue.country,
          postalCode: formValue.postalCode
        },
        phoneNo: formValue.phoneNo,
        email: formValue.email
      };
      
      this.addVendors(vendors);  
    }
  }
  addVendors(data){
    this.vendorsService.addVendors(data)
      .subscribe((response) => {
        this.resetForm();
        this.isDirty = false;
        this.notifier.show({
          message: "Succesfully saved vendor",
          type: "default",
          template: this.customNotificationTmpl,
          id: "notif_succcess_id"
        });
      },(err) => {
        this.notifier.notify( 'error', this.appService.formatErrorResponse(err));
      })
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

  canDeactivate(){
    if (this.isDirty && !this.isExitButtonClick){
      return window.confirm('Are you sure you want to leave without saving your changes?');
    }
    return true;
  }

}
