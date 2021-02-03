import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AppService } from '../util/app.service';

@Injectable()
export class HttpHeaderInterceptor implements HttpInterceptor {

  constructor(private appService: AppService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    var headers = {};

    // Don't send headers for ip-api.com requests
    if (req.url.indexOf('ip-api.com') < 0) {
      let currentLang = this.appService.currentLang ? this.appService.currentLang : 'en';
      headers = {
        'language': currentLang,
        'Content-Type':  'application/json',
        'Accept': 'application/json'
      };
    } 

    const modifiedRequest = req.clone({ setHeaders: headers });
    return next.handle(modifiedRequest)
  }
}