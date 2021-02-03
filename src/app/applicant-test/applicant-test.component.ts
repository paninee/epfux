import { Component } from '@angular/core';
import { applicants } from './applicants-mock';

@Component({
  selector: 'app-applicant-test',
  templateUrl: './applicant-test.component.html',
  styleUrls: ['./applicant-test.component.less']
})
export class ApplicantTestComponent {
  public applicants: any[] = [];

  constructor() {
    this.applicants = applicants;
  }

  onDisplayEmailClick(item: any, index: number): void {
    this.applicants[index]['showEmail'] = true;
  }

  trackById(item): void {
    return item.id;
  }

  getEmail(index: number): undefined | string {
    let email = this.applicants[index]['emaill'];
    return email ? email : 'undefined';
  }

}
