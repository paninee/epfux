import { Component, OnInit } from '@angular/core';
import {Router} from '@angular/router';
import { NgbModal, ModalDismissReasons, NgbModalRef, NgbDateAdapter, NgbDateStruct, NgbDateNativeAdapter } from '@ng-bootstrap/ng-bootstrap';
import {AppService} from '../../../shared/util/app.service';
import { WarningPageComponent } from '../../components/warning-page/warning-page.component';

@Component({
  selector: 'app-navigations',
  templateUrl: './navigations.component.html',
  styleUrls: ['./navigations.component.less']
})
export class NavigationsComponent implements OnInit {

  public home:any = [];
  public payment:any = [];

  public role:string = '';
  public isDirty:boolean = false;
  public currentRoutes:string = '';

  public closeResult:string;
  public modalReference:NgbModalRef;

  constructor(
    private router: Router,
    private appService: AppService,
    private modalService: NgbModal,
  ) {
    this.subscribeEvents();
    this.getCurrentRoutes();
  }

  ngOnInit() {
    this.home = this.appService.getHome();
    this.role = this.appService.getUserRole();
    this.appService.homeChange.subscribe((home)=>{
      this.home = home;
      this.payment = home.payment;
    });
    this.payment = (this.home ? this.home.payment : this.payment);
  }

  subscribeEvents(){
    this.appService.isFormChanged.subscribe((res) => {
      this.isDirty = res;
    });
  }

  exitClick(identifier){
    this.appService.setIsExitButtonClick(true);
    if (this.isDirty) {
      this.appService.setWarningIdentifier(`/${identifier}`);
      this.modalService.open(WarningPageComponent, {
        ariaLabelledBy: 'modal-basic-title',
        centered: true,
        backdrop : 'static'
      }).result.then((result) => {
        this.closeResult = `Closed with: ${result}`;
      },(reason) => {
        this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
      });
    }
  }

  getCurrentRoutes(){
    this.currentRoutes = this.router.url;
  }

  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return  `with: ${reason}`;
    }
  }

}
