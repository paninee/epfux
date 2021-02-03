import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AppService } from '../shared/util/app.service';

@Component({
  selector: 'app-services',
  templateUrl: './services.component.html',
  styleUrls: ['./services.component.less']
})
export class ServicesComponent implements OnInit {

  constructor(
    private appService : AppService,
    private router : Router
  ) { }

  ngOnInit() {
    let home = this.appService.getHome();
    if (!home.active) {
      this.router.navigate(['/settings']);
    }
  }

}
