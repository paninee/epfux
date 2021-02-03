import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NgxStripeModule } from 'ngx-stripe';
import { FilterPipe } from '../util/filter.pipe';
import { DragDropDirective } from '../util/drag-drop.directive';
import { HeaderComponent } from './header/header.component';
import { NavigationsComponent } from './navigations/navigations.component';
import { StripeComponent } from './stripe/stripe.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LoadingAnimComponent } from './loading-anim/loading-anim.component';
import { UppyComponent } from './uppy/uppy.component';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import { AWSService } from '../../shared/service/aws.service';
// import { CKEditorModule } from 'ngx-ckeditor';
import { TimeRangeComponent } from './time-range/time-range.component';
import { UppyMultipartComponent } from './uppy-multipart/uppy-multipart.component';
import { AutocompleteComponent } from './autocomplete/autocomplete.component';
import { CkeditorComponent } from './ckeditor/ckeditor.component';
import { ServiceListComponent } from './services/service-list/service-list.component';
import { WarningPageComponent } from './warning-page/warning-page.component';
import { NgxCurrencyModule } from "ngx-currency";
import { NotifierModule, NotifierOptions } from 'angular-notifier';
import { NgSelectModule } from '@ng-select/ng-select';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';


/**
 * Custom angular notifier options
 */
const customNotifierOptions: NotifierOptions = {
  position: {
		horizontal: {
			position: 'middle',
			distance: 12
		},
		vertical: {
			position: 'bottom',
			distance: 12,
			gap: 10
		}
	},
  theme: 'material',
  behaviour: {
    autoHide: 5000,
    onClick: 'hide',
    onMouseover: 'pauseAutoHide',
    showDismissButton: true,
    stacking: 4
  },
  animations: {
    enabled: true,
    show: {
      preset: 'slide',
      speed: 300,
      easing: 'ease'
    },
    hide: {
      preset: 'fade',
      speed: 300,
      easing: 'ease',
      offset: 50
    },
    shift: {
      speed: 300,
      easing: 'ease'
    },
    overlap: 150
  }
};

const SHARED_MODULE = [
  CommonModule,
  RouterModule,
  FormsModule,
  ReactiveFormsModule,
  NgbModule,
  CKEditorModule,
  NgxCurrencyModule,
  NgSelectModule,
  NotifierModule.withConfig(customNotifierOptions),
  NgxStripeModule.forRoot(),
];

@NgModule({
  imports: SHARED_MODULE,
  declarations: [
    HeaderComponent,
    NavigationsComponent,
    StripeComponent,
    FilterPipe,
    DragDropDirective,
    LoadingAnimComponent,
    UppyComponent,
    TimeRangeComponent,
    UppyMultipartComponent,
    AutocompleteComponent,
    CkeditorComponent,
    ServiceListComponent,
    WarningPageComponent
  ],
  exports: [
    HeaderComponent,
    NavigationsComponent,
    StripeComponent,
    FilterPipe,
    DragDropDirective,
    LoadingAnimComponent,
    UppyComponent,
    TimeRangeComponent,
    UppyMultipartComponent,
    AutocompleteComponent,
    CkeditorComponent,
    NotifierModule,
    NgSelectModule,
    ServiceListComponent,
    WarningPageComponent
  ],
  entryComponents: [WarningPageComponent],
  providers:[
    AWSService
  ]
})
export class SharedModule { }