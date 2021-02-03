import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable,Subject } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {

  constructor(private httpClient: HttpClient) { }

  public activationId:string = '';
  private envVariables = 'api/v1/envvariables';

  private activationIdChangedSource = new Subject<any>();
  public idChange = this.activationIdChangedSource.asObservable();
  

  getEnvVariables():Observable<any>{
    return this.httpClient.get<any>(`${this.envVariables}`)
      .pipe(map((res) => {
        return res
      }))
  }

  setActivationId(id){
    this.activationId = id;
    this.activationIdChangedSource.next(this.activationId);
  }

}
