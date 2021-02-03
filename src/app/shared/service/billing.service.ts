import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, Subscription, Observer, Subject, throwError } from 'rxjs';
import { map } from 'rxjs/operators';
import { User } from './../interface/user';

@Injectable({
  providedIn: 'root'
})
export class BillingService {

  public error:boolean = false;
  public isLoading:boolean = true;
  public errorMessage:string = '';
  public paidAmount:any = 0;
  public remainingAmount:any;
  public creditCardNum:string = '';

  // Observable string sources
  private errorChangedSource = new Subject<any>();
  private isLoadingChangedSource = new Subject<any>();
  private errorMessageChangedSource = new Subject<any>();
  private paidAmountChangedSource = new Subject<any>();
  private remainingAmountChangedSource = new Subject<any>();
  private creditCardNumChangeSource = new Subject<any>();

  // Observable string streams
  public errorChange = this.errorChangedSource.asObservable();
  public isLoadingChange = this.isLoadingChangedSource.asObservable();
  public errorMessageChange = this.errorMessageChangedSource.asObservable();
  public paidAmountChange = this.paidAmountChangedSource.asObservable();
  public remainingAmountChange = this.remainingAmountChangedSource.asObservable();
  public creditCardNumChange = this.creditCardNumChangeSource.asObservable();

  constructor(private httpClient: HttpClient) {}
  private endPoint = 'api/v1/funeralhomes';

  setError(err){
    this.error = err;
    this.errorChangedSource.next(this.error);
  }

  setIsLoading(bool){
    this.isLoading = bool;
    this.isLoadingChangedSource.next(this.isLoading);
  }

  setErrorMessage(message) {
    this.errorMessage = message;
    this.errorMessageChangedSource.next(this.errorMessage);
  }

  sendPaymentId(id:string){
    let obj = { token : id };
    return this.httpClient.put<User>(`${this.endPoint}/payments`, obj);
  }

  setPaidAmount(amount){
    this.paidAmount = amount;
    this.paidAmountChangedSource.next(this.paidAmount);
  }

  setRemainingAmount(amount){
    this.remainingAmount = amount;
    this.remainingAmountChangedSource.next(this.remainingAmount);
  }

  setCreditCardNum(cardNum:string){
    this.creditCardNum = cardNum;
    this.creditCardNumChangeSource.next(this.creditCardNum);
  }

  sendPayoutId(id:string){
    let obj = {code: id};
    return this.httpClient.put<any>(`${this.endPoint}/payout`, obj);
  }

  saveBillingLocation(home:any){
    let obj = { home : home };
    return this.httpClient.put<any>(`${this.endPoint}`, obj);
  }

  deletePayment(){
    return this.httpClient.delete<any>(`${this.endPoint}/payments`, {});
  }
}
