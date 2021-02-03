import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import errorMessages from '../../shared/validation-messages/edit-user';
import errorMsgChangePass from '../../shared/validation-messages/change-pass';
import { FormErrorParser } from '../../shared/util/form-error-parser';
import { AppService } from '../../shared/util/app.service';
import { UserService } from '../../shared/service/user.service';
import { PasswordValidation } from '../../shared/util/validators.directive';
import { User } from '../../shared/interface/user';
import { AccountService } from '../../shared/service/account.service';
import {NgbModal, ModalDismissReasons} from '@ng-bootstrap/ng-bootstrap';
import { NotifierService } from 'angular-notifier';
import { WarningPageComponent } from '../../shared/components/warning-page/warning-page.component';


@Component({
  selector: 'app-account-detail',
  templateUrl: './account-detail.component.html',
  styleUrls: ['./account-detail.component.less']
})
export class AccountDetailComponent implements OnInit {

  @ViewChild("customNotification", { static: true }) customNotificationTmpl;

  public user: User;
  public form: FormGroup;
  public changePassForm: FormGroup;
  public formErrors = errorMessages;
  public changePassErrors = errorMsgChangePass;
  public alertMetaData: any;
  public role: string = '';
  public closeResult: string;

  public currentPassword:string = '';
  public newPassword:string = '';
  public confirmPassword:string = '';
  public validatePassword:Boolean = false;

  public isDirty:boolean = false;
  public isExitButtonClick:boolean = false;

  private notifier: NotifierService;

  constructor(
    private activatedRoute: ActivatedRoute, 
    private router: Router,
    private userService: UserService,
    public appService: AppService,
    public accountService : AccountService,
    private fb: FormBuilder,
    private modalService: NgbModal,
    private notifierService : NotifierService
  ) {
    this.notifier = notifierService;
    this.generateAlertMetaData();
    this.generateAlertMetaDataChangePass();
    this.initiateForm();
    this.initiateChangePassForm();
    this.subscribeEvent();
  }

   ngOnInit() {
    this.getAccountUserDetails();
    this.initFormValue();
    this.role = this.appService.getUserRole();
    this.onChanges();
    window.addEventListener("beforeunload", (event) => {
      event.preventDefault();
      event.returnValue = "Unsaved modifications";
      return event;
    });
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

  changePasswordModal(content) {
    this.modalService.open(content, {ariaLabelledBy: 'modal-basic-title', centered: true,backdrop : 'static',windowClass: 'changedPasswordModalBox',}).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
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

  initFormValue(){
    this.form.reset({
      email: this.user ? this.user.email : '',
      name: this.user ? this.user.name : '',
      phone: this.user ? this.user.phoneNo : ''
    });
  }

  getAccountUserDetails(){
    return new Promise((resolve,reject) => {
        this.user = this.appService.user;
        if (this.user) {
          resolve(this.user);
        } else {
          this.router.navigate(['/accounts']);
        }
    })
  }

  onChanges(): void {
    this.form.valueChanges.subscribe((val) => {
      this.isDirty = true;
      this.appService.setFormChange(true);
    });
  }

  subscribeEvent(){
    this.appService.isExitButtonClickChanged.subscribe((data) => this.isExitButtonClick = data);
  }

  initiateChangePassForm(): void {
    this.changePassForm = this.fb.group({
      currentPassword: ['', [Validators.required, Validators.minLength(8)]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required, Validators.minLength(8)]],
    },{
      validator: PasswordValidation.MatchPassword
    });
    this.initiateChangeFormValidator();
  }

  initiateChangeFormValidator():void{
    this.changePassForm.statusChanges.subscribe(changes => {
      this.changePassErrors = FormErrorParser.basic(this.changePassErrors, this.changePassForm, 'en', []);
    });
  }

  resetChangePassForm(): void {
    this.changePassForm.reset({
      email: '',
      name: '',
      phone: ''
    });
  }

  initiateForm(): void {
    this.form = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: [],
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
      email: '',
      name: '',
      phone: ''
    });
  }

  prepareFields(): void {
    this.validateFormBeforeSubmit('details');
    this.generateAlertMetaData();
    if (this.form.valid) {
      let formValue = this.form.value;;
      let user = {
        name : formValue.name,
        phoneNo : formValue.phone,
        email: formValue.email,
      }   
      this.editUser(user);
    }
  }

  editUser(user){
    this.appService.busyIndicatorSubscription = this.userService.update(user)
      .subscribe((res) => {
        this.notifier.show({
          message: "Saved",
          type: "default",
          template: this.customNotificationTmpl,
          id: "notif_succcess_id"
        });
      },err => {
        this.generateAlertMetaData('error', this.appService.formatErrorResponse(err));
      })
  }

  prepareChangePassword():void{
    this.validateFormBeforeSubmit('changePass');
    this.generateAlertMetaDataChangePass();
    if (this.changePassForm.valid) {
      let formValue = this.changePassForm.value;;
      let obj = {
        currentPassword : formValue.currentPassword,
        newPassword : formValue.password,
        confirmPassword: formValue.confirmPassword,
      }   
      this.changePassword(obj);
    }
  }

  changePassword(data){
    data.authKey = this.appService.user.authKey; 
    this.userService.changePassword(data)
      .subscribe((response) => {
        this.notifier.show({
          message: response.msg,
          type: "default",
          template: this.customNotificationTmpl,
          id: "notif_succcess_id"
        });
        this.resetPasswordFields();
        this.closeServices();
      },(err) => {
        this.notifier.show({
          message: this.appService.formatErrorResponse(err),
          type: "error",
          template: this.customNotificationTmpl,
          id: "notif_succcess_id"
        });
      });
  }

  closeServices(){
    this.modalService.dismissAll(this.closeResult);
  }

  resetPasswordFields(){
    this.changePassForm.reset({
      currentPassword: '',
      password: '',
      confirmPassword: ''
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

  generateAlertMetaDataChangePass(type: string = 'reset', errorMsgChangePass: string = ''): void {
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
        'success': errorMsgChangePass,
        'message': errorMsgChangePass,
        'class': 'alert-success'
      };
    }

    if (type === 'error') {
      this.alertMetaData = {
        'showAlert': true,
        'success': false,
        'message': errorMsgChangePass,
        'class': 'alert-danger'
      };
    }
  }

  validateFormBeforeSubmit(identifier): void{
    if (identifier === 'details'){
      this.formErrors = FormErrorParser.basic(this.formErrors, this.form, 'en', [], true);
    } else {
      this.changePassErrors = FormErrorParser.basic(this.changePassErrors, this.changePassForm, 'en', [], true);
    }
  }

  canDeactivate(){
    if (this.isDirty && !this.isExitButtonClick){
      return window.confirm('Discard changes?')
    }
    return true;
  }

}