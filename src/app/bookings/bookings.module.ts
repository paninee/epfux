import { NgModule } from '@angular/core';
import { CommonModule,DatePipe } from '@angular/common';
import { SharedModule } from '../shared/components/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { BookingsRoutingModule } from './bookings-routing.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgxCurrencyModule } from "ngx-currency";
//components
import { BookingsComponent } from './bookings.component';
import { BookingsListComponent } from './bookings-list/bookings-list.component';
import { BookingsCreateComponent } from './bookings-create/bookings-create.component';
import { BookingsViewEditComponent } from './bookings-view-edit/bookings-view-edit.component';
import { ServicesComponent } from '../shared/components/services/services.component';
import { BookingsInvoiceComponent } from './bookings-invoice/bookings-invoice.component';
import { BookingsObituaryComponent } from './bookings-obituary/bookings-obituary.component';

@NgModule({
  declarations: [BookingsComponent, BookingsListComponent, BookingsCreateComponent, BookingsViewEditComponent, ServicesComponent, BookingsInvoiceComponent, BookingsObituaryComponent],
  imports: [
    CommonModule,
    BookingsRoutingModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    NgxPaginationModule,
    NgbModule,
    NgxCurrencyModule
  ],
  exports : [ServicesComponent],
  entryComponents: [ServicesComponent],
  providers : [DatePipe]
})
export class BookingsModule { }
