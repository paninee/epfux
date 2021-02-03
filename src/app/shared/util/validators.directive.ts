import { Directive, Input, OnChanges, SimpleChanges } from '@angular/core';
import { AbstractControl, NG_VALIDATORS, Validator, ValidatorFn, Validators, FormGroup, ValidationErrors } from '@angular/forms';

export class PasswordValidation {
  static MatchPassword(AC: AbstractControl) {
    let password = AC.get('password'); // to get value in input tag
    let confirmPassword = AC.get('confirmPassword'); // to get value in input tag
      if(password.value != confirmPassword.value) {
        confirmPassword.setErrors( {passwordNotMatch: true} )
      } else {
        confirmPassword.setErrors( null )
      }
  }
}