import { Component, OnInit, Output, Input, EventEmitter } from '@angular/core';
import { AppService } from '../../util/app.service';
//import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic'; 
import ClassicEditor from '@ckeditor/ckeditor5-build-classic'; 

@Component({
  selector: 'app-ckeditor',
  templateUrl: './ckeditor.component.html',
  styleUrls: ['./ckeditor.component.less']
})
export class CkeditorComponent implements OnInit {

  public eulogyData:string = '';
  public editorValue: string = '';
  public ckEditorConfig:any;
  public Editor = ClassicEditor;
  public config:any = {
    toolbar: [ 'heading', '|', 'bold', 'italic', 'link', 'bulletedList', 'numberedList', 'blockQuote' ],
    alignment: {options: [ 'left', 'right' ]},
  };

  @Input() eulogyInput:string = '';
  @Input() 
  set clearData(value) {
    if(value){
      this.eulogyData = '';
    }
  }
  @Input() UPDATE:boolean = false;
  @Output() eulogy = new EventEmitter();

  constructor(
    private appService : AppService
  ) { }

  ngOnInit() {
    this.ckEditorConfig = this.appService.ckEditorConfig();
    if (this.UPDATE){
      this.eulogyData = this.eulogyInput; 
    }
  }

  onChanged(event){
    this.eulogy.emit(event);
  }

  onReady( editor ) {
    editor.ui.getEditableElement().parentElement.insertBefore(
        editor.ui.view.toolbar.element,
        editor.ui.getEditableElement()
    );
  }
}
