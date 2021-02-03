import {
  Component, AfterViewInit, ViewEncapsulation, ChangeDetectionStrategy, EventEmitter,
  Output, ElementRef, PLATFORM_ID, Inject
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
// import * as Uppy from 'uppy';
// const AwsS3 = Uppy.AwsS3

@Component({
  selector: 'app-uppy',
  templateUrl: './uppy.component.html',
  styleUrls: ['./uppy.component.less']
})
export class UppyComponent implements AfterViewInit {

  @Output() images = new EventEmitter<any>();
  @Output() isUploading = new EventEmitter<any>();
  @Output() error = new EventEmitter<any>();

  private currentUploadingCount: number = 0;
  private fullImageInstance: any;

  // private uppy = Uppy;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {}

  ngAfterViewInit() {
    // if (isPlatformBrowser(this.platformId)) {
    //   this.loadUppyInstanceForFullImage();
    // }
  }

  // loadUppyInstanceForFullImage(){
  //   const options = {
  //     id: 'fullUploader',
  //     autoProceed: true,
  //     restrictions: {
  //       maxNumberOfFiles: 1,
  //       minNumberOfFiles: 1,
  //       allowedFileTypes: ['image/*']
  //     },
  //     onBeforeFileAdded: (currentFile, files) => {
  //       this.isUploading.emit(true);
  //       currentFile.name = `assets/deceased/${Date.now()}.${currentFile.name.split('.').pop()}`;
  //       return currentFile;
  //     }
  //   };
  //   this.fullImageInstance = this.uppy.Core(options);
  //   this.fullImageInstance.use(this.uppy.Dashboard, {
  //     target: '.uppyUploader',
  //     replaceTargetContent: true,
  //     allowMultipleUploads: false,
  //     inline: true,
  //     width: 160,
  //     height: 160,
  //     note: 'or drop a photo here to upload',
  //     locale:{
  //       strings : {
  //         dropPaste : '%{browse}',
  //         browse: 'Add photo',
  //       }
  //     }
  //   })
  //   .use(AwsS3, { limit: 0, timeout: 0, companionUrl: '/' })
  //   .run();

  //   this.fullImageInstance.on("complete", (data) => {
  //     if (data.successful.length === 0) {
  //       this.currentUploadingCount--;
  //     }
  //     let imagePath = data.successful[0].response.body.location
  //     this.images.emit(imagePath);
  //   });

  //   this.fullImageInstance.on("file-added", (file) => {
  //     this.currentUploadingCount++;
  //   });

  //   this.fullImageInstance.on("error", (error) => {
  //     this.error.emit(true);
  //   });

  //   this.fullImageInstance.on("upload-error", (error) => {
  //     this.error.emit(true);
  //   });
  // }
}