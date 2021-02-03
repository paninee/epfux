import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable,Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { Vendors } from '../interface/vendors';

@Injectable({
  providedIn: 'root'
})
export class InvitationsService {

  constructor(private httpClient: HttpClient) { }
  
  private endPoint = '/api/v1/invitations';

  getInvitationsData():Observable<any>{
    return this.httpClient.get<any>(`${this.endPoint}`)
      .pipe(map((res) => {
        return res;
      }))
  }

 
}
