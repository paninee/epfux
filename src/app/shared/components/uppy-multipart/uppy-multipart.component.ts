import {
  Component, AfterViewInit, ViewEncapsulation, ChangeDetectionStrategy, EventEmitter, Input,
  Output, ElementRef, PLATFORM_ID, Inject, ViewChild
} from '@angular/core';
import { AWSService } from '../../service/aws.service';

@Component({
  selector: 'app-uppy-multipart',
  templateUrl: './uppy-multipart.component.html',
  styleUrls: ['./uppy-multipart.component.less']
})
export class UppyMultipartComponent implements AfterViewInit {

  @Output() documents = new EventEmitter<any>();
  @Output() isLoading = new EventEmitter<any>();
  @Output() isUploadingDocs = new EventEmitter<any>();
  @Output() error = new EventEmitter<any>();

  @Input() identifier = '';
  @Input() source = '';

  @ViewChild('fileInput', {static: false}) myFileInput: ElementRef;

  public uploadedDocuments = [];

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private aws: AWSService
  ) {}

  ngOnInit() {
    this.isUploadingDocs.emit(false);
  }

  ngAfterViewInit() {}

  uploadFile(event){

    if (this.identifier){
      this.isUploadingDocs.emit(true);
    }
    this.isLoading.emit(true);
    const fileForm = new FormData();

    if (this.source === 'booking'){
      const files = event.target.files;
      const numFiles = files.length;
      for (let i = 0, numFiles = files.length; i < numFiles; i++) {
        fileForm.append('identifier', this.source);
        fileForm.append('image', files[i]);
      }
      this.myFileInput.nativeElement.value = null;
    } else if(this.source === 'vendor'){
      let data = event.target.files[0];
      fileForm.append('identifier', this.source);
      fileForm.append('image', data);
      this.myFileInput.nativeElement.value = null;
    }
    this.fileUpload(fileForm);
  }

  fileUpload(data){
    this.aws.fileUpload(data)
      .subscribe((res) => {
        this.uploadedDocuments = res.map((item) => item.location);
        this.documents.emit(this.uploadedDocuments);
        this.isLoading.emit(false);
        if (this.identifier){
          this.isUploadingDocs.emit(false);
        }
      },(err) => this.error.emit(true));
  }
}