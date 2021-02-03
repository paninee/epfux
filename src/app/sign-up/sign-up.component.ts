import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AppService } from './../shared/util/app.service';
import { UserService } from './../shared/service/user.service';
import { User } from './../shared/interface/user';
import { PasswordValidation } from './../shared/util/validators.directive';
import errorMessages from './../shared/validation-messages/sign-up';
import { FormErrorParser } from './../shared/util/form-error-parser';
import { SettingsService } from '../shared/service/settings.service';
import { NotifierService } from 'angular-notifier';
import { resolve } from 'url';
import { ThrowStmt } from '@angular/compiler';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.less']
})
export class SignUpComponent implements OnInit {
  public alertMetaData: any;
  public user: User = new User();
  public form: FormGroup;
  public formErrors = errorMessages;
  public role:string = '';
  public isLoading:Boolean = false;
  private notifier: NotifierService;
  public email:string = '';
  public funeralHome:string = '';
  public isInvited:Boolean = false;

  constructor(
    private appService: AppService,
    private userService: UserService,
    private fb: FormBuilder,
    private settingsService : SettingsService,
    private router: Router,
    private route: ActivatedRoute,
    private notifierService : NotifierService
  ) {
    this.notifier = notifierService;
    this.generateAlertMetaData();
    this.initiateForm();
  }

  ngOnInit() {
    this.route.queryParams.subscribe((query) => {
      this.isInvited = query.email ? true : false;
      let funeralHome = decodeURI(query.funeralHome);
      localStorage.setItem('funeralHome', funeralHome);
      this.funeralHome = localStorage.getItem('funeralHome');
      this.form.controls.email.setValue(query.email);
    });
  }

  initiateForm(): void {
    this.form = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      funeralHome: [''],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required]
    }, {
      validator: PasswordValidation.MatchPassword
    });
    this.initiateValidator();
  }

  resetForm(): void {
    this.form.reset({
      name: '',
      email: '',
      funeralHome: '',
      password: '',
      confirmPassword: ''
    });
  }

  initiateValidator(): void {
    this.form.statusChanges.subscribe(changes => {
      this.formErrors = FormErrorParser.basic(this.formErrors, this.form, 'en', []);
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
      var user = {
        name: formValue.name,
        email: formValue.email,
        password: formValue.password
      }

      if (formValue.funeralHome) {
        user['funeralHome'] = formValue.funeralHome;
      }
      
      this.validateSignup(user);
    }
  }

  async validateSignup(user){
    let signUp = await this.signUp(user);
    user.funeralHome = user.funeralHome ? user.funeralHome : this.funeralHome;
    if (this.isInvited) {
      let addUserHome = await this.addUserHome(user);
    }
    let signIn = await this.signIn(user);
  }

  signUp(user) {
    return new Promise((resolve,reject) => {
      this.isLoading = true;
      this.appService.busyIndicatorSubscription = 
        this.userService.signUp(user)
          .subscribe((user) => {
            resolve(user);
          },(err) => {
            this.notifier.notify( 'error', this.appService.formatErrorResponse(err));
            this.isLoading = false;
          });
    });
  }

  addUserHome(user){
    return new Promise((resolve,reject) => {
      this.userService.addHomeStaff(user)
        .subscribe((response) => {
          resolve(response)
        },(err) => {
          reject(err)
        })
    });
  }

  signIn(user){
    return new Promise((resolve,reject) => {
      this.userService.signIn(user)
        .subscribe((user) => {
          this.isLoading = false;
          this.appService.setUser(user.user);
          this.appService.setHome(user.home);
          this.role = this.appService.getUserRole();
          let home = this.appService.getHome();
          this.getEnv();
          this.generateAlertMetaData();
          this.resetForm();
          if (this.role === 'owner') {
            if (!home.active) {
              this.router.navigate(['/settings']);
            } else {
              this.router.navigate(['/bookings']);
            }
          } else {
            this.router.navigate(['/bookings']);
          }
          resolve(true);
        },(err) => {
          reject(err);
        })
    });
  }


  getEnv(){
    this.settingsService.getEnvVariables()
    .subscribe((env) => {
      this.appService.setEnv(env);
    },(err) => {
      console.dir(err);
    });
  }

  generateAlertMetaData(type: string = 'reset', errorMessage: string = ''): void {
    if (type === 'reset') {
      this.alertMetaData = {
        'showAlert': false,
        'success': false,
        'message': null,
        'class': ''
      };
    }

    if (type === 'success') {
      this.alertMetaData = {
        'showAlert': true,
        'success': true,
        'message': 'Your account was created. Please ask your account owner to add you as a staff member before logging in.',
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

}
