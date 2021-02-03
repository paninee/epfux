import { Component, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { 
  NgbModal, 
  ModalDismissReasons, 
  NgbDateAdapter, 
  NgbDateStruct, 
  NgbDateNativeAdapter, 
  NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
  import { AppService } from '../../util/app.service';

@Component({
  selector: 'app-warning-page',
  templateUrl: './warning-page.component.html',
  styleUrls: ['./warning-page.component.less']
})
export class WarningPageComponent implements OnInit {

  public identifier:string = 'Booking';
  public path:string = '';

  public closeResult: string;
  private activeModel:any = null;

  constructor(
    private appService: AppService,
    private modalService: NgbModal,
    public activeModal: NgbActiveModal,
    private router: Router,
  ) {
  }

  ngOnInit() {
    this.path = this.appService.warningIdentifier;
    // this.activeModel = this.modalService.open('haha');
  }

  subscribeData(){
    this.appService.warningIdentifierChange.subscribe((path) => {
      this.path = path;
    });
  }

  closeServices(){
    this.activeModal.close();

    if (this.path === '/services') {
      this.appService.setFormChange(false);
    }
  }

  exit(){
    this.modalService.dismissAll(this.closeResult);
    this.appService.setFormChange(false);
    if (this.path === '/services') {
      this.closeServices();
    } else {
      this.router.navigate([`${this.path}`]);
      this.closeServices();
    }
  }

}
