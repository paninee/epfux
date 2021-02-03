export class Bookings {
  
  public _id:string;
  public contractNo:string;
  public home:string;
  public clientName:string;
  public clientFamilyName:string;
  public clientEmail:string;
  public clientPhoneNo:string;
  public clientRelationshipDeceased:string;
  public clientAddress:any;
  public serviceStart:string;
  public serviceEnd:string;
  public deceasedName:string;
  public deceasedMiddleName: string;
  public deceasedFamilyName: string;
  public deceasedGender: string;
  public deceasedMaritalStatus: string;
  public deceasedPlaceOfBirth: string;
  public deceasedDateOfBirth:string;
  public deceasedPlaceOfDeath: string;
  public deceasedSocialInsureNo: string;
  public deceasedAge: string;
  public deceasedEducationLevel: string;
  public deceasedOccupation: string;
  public deceasedImage:string;
  public deceasedAddress:any;
  public dateOfDeath:string;
  public serviceLocation:string;
  public familyMembers:any;
  public funeralEvents:any;
  public preNeed:Boolean;
  public paymentConfirmation:string;
  public eulogy:string;
  public services:any;
  public discountAmount:number;
  public discountPercentage:number;
  public discountReason:string;
  public tax:number;
  public subTotal:number;
  public total:number;
  public paidAmount:number;
  public payment:any;
  public invoiceStatus:string;
  public employeeAssignments:any;
  public documents:string;
  public notes:any;
  public createdAt:any;
  public updatedAt:any;
  public createdBy:any;

  constructor() { }
}
