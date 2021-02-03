import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { SignUpComponent } from './sign-up.component';
import { SignUpRoutingModule } from './sign-up-routing.module';
import { SharedModule } from '../shared/components/shared.module';

@NgModule({
  declarations: [SignUpComponent],
  imports: [
    CommonModule,
    SignUpRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    NgbModule,
    SharedModule
  ]
})
export class SignUpModule { }
