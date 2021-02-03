import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import { SettingsService } from './shared/service/settings.service';
import { AppService } from './shared/util/app.service';
import { UserService } from './shared/service/user.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less']
})
export class AppComponent implements OnInit, OnDestroy {
  private userChangeSubscription: Subscription;
  private role:string = '';
  private userId:any;
  constructor(
    private router: Router,
    private userService: UserService,
    public appService: AppService,
    public settingsService : SettingsService
  ) {}

  ngOnInit() {
    this.getUserData()
      .then((user) => {
        if (this.role === 'owner'){
          // this.router.navigate(['/accounts']);
          // this.router.navigate(['/vendors']);
        } else {
          // this.router.navigate([`/accounts/${this.userId}`]);
        }
      }).catch((err) => {
        console.log(err)
      })
  }

  async getUserData(){
      let user = await this.getUser()
      // let home = await this.getHome();
      let env = await this.getEnv();
      return user;
  }

  getUser(){
      return new Promise((resolve,reject) => {
        this.appService.busyIndicatorSubscription = 
        this.userService.me().subscribe((user) => {
          this.appService.setUser(user);
          this.userId = user._id;
          this.role = this.appService.getUserRole();
          resolve(user)
        },(err) => {
          reject(err)
        })
      })
  }

  getHome(){
    return new Promise((resolve,reject) => {
      this.appService.busyIndicatorSubscription = 
        this.userService.getHome()
          .subscribe((home) => {
            this.appService.setHome(home.home);
            resolve(home)
          },(err) => {
            reject(err)
          })
    })
  }
  
  getEnv(){
    return new Promise((resolve,reject) => {
      this.settingsService.getEnvVariables()
      .subscribe((env) => {
        this.appService.setEnv(env);
        resolve(env);
      },(err) => {
        console.dir(err);
      })
    })
  }
  

  ngOnDestroy() {
    if (this.userChangeSubscription) {
      this.userChangeSubscription.unsubscribe();
    }
  }
}
