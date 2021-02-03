import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../shared/components/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ServicesRoutingModule } from './services-routing.module';
import {ServicesComponent} from './services.component';
import { ServicesListComponent } from './services-list/services-list.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgxCurrencyModule } from "ngx-currency";

@NgModule({
  declarations: [ServicesComponent, ServicesListComponent],
  imports: [
    CommonModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    ServicesRoutingModule,
    NgxPaginationModule,
    NgxCurrencyModule
  ]
})
export class ServicesModule { }
