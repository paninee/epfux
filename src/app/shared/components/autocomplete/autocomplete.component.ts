import { Component, OnInit, Output, forwardRef, ViewChild, AfterViewInit, Injector, EventEmitter, Input} from '@angular/core';

@Component({
  selector: 'app-autocomplete',
  templateUrl: './autocomplete.component.html',
  styleUrls: ['./autocomplete.component.less']
})
export class AutocompleteComponent implements OnInit {

  @Input() vendorsList:any = [];
  @Input() identifier:string = '';
  @Input() id:string = '';
  @Output() vendorName = new EventEmitter();
  @Output() showAutoComplete = new EventEmitter();

  constructor(
  ) {}

  ngOnInit() {
  }

  selectVendor(vendor:any){
    this.vendorName.emit({
      vendor : vendor,
      id : this.id,
      identifier : this.identifier
    });
    this.showAutoComplete.emit(false);
  }

}
