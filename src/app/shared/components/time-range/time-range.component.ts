import { Component, OnInit, Output, Input, forwardRef, ViewChild, AfterViewInit, Injector, EventEmitter } from '@angular/core';
import * as moment from 'moment';
import projectMetaData from '../../metada/data';
@Component({
  selector: 'app-time-picker',
  templateUrl: './time-range.component.html',
  styleUrls: ['./time-range.component.less']
})
export class TimeRangeComponent implements OnInit {

  public timeStamp:any = [];

  @Output() endTime = new EventEmitter();
  @Output() startTime = new EventEmitter();

  @Input() UPDATE:boolean = false;
  @Input() startEndTime:any;
  @Input() INDENTIFIER:string = '';

  public start:string = '00:00';
  public end:string = '00:00';

  public startDatetime = '';
  public endDatetime = ''

  @Input() 
  set clearData(value) {
    if(value){
      this.startDatetime = '00:00';
      this.endDatetime = '00:00';
    }
  }

  constructor() {}

  ngOnInit() {
    if (this.UPDATE){
      this.startDatetime = this.timeFormat(this.startEndTime.serviceStart);
      this.endDatetime = this.timeFormat(this.startEndTime.serviceEnd);
    }
    this.timeInterval();
  }

  onStartTimeChange(event: any) {
    this.startTime.emit(event);
  }

  onEndTimeChange(event: any) {
    this.endTime.emit(event);
  }

  timeInterval(){
    let time = projectMetaData.timeList;
    this.timeStamp = time.map((items) => items.display);
  }

  timeFormat(time){
    if (time){
      let newTime = moment(time).format('hh:mm A');
      return newTime;
    } else {
      return '';
    }
  }
}
