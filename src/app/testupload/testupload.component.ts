import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-testupload',
  templateUrl: './testupload.component.html',
  styleUrls: ['./testupload.component.less']
})
export class TestuploadComponent implements OnInit {

  constructor(private httpClient: HttpClient) { }

  ngOnInit() {
  }

  onImageUpload(event: any) {
    const imageForm = new FormData();
    const file = event.target.files[0];
    imageForm.append('image', file);
    this.httpClient.post<any>('http://localhost:3000/api/v1/users/upload', imageForm).subscribe(response => {
      console.log(response);
    });
   }

}
