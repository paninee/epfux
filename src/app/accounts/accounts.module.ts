import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../shared/components/shared.module';

import { AccountsRoutingModule } from './accounts-routing.module';

import { AccountListComponent } from './account-list/account-list.component';
import { AccountDetailComponent } from './account-detail/account-detail.component';
import { AccountsComponent } from './accounts.component';

@NgModule({
  declarations: [
    AccountListComponent,
    AccountDetailComponent,
    AccountsComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    AccountsRoutingModule,
    SharedModule
  ]
})
export class AccountsModule { }
