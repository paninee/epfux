import { Injectable } from '@angular/core';
import { Observable,Subject, ObservableLike } from 'rxjs';
import * as AWS from 'aws-sdk';
import { Buffer } from 'buffer';
import { HttpClient, HttpParams } from '@angular/common/http';
// import * as AWS from 'aws-sdk-webpack';
//import { AppService } from './../util/app.service';
import { AppService } from '../util/app.service';

@Injectable()
export class AWSService {
  private s3: AWS.S3;
  private awsConfig: {
    'accessKeyId': string,
    'secretAccessKey': string,
    'region': string,
    'bucket': string,
  };

  private uploadApi = 'api/v1/users/upload';

  constructor(private appService: AppService, private httpClient: HttpClient) { }

  private checkConfig() {
    if (!this.s3) {
      const config = this.appService.env;
      this.awsConfig = {
        'accessKeyId': config.AWS_ACCESS_KEY_ID,
        'secretAccessKey': config.AWS_SECRET_ACCESS_KEY,
        'region': config.AWS_REGION,
        'bucket': config.S3_BUCKET,
      };

      this.configureS3();
    }
  }

  private configureS3() {
    this.s3 = new AWS.S3({
      accessKeyId: this.awsConfig.accessKeyId,
      secretAccessKey: this.awsConfig.secretAccessKey,
      region: this.awsConfig.region
    });
  }

  public uploadToS3(filePath:string, data:Blob, contentType: string, callback:(success:boolean, filePath:string) => void) {
    this.checkConfig();
    this.s3.upload({
      Bucket: this.awsConfig.bucket,
      ACL: 'public-read',
      Body: data,
      Key: filePath,
      ContentType: contentType
    }, function (err, data) {
      if(err)
      {
        callback(false, null);
      } else {
        callback(true, data.Location);
      }
    });
  }

  public uploadToS3AsBase64(filePath:string, base64: any, contentType: string, callback:(success:boolean, filePath:any) => void) {
    this.checkConfig();
    var base64Data;
    if (contentType.slice(0,5) === 'image') {
      base64Data = new Buffer(base64.replace(/^data:image\/\w+;base64,/, ""), 'base64');
    } else {
      base64Data = new Buffer(base64.replace(/^data:application\/\w+;base64,/, ""), 'base64');
    }
     
    let options = {
      Bucket: this.awsConfig.bucket,
      ACL: 'public-read',
      Body: base64Data,
      Key: filePath,
      ContentType: contentType
    };

    this.s3.upload(options, function (err, response) {
      if(err) {
        console.error(err)
        callback(false, err);
      } else {
        callback(true, response.Location);
      }
    });
  }

  fileUpload(formData):Observable<any>{
    return this.httpClient.post<any>(`${this.uploadApi}`, formData);
  }
}
