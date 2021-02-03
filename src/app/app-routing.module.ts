import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SignInComponent } from './sign-in/sign-in.component';
import { StripeConnectComponent } from './settings/stripe-connect/stripe-connect.component';
import { TestuploadComponent } from './testupload/testupload.component';
import { ApplicantTestComponent } from './applicant-test/applicant-test.component'; 

const routes: Routes = [
  {
    path: '',
    component: ApplicantTestComponent
  },
  {
    path: 'testupload',
    component: TestuploadComponent
  },
  {
    path : 'settings/stripeconnect',
    component : StripeConnectComponent
  },
  {
    path: 'sign-up',
    loadChildren: './sign-up/sign-up.module#SignUpModule'
  },
  {
    path: 'forgot-password',
    loadChildren: './forgot-password/forgot-password.module#ForgotPasswordModule'
  },
  {
    path: 'accounts',
    loadChildren: './accounts/accounts.module#AccountsModule'
  },
  {
    path : 'settings',
    loadChildren: './settings/settings.module#SettingsModule'
  },
  {
    path : 'vendors',
    loadChildren: './vendor/vendor.module#VendorModule'
  },
  {
    path : 'services',
    loadChildren: './services/services.module#ServicesModule'
  },
  {
    path : 'bookings',
    loadChildren: './bookings/bookings.module#BookingsModule'
  },
  {
    path : 'calendar',
    loadChildren: './calendar/calendar.module#CalendarComponentModule'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { initialNavigation: 'enabled' })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
