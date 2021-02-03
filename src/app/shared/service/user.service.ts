import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { User } from './../interface/user';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private httpClient: HttpClient, private cookieService : CookieService) { }

  private endpoint = 'api/v1/users';
  private funeralApi = 'api/v1/funeralhomes/users';
  private addStaffApi = 'api/v1/funeralhomes/addstaff';
  private homeApi = 'api/v1/funeralhomes/me';

  signUp(user: User):Observable<User> {
    let userObj = {user: user};
    return this.httpClient.post<User>(`${this.endpoint}/signup/epilog`, userObj);
  }

  signIn(user: User):Observable<any> {
    return this.httpClient.post<any>(`${this.endpoint}/signin/epilog`, user).pipe(
      map(response => {
        return response;
      })
    );
  }

  signOut():Observable<boolean> {
    this.cookieService.delete('isAuth');
    return this.httpClient.delete<any>(`${this.endpoint}/signout`);
  }

  me():Observable<any> {
    return this.httpClient.get<any>(`${this.endpoint}/me`).pipe(
      map(response => {
        return response.user;
      })
    );
  }

  update(user: any): Observable<any>{
    let userObj = {user: user};
    return this.httpClient.put<any>(`${this.endpoint}`, userObj);
  }

  getUsers():Observable<any>{
    return this.httpClient.get<any>(`${this.funeralApi}`)
      .pipe(map((res) => {
        return res
      }))
  }

  getHome():Observable<any>{
    return this.httpClient.get<any>(`${this.homeApi}`)
      .pipe(map((res) => {
        return res
      }))
  }

  addStaff(user:any):Observable<any>{
    return this.httpClient.put<any>(`${this.addStaffApi}`, user);
  }
  
  addHomeStaff(user:any):Observable<any>{
    return this.httpClient.put<any>(`${this.endpoint}/addstaff`, user);
  }

  changePassword(data):Observable<any>{
    return this.httpClient.put<any>(`${this.endpoint}/changepassword`, data);
  }
}
