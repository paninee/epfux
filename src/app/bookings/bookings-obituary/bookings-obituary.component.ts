import { Component, OnInit, ViewChild } from '@angular/core';

@Component({
  selector: 'app-bookings-obituary',
  templateUrl: './bookings-obituary.component.html',
  styleUrls: ['./bookings-obituary.component.less']
})
export class BookingsObituaryComponent implements OnInit {

  @ViewChild("eulogyText", { static: true }) eulogyText;

  public booking:any = [];
  public user:any = [];
  public serviceList:any = [];

  public hasImage:boolean = true;
  public imagePath:string = '';
  public addEulogy:string = '';

  constructor() { }

  ngOnInit() {
    this.booking = JSON.parse(localStorage.getItem('obituary'));
    this.hasImage = (this.booking.deceasedImage.length <= 0 ? false : true);
    this.imagePath = this.booking.deceasedImage;
    this.addEulogy = this.booking.eulogy;
    setTimeout(() => {
      let child = this.eulogyText.nativeElement.firstElementChild;
      Object.assign(child.style,
      {
        wordWrap: "break-word",
        display: "inline-block",
        maxWidth: "600px",
        verticalAlign: "top",
      }
    );
    window.print();
    },100);
  }

}
