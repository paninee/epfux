import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import errorMessages from './../shared/validation-messages/sign-in';
import { AppService } from '../shared/util/app.service';
import { FormErrorParser } from './../shared/util/form-error-parser';
import { User } from './../shared/interface/user';
import { UserService } from './../shared/service/user.service';
import { SettingsService } from '../shared/service/settings.service';

import { NotifierService } from 'angular-notifier';

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.less']
})
export class SignInComponent implements OnInit {
  public alertMetaData: any;
  public user: User = new User();
  public form: FormGroup;
  public formErrors = errorMessages;
  public role:String = '';
  private notifier: NotifierService;

  constructor(
    private appService: AppService,
    private settingsService : SettingsService,
    private fb: FormBuilder,
    private router: Router,
    private userService: UserService,
    private notifierService : NotifierService
  ) {
    this.notifier = notifierService;
    this.generateAlertMetaData();
    this.initiateForm();
    this.me();
  }

  ngOnInit() {}

  me(){
    this.appService.userChange
      .subscribe((user) => {
        if (user){
          let role = this.appService.getUserRole();
          if (role === 'owner') {
            this.router.navigate(['/bookings']);
          } else {
            this.router.navigate(['/bookings']);
          }
        }
    })
  }

  initiateForm(): void {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      funeralHome: ['', Validators.required],
      password: ['', [Validators.required]],
    });
    this.initiateValidator();
  }

  resetForm(): void {
    this.form.reset({
      name: '',
      funeralHome: '',
      password: ''
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
        email: formValue.email,
        password: formValue.password
      }

      if (formValue.funeralHome) {
        user['funeralHome'] = formValue.funeralHome;
      }
      
      this.signIn(user);
    }
  }

  signIn(user): void {
    this.appService.busyIndicatorSubscription = 
      this.userService.signIn(user).subscribe(
        user => {
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
        }, 
        err => {
          this.notifier.notify( 'error', this.appService.formatErrorResponse(err));
        }
      );
  }

  getEnv(){
    this.settingsService.getEnvVariables()
      .subscribe((env) => {
        this.appService.setEnv(env);
      },(err) => {
        console.dir(err)
      })
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
