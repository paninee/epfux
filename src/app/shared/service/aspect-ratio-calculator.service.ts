import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})

export class AspectRatioCalculatorService {
  public maxSizeForFullImageWidth: number = 2160;
  public maxSizeForFullImageHeight: number = 1215;
  public maxSizeForThumbnailImageWidth: number = 800;
  public maxSizeForThumbnailImageheight: number = 450;

  constructor() { }

  calculate(fieldName: string, fieldValues: any) {
    var x1, y1, x2, y2, x1v, y1v, x2v, y2v, ratio;
    x1v = fieldValues['originalWidth'];
    y1v = fieldValues['originalHeight'];
    x2v = fieldValues['newWidth'];
    y2v = fieldValues['newHeight'];

    switch (fieldName) {
      case 'originalWidth':
        if (!this.isInteger(x1v) || !this.isInteger(y1v) || !this.isInteger(y2v)) return;
        fieldValues['newWidth'] = this.solve(undefined, y2v, x1v, y1v);
        break;
      case 'originalHeight':
        if (!this.isInteger(y1v) || !this.isInteger(x1v) || !this.isInteger(x2v)) return;
        fieldValues['newHeight'] = this.solve(x2v, undefined, x1v, y1v);
        break;
      case 'newWidth':
        if (!this.isInteger(x2v) || !this.isInteger(x1v) || !this.isInteger(y1v)) return;
        fieldValues['newHeight'] = this.solve(x2v, undefined, x1v, y1v);
        break;
      case 'newHeight':
        if (!this.isInteger(y2v) || !this.isInteger(x1v) || !this.isInteger(y1v)) return;
        fieldValues['newWidth'] = this.solve(undefined, y2v, x1v, y1v);
        break;
    }

    return fieldValues;
  }

  isInteger(value) {
    return /^[0-9]+$/.test(value);
  }

  /**
   * Solve for the 4th value
   * @param int num2 Numerator from the right side of the equation
   * @param int den2 Denominator from the right side of the equation
   * @param int num1 Numerator from the left side of the equation
   * @param int den1 Denominator from the left side of the equation
   * @return int
   */
  solve(width, height, numerator, denominator) {
    var value;

    // solve for width
    if ('undefined' !== typeof width) {
      value = Math.round(width / (numerator / denominator));
    }

    // solve for height
    else if ('undefined' !== typeof height) {
      value = Math.round(height * (numerator / denominator));
    }

    return value;
  }

  processImageSize(imageSize: any, type: any = 'full') {
    const baseLine = this.getImageSizeBaseLine(imageSize.height, imageSize.width);
    const changedField = baseLine === 'width' ? 'newWidth' : 'newHeight';
    var heightRequestSize = 0;
    var widthRequestSize = 0;
    var maxSizeImageHeight = 0;
    var maxSizeImageWidth = 0;

    // Get max size based on image type
    if (type === 'full') {
      maxSizeImageHeight = this.maxSizeForFullImageHeight;
      maxSizeImageWidth = this.maxSizeForFullImageWidth;
    } else {
      maxSizeImageHeight = this.maxSizeForThumbnailImageheight;
      maxSizeImageWidth = this.maxSizeForThumbnailImageWidth;
    }

    // Get the value of new size to get desired dimension
    if (baseLine === 'height') {
      if (imageSize.height >= maxSizeImageHeight) {
        heightRequestSize = maxSizeImageHeight;
      } else {
        // Deduct 1 from dimenssion to make sure image will be resize.
        heightRequestSize = (imageSize.height - 1);
      }
    }

    if (baseLine === 'width') {
      if (imageSize.width >= maxSizeImageWidth) {
        widthRequestSize = maxSizeImageWidth;
      } else {
        // Deduct 1 from dimenssion to make sure image will be resize.
        widthRequestSize = (imageSize.width - 1);
      }
    }


    var fieldValues = {
      'originalWidth': imageSize.width,
      'originalHeight': imageSize.height,
      'newWidth': widthRequestSize,
      'newHeight': heightRequestSize
    };

    const newSize = this.calculate(changedField, fieldValues);
    return newSize;
  }

  getImageSizeBaseLine(height: number, width: number) {
    if (height > width) {
      return 'height';
    } else {
      return 'width';
    }
  }
}
