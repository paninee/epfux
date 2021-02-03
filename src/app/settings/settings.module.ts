import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../shared/components/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SettingsRoutingModule } from './settings-routing.module';
import { SettingsComponent } from './settings.component';
import { SettingsBillingComponent } from './settings-billing/settings-billing.component';
import { NgxCurrencyModule } from "ngx-currency";

@NgModule({
  declarations: [
    SettingsComponent,
    SettingsBillingComponent
  ],
  imports: [
    CommonModule,
    SettingsRoutingModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    NgxCurrencyModule
  ]
})

export class SettingsModule { }
