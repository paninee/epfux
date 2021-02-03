export class FormErrorParser {

  /**
   * Validate form fields and display errors.
   * @param formErrors            Error metadata object
   * @param form                  FormGroup instance
   * @param formLang              Languge code
   * @param localizedFields       Array of fields that is i10n
   * @param markAllFieldsDirty    Boolean to identify if fields are going to make dirty.
   * @returns                     Error metadata object with error messages
   */
  static basic(formErrors, form, formLang, localizedFields = [], markAllFieldsDirty = false): any {
    for (const field in formErrors) {
      const control = form.get(field);

      // This will clear error messages of localized fields
      if (localizedFields.indexOf(field) >= 0) {
        formErrors[field][formLang].message = '';
      } else {
        formErrors[field].message = '';
      }

      if(control && markAllFieldsDirty){
        control.markAsDirty();
      }
      
      if (control && control.dirty && !control.valid) {
        const messages = formErrors[field];
        if (localizedFields.indexOf(field) >= 0) {
          formErrors = FormErrorParser.validateLocalizedFields(field, control, markAllFieldsDirty, formLang, formErrors);
        } else {
          for (const key in control.errors) {
            formErrors[field].message = messages[key];
          }
        }
      }
    }

    return formErrors;
  }

  /**
   * Validate localized form fields and display errors.
   * @param field                 Form field
   * @param formControl           Form control of field
   * @param markAllFieldsDirty    Boolean to identify if fields are going to make dirty
   * @param formLang              Current form language
   * @param formErrors            Error metadata object
   * @returns                     Error metadata object with error messages
   */
  static validateLocalizedFields(field, formControl, markAllFieldsDirty, formLang, formErrors) {
    const control = formControl.get(formLang);

    if(control && markAllFieldsDirty){
      control.markAsDirty();
    }

    if (control && control.dirty && !control.valid) {
      const messages = formErrors[field][formLang];
      for (const key in control.errors) {
        formErrors[field][formLang].message = messages[key];
      }
    }

    return formErrors;
  }
}