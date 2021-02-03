import { Injectable } from '@angular/core';
import {
  HttpEvent, HttpInterceptor, HttpHandler, HttpRequest
} from '@angular/common/http';

import { Observable } from 'rxjs';

@Injectable()
export class MongodbObjectCleanerInterceptor implements HttpInterceptor {

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (req.method == 'PUT' || req.method == 'POST') {
      req = this.cleanObj(req);
    }
    return next.handle(req)
  }

  cleanObj(request) {
    for (const field in request.body) {
      if (request.body[field] && typeof request.body[field] == 'object') {
        if (request.body[field].hasOwnProperty('__v')) {
          delete request.body[field]['__v'];
        }
      }
    }
    return request;
  }
}