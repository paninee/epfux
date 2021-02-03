import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable,Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { Vendors } from '../interface/vendors';

@Injectable({
  providedIn: 'root'
})
export class ServicesService {

  vendors : Vendors;

  constructor(private httpClient: HttpClient) { }
  
  private endPoint = '/api/v1/funeralhomes/services';
  private metadataApi = '/api/v1/funeralhomes/metadata';
  private serviceCategory = '/api/v1/servicecategories';


  getServices(filters:any):Observable<any>{
    return this.httpClient.get<any>(`${this.endPoint}`,{ params : filters })
      .pipe(map((res) => {
        return res;
      }))
  }

  addService(data):Observable<any> {
    let service = {service: data};
    return this.httpClient.put<any>(`${this.endPoint}`, service);
  }
  
  getFuneralMetadata():Observable<any>{
    return this.httpClient.get<any>(`${this.metadataApi}`)
      .pipe(map((res) => {
        return res;
      }))
  }

  getServicesByKeyword(keyword:any):Observable<any>{
    let keywordParams = {q : keyword}
    return this.httpClient.get<any>(`${this.endPoint}`,{ params : keywordParams })
      .pipe(map((res) => {
        return res;
      }))
  }

  getServicesCategory():Observable<any>{
    return this.httpClient.get<any>(`${this.serviceCategory}`)
      .pipe(map((res) => {
        return res;
      }))
  }
}
