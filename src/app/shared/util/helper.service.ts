import { Injectable } from '@angular/core';
import * as _ from 'lodash';

@Injectable({
    providedIn: 'root'
})

export class HelperService {

    public allowed:any = [
        'category', 
        'name', 
        'price', 
        'vendor', 
        'additionalInfo', 
        'discountAmount', 
        'discountPercentage'
    ];
    
    constructor() {}

    splitString(str){
        let name = str.split('documents/')[1];
        let ext = name.split('.')[2];
        name = name.split('.')[1];
        let filename = `${name}.${ext}`;
        let newFileName = filename.replace(/\s+/g, '');
        return newFileName;
    }

    formatToPrice(num){
        num = parseInt(num);
        let formatnum = (num).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
        return formatnum;
    }

    filterAlowedProperty(data){
        let arr = data.filter((item) => item.delete !== true && item.check !== false);
        let filter = arr.map((item) => {
          let selected = _.pickBy(item,_.identity);
          return selected;
        });
        let service = filter.map((item) => {
          let selected = _.pick(item,this.allowed);
          return selected;
        });
        return service;
    }

    vendorDataFilterDuplicate(data){
        let arr = _.uniqBy(data, '_id');
        return arr;
    }

    ngSelectArrow(){
        let ngArrow = document.querySelectorAll('.ng-arrow-wrapper');
        ngArrow.forEach(function(item) {
            let arrowDown = document.createElement('span');
            arrowDown.className = 'down-arrow';
            let firstChild = item.children[0];
            if (!item.children[1]) {
                firstChild.parentNode.insertBefore(arrowDown, firstChild.nextSibling);
            }
        });
    }

    moveCursorToEnd(elems) {
        let el = elems.target;
        el.focus();
        if (typeof el.selectionStart == "number") {
            el.selectionStart = el.selectionEnd = el.value.length;
        } else if (typeof el.createTextRange != "undefined") {           
            var range = el.createTextRange();
            range.collapse(false);
            range.select();
        }
    }

    parseLastDigit(str){
        let count = 3;
        let asciiCode = String.fromCharCode(0x25CF); 
        str = new Array(str.length - count + 1).join(asciiCode) + str.slice( -count);
        return str;
    }
}