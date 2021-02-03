import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { NgBusyModule } from 'ng-busy';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CookieService } from 'ngx-cookie-service';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SignInComponent } from './sign-in/sign-in.component';
import { StripeConnectComponent } from './settings/stripe-connect/stripe-connect.component';

import { SharedModule } from './shared/components/shared.module';
import { TestuploadComponent } from './testupload/testupload.component';

import { CanDeactivateGuard } from './auth/can-deactivate-guard.service';
import { ApplicantTestComponent } from './applicant-test/applicant-test.component'; 

@NgModule({
  declarations: [
    AppComponent,
    SignInComponent,
    StripeConnectComponent,
    TestuploadComponent,
    ApplicantTestComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    AppRoutingModule,
    NgBusyModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule
  ],
  providers: [CookieService,CanDeactivateGuard],
  bootstrap: [AppComponent]
})
export class AppModule { }
