import { observable, computed, action } from 'mobx';
import Field from './Field';

class Form {

  /**
   * The unique key for this form.
   */
  key = null;

  /**
   * The raw data provided by Drupal.
   */
  form;

  @observable settings = {};

  /**
   * All fields in this form.
   * @type {Array.<Field>}
   */
  @observable fields = [];

  /**
   * All visible fields in this form.
   * @type {Array.<Field>}
   */
  @computed get visibleFields() {
    return this.fields.filter(field => field.visible);
  }


  constructor(formId, { settings, form, defaultValues = {} }) {
    this.key = formId;
    this.form = form;
    this.settings = settings;

    // Create all fields.
    this.form.elements.forEach(element => this.createField(element));

    // Set all default values.
    Object.keys(defaultValues).forEach((key) => {
      const field = this.getField(key);
      if(field) field.value = defaultValues[key];
    });
  }

  @action.bound
  createField(element) {
    const field = new Field(this, element);
    this.fields.push(field);

    // If it has children, create them too.
    if(element.composite_elements) {
      element.composite_elements.forEach(e => this.createField(e));
    }
  }

  /**
   * @param key
   * @returns {Field}
   */
  getField(key) {
    return this.fields.find(field => field.key === key);
  }

  @computed get valid() {
    return !this.fields.find(field => field.visible && !field.valid);
  }

  isValid(page) {
    const invalid = this.fields.find((field) => {
      // Only check the current page
      if(!field.component || field.component.props.webformPage !== page) return false;

      // If an error was found, return true
      return !field.valid;
    });

    // If an error was found, return false
    return !invalid;
  }

  @observable isSubmitting = false;

}

export default Form;
