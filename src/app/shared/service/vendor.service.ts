import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable,Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { Vendors } from '../interface/vendors';

@Injectable({
  providedIn: 'root'
})
export class VendorsService {

  vendors : Vendors;

  constructor(private httpClient: HttpClient) { }

  private endPoint = '/api/v1/vendors';

  addVendors(data):Observable<any> {
    let vendors = {vendor: data};
    return this.httpClient.post<any>(`${this.endPoint}`, vendors);
  }

  getVendors(filters:any):Observable<any>{
    return this.httpClient.get<any>(`${this.endPoint}`,{ params : filters })
      .pipe(map((res) => {
        return res;
    }))
  }

  getVendorsByKeyword(data:any):Observable<any>{
    return this.httpClient.get<any>(`${this.endPoint}`,{ params : data })
      .pipe(map((res) => {
        return res
      }))
  }

  setVendorDetails(vendors: Vendors){
    this.vendors = vendors;
    return this.vendors;
  }

  deleteVendor(id):Observable<any>{
    return this.httpClient.delete<any>(`${this.endPoint}/${id}`)
      .pipe(map((res) => {
        return res;
    }))
  }

  importVendorCsv(data):Observable<any> {
    return this.httpClient.post<any>(`${this.endPoint}/import/csv`, data);
  }
}
