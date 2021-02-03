import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-loading-anim',
  templateUrl: './loading-anim.component.html',
  styleUrls: ['./loading-anim.component.less']
})
export class LoadingAnimComponent implements OnInit {

  @Input() IDENTIFIER: string;

  constructor() { }

  ngOnInit() {
  }

}
