import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { User } from '../interface/user';

@Injectable({
  providedIn: 'root'
})
export class AccountService {

  public user: User;

  constructor(private httpClient: HttpClient) { }

  private endpoint = 'api/v1/users';
  private funeralApi = 'api/v1/funeralhomes/users';
  private addStaffApi = 'api/v1/funeralhomes/addstaff';

  setUserDetails(user: User) {
    this.user = user;
    return this.user;
  }

}
