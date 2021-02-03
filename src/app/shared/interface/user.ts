import { Images } from './images';

export class User {
  public _id: string;
  public email: string;
  public authStrategy: string;
  public authKey: string;
  public authToken: string;
  public name: string;
  public phoneNo: string;
  public role : string;
  public profileImg: Images;
  public active: boolean;
  public updatedAt: Date;
  public createdAt: Date;
  public firstname:string;
  public lastname:string;
  public phone:string;

  constructor() { }
}
