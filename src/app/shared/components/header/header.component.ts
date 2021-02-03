import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AppService } from '.././../../shared/util/app.service';
import { UserService } from '../../service/user.service';
import { AccountService } from '../../service/account.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.less']
})
export class HeaderComponent implements OnInit {

  public currentUser;
  public home;

  constructor(
    private router: Router,
    private appService : AppService,
    private userService : UserService,
    private accountService : AccountService,
  ) { }

  ngOnInit() {
    this.appService.userChange.subscribe(user => this.currentUser = user);
    this.appService.homeChange.subscribe(home => this.home = home);
    this.currentUser = this.appService.user;
    this.home = this.appService.getHome();
  }

  async viewAccounts(){
    await this.accountService.setUserDetails(this.currentUser);
    await this.router.navigate([`/accounts/${this.currentUser._id}`]);
  }

  signOut() {
    this.appService.busyIndicatorSubscription = this.userService.signOut()
    .subscribe(user => {
        this.appService.setUser(null);
        this.router.navigate(['/']);
      },(err) => {
        console.log(err);
      });
  }

}
