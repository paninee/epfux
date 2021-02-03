import { Component, OnInit, ViewChild } from '@angular/core';
import { Router,NavigationEnd } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import errorMessages from '../../shared/validation-messages/add-user';
import { FormErrorParser } from '../../shared/util/form-error-parser';
import { AppService } from '../../shared/util/app.service';
import { UserService } from '../../shared/service/user.service';
import { InvitationsService } from '../../shared/service/invitation.service';
import { User } from '../../shared/interface/user';
import { AccountService } from '../../shared/service/account.service';
import {NgbModal, ModalDismissReasons} from '@ng-bootstrap/ng-bootstrap';
import { NotifierService } from 'angular-notifier';

@Component({
  selector: 'app-account-list',
  templateUrl: './account-list.component.html',
  styleUrls: ['./account-list.component.less']
})
export class AccountListComponent implements OnInit {

  @ViewChild("customNotification", { static: true }) customNotificationTmpl;

  public userList: User[] = [];
  public invitationList:any = [];

  public form: FormGroup;
  public formErrors = errorMessages;
  public alertMetaData: any;
  
  public role:string = '';
  public search;

  private notifier: NotifierService;

  closeResult: string;
  
  constructor(
    private router: Router,
    private userService: UserService,
    public appService: AppService,
    public accountService : AccountService,
    private fb: FormBuilder,
    private modalService: NgbModal,
    private notifierService : NotifierService,
    private invitationsService : InvitationsService,
  ) {
    this.notifier = notifierService;
    this.generateAlertMetaData();
    this.initiateForm();
  }

  ngOnInit() {
    this.getAccountUser();
    this.getInvitationsData();
    this.role = this.appService.getUserRole();
    this.appService.setFormChange(false);
  }

  addStaffModal(content) {
    this.modalService.open(content, {ariaLabelledBy: 'modal-basic-title', centered: true}).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  getInvitationsData(){
    this.invitationsService.getInvitationsData()
      .subscribe((results) => {
        this.invitationList = results.invitation;
      },(err) => {
        console.log(err)
      })
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
      email: ['', [Validators.required, Validators.email]]
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
      email: ''
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
      let formValue = this.form.value;;
      let user = {
        email: formValue.email,
      }
      
      this.addStaff(user);
    }
  }

  //old code might be used when user details will be implemented

  // async editDetails(user){
  //   await this.accountService.setUserDetails(user);
  //   await this.router.navigate([`/dashboard/accounts/${user._id}`]);
  // }

  addStaff(user){
    this.appService.busyIndicatorSubscription = 
    this.userService.addStaff(user)
      .subscribe((res) => {
        this.notifier.show({
          message: res.invite ? res.msg : "Account added",
          type: "default",
          template: this.customNotificationTmpl,
          id: "notif_succcess_id"
        });
        this.resetForm();
        this.getAccountUser();
      },err => {
        this.resetForm();
        this.notifier.notify( 'success', this.appService.formatErrorResponse(err));
      });
  }

  getAccountUser(){
    return new Promise((resolve,reject) => {
      this.appService.busyIndicatorSubscription = 
        this.userService.getUsers()
          .subscribe((users) => {
            this.userList = users.user;
            resolve(this.userList);
          },(err) => {
            reject(err)
          });
    });
  }

  signOut() {
    this.appService.busyIndicatorSubscription = this.userService.signOut().subscribe(
      user => {
        this.appService.setUser(null);
        this.router.navigate(['/']);
      },
      error => {
        console.log(error);
      }
    );
  }

  isInvite(email){
    let arr = this.invitationList.some((item) => item.email === email);
    return arr;
  }

  ngOnDestroy(): void {
    
  }
}