import * as _ from 'lodash';
const dateNow = Date.now();

export class TextUtil {
  static generateFriendlyID(text:string): string {
    var trimText = text.trim().toLowerCase().replace(/[&\/\\#+()$~%'":*?<>{}\s]/gi, '-');
    if (!trimText) {
      return trimText;
    }
    return `${trimText}-${dateNow}`;
  }
}
