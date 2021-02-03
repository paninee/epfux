import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../shared/components/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { VendorRoutingModule } from './vendor-routing.module';
import { VendorComponent } from './vendor.component';
import { VendorListComponent } from './vendor-list/vendor-list.component';
import { VendorCreateComponent } from './vendor-create/vendor-create.component';
import { VendorDetailsComponent } from './vendor-details/vendor-details.component';
import { NgxPaginationModule } from 'ngx-pagination';

@NgModule({
  declarations: [VendorComponent,VendorListComponent, VendorCreateComponent, VendorDetailsComponent],
  imports: [
    CommonModule,
    VendorRoutingModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    NgxPaginationModule
  ]
})
export class VendorModule { }
