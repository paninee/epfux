import { HTTP_INTERCEPTORS } from '@angular/common/http';

import { MongodbObjectCleanerInterceptor } from './mongodb-object-cleaner-interceptor';
import { HttpHeaderInterceptor } from './http-header-interceptor';

export const httpInterceptorProviders = [
  { provide: HTTP_INTERCEPTORS, useClass: HttpHeaderInterceptor, multi: true },
  { provide: HTTP_INTERCEPTORS, useClass: MongodbObjectCleanerInterceptor, multi: true },
];