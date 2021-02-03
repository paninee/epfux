import * as _ from 'lodash';
import mimeTypes from './mimetypes';

export class MediaUtil {
  static convertBase64ToBlob(data:any): any {
    var sections = data.split(',');
    var metadata = sections[0].split(';')[0];
    var binary = atob(sections[1]);
    var array = [];
    for (var i = 0; i < binary.length; i++) {
      array.push(binary.charCodeAt(i));
    }
    var mimeType = metadata.split(':')[1];
    return {
      blob: new Blob([new Uint8Array(array)], {type: mimeType}),
      contentType: mimeType
    };
  }
  
  static getExtensionFromMimeType(mimeType:string): string {
    return _.findLastKey(mimeTypes,  type => type == mimeType);
  }
}
