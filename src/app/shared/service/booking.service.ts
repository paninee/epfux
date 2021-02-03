import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable,Subject, ObservableLike } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class BookingService {

  constructor(private httpClient: HttpClient) { }
  
  private endPoint = '/api/v1/bookings'
  private metaData = '/api/v1/bookings/metadata';
  
  public currentInvoiceStatus = '';
  public invoiceStatus = '';

  // Observable string sources
  private currentInvoiceStatusChangedSource = new Subject<any>();
  private invoiceStatusChangeSource = new Subject<any>();

  // Observable string streams
  public currentInvoiceStatusChange = this.currentInvoiceStatusChangedSource.asObservable();
  public invoiceStatusChange = this.invoiceStatusChangeSource.asObservable();

  setCurrentInvoiceStatus(status:string){
    this.currentInvoiceStatus = status;
    this.currentInvoiceStatusChangedSource.next(this.currentInvoiceStatus);
  }

  setInvoiceStatus(status:string){
    this.invoiceStatus = status;
    this.invoiceStatusChangeSource.next(this.invoiceStatus);
  }

  getMetaData():Observable<any>{
    return this.httpClient.get<any>(`${this.metaData}`)
    .pipe(map((res) => {
      return res
    }));
  }

  addBooking(data):Observable<any> {
    let booking = {booking: data};
    return this.httpClient.post<any>(`${this.endPoint}`, booking);
  }

  updateBooking(data):Observable<any>{
    let booking = {booking: data};
    return this.httpClient.put<any>(`${this.endPoint}`, booking);
  }

  getBookings(filters:any):Observable<any>{
    return this.httpClient.get<any>(`${this.endPoint}`,{ params : filters })
      .pipe(map((res) => {
        return res;
      }))
  }

  getBookingByKeyword(keyword:any):Observable<any>{
    let keywordParams = {q : keyword}
    return this.httpClient.get<any>(`${this.endPoint}`,{ params : keywordParams })
      .pipe(map((res) => {
        return res;
      }))
  }

  addBookingService(data):Observable<any>{
    return this.httpClient.post<any>(`${this.endPoint}/calculate`,data);
  }

  addBookingServicePayment(data):Observable<any>{
    return this.httpClient.post<any>(`${this.endPoint}/pay`,data);
  }

  sendBookingInvoiceEmail(data):Observable<any>{
    return this.httpClient.post<any>(`${this.endPoint}/email`, data);
  }

  getBookingSchedule(filters:any):Observable<any>{
    return this.httpClient.get<any>(`${this.endPoint}`,{ params : filters })
      .pipe(map((res) => {
        return res;
      }))
  }
}
