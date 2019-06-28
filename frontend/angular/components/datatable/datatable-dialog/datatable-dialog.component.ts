import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Inject,
  OnDestroy,
  OnInit,
  Output,
  QueryList,
  ViewChildren
} from '@angular/core';
import { DateAdapter } from '@angular/material/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSelect } from '@angular/material/select';
import { DialogConfig } from './dialog-config.interface';
import { DatatableColumn } from '../datatable-config.interface';
import { AbstractControl, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { DateService } from 'lsg-ext';
import { wobbleAnimation } from './wobble-animation';
import { DialogFileInputDirective } from './dialog-file-input.directive';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { NumberService } from '../../../../../core/services/number/number.service';
import { DatepickerDateAdapter } from '../datepicker-date-adapter';
import { TranslateHelperService } from 'lsg-ext';

/** Model helper types that are being used in the dialog. For example the time input which is the model helper
 * to an input of type date-time. */
type ModelHelperType = 'time';
const MODEL_HELPER_TYPES: ModelHelperType[] = ['time'];

/** To map columns with their corresponding helper type */
interface ModelHelperDatatableColumn {
  modelHelperType: ModelHelperType;
  datatableColumn: DatatableColumn;
}

/**
 * Dialog component that takes a similar configuration as the data table as input
 * and displays an insert/edit/delete dialog, depending on the configuration.
 * Based on the column configuration passed in, the dialog will display
 * input elements based on the types of the columns and allow the user
 * to modify the data.
 */
@Component({
  selector: 'rbtool-datatable-dialog',
  templateUrl: './datatable-dialog.component.html',
  styleUrls: ['./datatable-dialog.component.scss'],
  providers: [
    {
      provide: DateAdapter,
      useClass: DatepickerDateAdapter
    }
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [wobbleAnimation]
})
export class DatatableDialogComponent<T> implements OnInit, OnDestroy {

  /** For unit testing purposes */
  @ViewChildren(MatSelect) matSelectFields: QueryList<MatSelect>;

  /** Emits when the form was changed and saved */
  @Output() modelChange: EventEmitter<T> = new EventEmitter<T>();

  /** trigger for the wobble animation */
  public _wobbleTrigger: boolean = false;

  /** Form group for all the input elements */
  public formGroup: FormGroup;

  /** If a file is currently being uploaded or not */
  public _isUploading: boolean = false;

  /** Uploaded files via the file input elements */
  public _uploadedFiles: { [columnName: string]: { file: Int8Array, name: string} } = {};

  /** File input elements that were registered via the directive */
  public _fileInputElements: { [columnName: string]: DialogFileInputDirective } = {};

  /** Subject that emits when the component has been destroyed. */
  private _onDestroy = new Subject<void>();

  /** All modelHelper controls with their corresponding type */
  private modelHelperDatatableColumns: ModelHelperDatatableColumn[] = [];


  constructor(@Inject(MAT_DIALOG_DATA) public dialogConfig: DialogConfig<T>,
              private matDialogRef: MatDialogRef<DatatableDialogComponent<T>>,
              private changeDetectorRef: ChangeDetectorRef,
              private dateService: DateService,
              private translateHelperService: TranslateHelperService,
              public elementRef: ElementRef) {
  }

  ngOnInit() {
    this.generateFormControls();
  }

  ngOnDestroy() {
    this._onDestroy.next();
    this._onDestroy.complete();
  }

  /**
   * As soon as the file input elements get created they will be registered here in the dialog component to access them.
   * @param {DatatableColumn} column
   * @param {DialogFileInputDirective} fileInputDirective
   * @private
   */
  public _registerFileInput(column: DatatableColumn, fileInputDirective: DialogFileInputDirective) {
    this._fileInputElements[column.name] = fileInputDirective;
  }

  /**
   * Trigger the input="file" element click event
   * @private
   */
  public _triggerFileInputSelector(column: DatatableColumn) {
    if (!this._fileInputElements[column.name]) {
      return;
    }

    // Otherwise the change event will not be fired when selecting the same file more than once
    this._fileInputElements[column.name].elementRef.nativeElement.value = null;
    this._fileInputElements[column.name].elementRef.nativeElement.click();
  }

  /**
   * Retrieve the selected file and store it in an object under the column name to retrieve it when syncing the model later.
   * @param {DatatableColumn} column
   * @private
   */
  public _onFileAdded(column: DatatableColumn) {
    this._isUploading = true;
    const fileInputElement: HTMLInputElement = this._fileInputElements[column.name].elementRef.nativeElement;
    const file = fileInputElement.files[0];
    let reader = new FileReader();

    if (!file) {
      return;
    }

    reader.addEventListener('load', () => {
      if (!this._uploadedFiles[column.name]) {
        this._uploadedFiles[column.name] = {
          name: null,
          file: null
        };
      }

      this._uploadedFiles[column.name].file = new Int8Array(<ArrayBuffer>reader.result);
      this._uploadedFiles[column.name].name = file.name;

      this._isUploading = false;
      this.changeDetectorRef.markForCheck();
    });

    reader.readAsArrayBuffer(file);
  }

  /**
   * Converts a byte array to a hex string
   * @param byteArray
   * @returns {string}
   */
  public _toHexString(byteArray: Int8Array): string {
    return Array.from(byteArray, (byte: number) => {
      /* tslint:disable:no-bitwise */
      return ('0' + (byte & 0xFF).toString(16)).slice(-2);
    }).join('');
  }

  /**
   * Just close the dialog, no further action required.
   * @private
   */
  public _cancel() {
    this.matDialogRef.close();
  }

  /**
   * Checks if all of the available (-> currently visible) form controls in the form group
   * of the dialog are valid.
   * This is done because it could prevent the user from saving a valid form if a hidden form control has an invalid state.
   * This can occur when form controls are displayed based on a condition and are hidden from the user (therefore the user cannot
   * enter a valid value and the form would evaluate as invalid).
   */
  public isFormGroupValid(): boolean {
    const formControlValid = this._getAvailableColumns()
      .map(column => this._getColumnFormControl(column))
      .every(formControl => formControl.valid);

    const helperFormControlValid = this._getAvailableHelperColumns()
      .every(modelHelperColumn => this._getColumnHelperFormControl(modelHelperColumn.datatableColumn, modelHelperColumn.modelHelperType).valid);

    // Both, standard formControls and helperFormControls need to be valid to allow a save
    return formControlValid && helperFormControlValid;
  }

  /**
   * Checks if any one of the available (-> currently visible) form controls in the form group
   * of the dialog is dirty.
   * This is done because it could prevent the user from saving a valid form if a hidden form control has an invalid state.
   * This can occur when form controls are displayed based on a condition and are hidden from the user (therefore the user cannot
   * enter a valid value and the form would evaluate as invalid).
   */
  private isFormGroupDirty(): boolean {
    const formControlDirty = this._getAvailableColumns()
      .map(column => this._getColumnFormControl(column))
      .some(formControl => formControl.dirty);

    const helperFormControlDirty = this._getAvailableHelperColumns()
      .every(modelHelperColumn => this._getColumnHelperFormControl(modelHelperColumn.datatableColumn, modelHelperColumn.modelHelperType).dirty);

    // If a standard formControl or a helperFormControl is dirty, allow saving
    return formControlDirty || helperFormControlDirty;
  }

  /**
   * Emit an event to save the model on click of the save button.
   * @private
   */
  public _save() {

    // don't save if the form is not valid
    if (!this.isFormGroupValid()) {
      // mark each field as touched and trigger the wobble animation
      this.dialogConfig.config.columns.forEach(column => {
        this._getColumnFormControl(column).markAsTouched();
        if (column.type === 'date-time') {
          this._getColumnHelperFormControl(column, 'time').markAsTouched();
        }
      });
      this.triggerWobbleAnimation();
      return;
    }

    // Only save when something has changed or when it is an insert dialog (user doesn't necessarily have to change an input value to save)
    if (this.isFormGroupDirty() || this.dialogConfig.action === 'insert') {
      // copy the values from the form group onto the existing model (keys and non-editable fields will be lost otherwise)
      const model: T = Object.assign(Object.create(Object.getPrototypeOf(this.dialogConfig.model)),
                                   this.dialogConfig.model,
                                   this.formGroup.controls.model.value);

      // Copy files uploaded separately as they are not form controls
      this.dialogConfig.config.columns
        .filter(column => column.type === 'file')
        .forEach(fileColumn => {
          if (this._uploadedFiles[fileColumn.name]) {
            model[fileColumn.name] = this._toHexString(this._uploadedFiles[fileColumn.name].file);
          }
        });

      // Convert percentage values before persisting them (divide by 100)
      this.dialogConfig.config.columns
        .filter(column => column.type === 'percent')
        .forEach(column => {
          model[column.name] = NumberService.percentageToRelative(model[column.name]);
        });

      // Convert the dates on the model to strings to be in line with the generated models
      this.dialogConfig.config.columns
        .filter(column => column.type === 'date' || column.type === 'date-time')
        .forEach(column => {
          const dateFormControl = this._getColumnFormControl(column);
          // No need to check if the string is a valid date (date validators already take care of this)
          if (dateFormControl && dateFormControl.value) {
            // Use formatDateISO() instead of toISOString() to avoid time-zone related issues
            model[column.name] = this.dateService.formatDateISO(dateFormControl.value);

            if (column.type === 'date-time') {
              const timeFormControl = this._getColumnHelperFormControl(column, 'time');
              if (timeFormControl && timeFormControl.value) {
                model[column.name] += 'T' + timeFormControl.value + ':00';
              }
            }
          }
        });

      this.modelChange.emit(model);
    }

    this.matDialogRef.close();
  }

  /**
   * Get all the available columns for the current dialog action
   * @returns {DatatableColumn[]}
   * @private
   */
  public _getAvailableColumns(): DatatableColumn[] {
    if (!this.dialogConfig) {
      return;
    }

    return this.dialogConfig.config.columns.filter(column => {
      return (!column.hideInDialogActions || column.hideInDialogActions.indexOf(this.dialogConfig.action) === -1)
        && (!column.showInDialogCondition || this.formGroup && column.showInDialogCondition(this.dialogConfig.action, <FormGroup>this.formGroup.controls.model));
    })
  }

  /**
   * Returns an array of datatable columns and their corresponding ModelHelperType
   * @private
   */
  public _getAvailableHelperColumns(): ModelHelperDatatableColumn[] {
    if (!this.dialogConfig || !this.formGroup) {
      return;
    }

    // Filter out the model helper control if the "main" control it belongs to is hidden in the dialog
    return this.modelHelperDatatableColumns.filter(modelHelperDatatableColumn => {
      return (!modelHelperDatatableColumn.datatableColumn.hideInDialogActions || modelHelperDatatableColumn.datatableColumn.hideInDialogActions.indexOf(this.dialogConfig.action) === -1)
        && (!modelHelperDatatableColumn.datatableColumn.showInDialogCondition || this.formGroup && modelHelperDatatableColumn.datatableColumn.showInDialogCondition(this.dialogConfig.action, <FormGroup>this.formGroup.controls.model));
    });
  }

  /**
   * Returns whether a column form field should be read-only
   * @param {DatatableColumn} column
   * @returns {boolean}
   * @private
   */
  public _isColumnReadOnly(column: DatatableColumn) {
    return this.dialogConfig.action === 'update' && column.preventUpdate ||
      this.dialogConfig.action === 'insert' && column.preventInsert
  }

  /**
   * Generates all the form controls needed for the dialog and groups them in a from control. Validators are added if defined
   * in the config.
   */
  private generateFormControls() {
    if (!this.dialogConfig) {
      return;
    }

    let modelControls: {[name: string]: FormControl} = {};
    let modelHelperControls: {[name: string]: FormControl} = {};

    this.dialogConfig.config.columns.forEach(column => {
      // create form controls directly corresponding to the model values
      modelControls[column.name] = new FormControl(this.dialogConfig.model[column.name], this.getValidators(column));

      // If the column is of type enum and has an onEnumChange function defined, listen for the changes
      if (column.type === 'enum' && column.onEnumChange) {
        modelControls[column.name].valueChanges
          .pipe(takeUntil(this._onDestroy))
          .subscribe(newValue => {
            column.onEnumChange(this.formGroup, newValue);
          });
      }

      if (column.type === 'date-time') {
        // create a helper form control for the time
        let inputTime = '';
        if (this.dialogConfig.model[column.name] && DateService.isIsoDateTimeStringValid(this.dialogConfig.model[column.name])) {
          inputTime = this.dateService.formatTime(new Date(this.dialogConfig.model[column.name]));
        } else {
          // preset system time for all time input fields
          inputTime = DateService.getCurrentTimeAsString();
        }

        // Only set the required validator if needed, the others are for validating the date and not the time
        modelHelperControls[this._getColumnHelperFormControlName(column, 'time')] = new FormControl(
          inputTime, [...(this._isColumnRequired(column) ? [Validators.required] : []), DateService.isTimeValid]
        );
        this.modelHelperDatatableColumns.push({
          modelHelperType: 'time',
          datatableColumn: column
        });
      }
    });

    this.formGroup = new FormGroup({
      model: new FormGroup(modelControls),
      modelHelper: new FormGroup(modelHelperControls),
    });
  }

  /**
   * Generates an array of validator functions based on the configuration for this column
   * @param {DatatableColumn} column
   * @returns {ValidatorFn[]}
   */
  private getValidators(column: DatatableColumn): ValidatorFn[] {
    if (!column) {
      return [];
    }

    let validators: ValidatorFn[] = [];
    if (column.required) {
      validators.push(Validators.required);
    }

    if (column.customValidators) {
      validators.push(...column.customValidators);
    }

    return validators;
  }

  /**
   * Triggers the wobble animation
   */
  private triggerWobbleAnimation() {
    this._wobbleTrigger = !this._wobbleTrigger;
    this.changeDetectorRef.markForCheck();
  }

  /**
   * Returns the form control corresponding to a column
   * @param column
   * @returns {AbstractControl}
   * @private
   */
  _getColumnFormControl(column: DatatableColumn): AbstractControl {
    return this.formGroup.get('model.' + column.name);
  }

  /**
   * Returns the model helper form control corresponding to a column and a helper type given
   * @param {DatatableColumn} column
   * @param {ModelHelperType} helperType
   * @returns {AbstractControl}
   * @private
   */
  _getColumnHelperFormControl(column: DatatableColumn, helperType: ModelHelperType): AbstractControl {
    return this.formGroup.get('modelHelper.' + this._getColumnHelperFormControlName(column, helperType));
  }

  /**
   * Returns the model helper form control name
   * @param {DatatableColumn} column
   * @param {ModelHelperType} helperType
   * @returns {string}
   * @private
   */
  _getColumnHelperFormControlName(column: DatatableColumn, helperType: ModelHelperType): string {
    return helperType + '-' + column.name;
  }

  /**
   * Returns whether the form control corresponding to the column given has the error state given
   * @param {DatatableColumn} column
   * @param {string} error
   * @returns {boolean}
   * @private
   */
  _hasColumnFormControlError(column: DatatableColumn, error: string): boolean {
    const control = this._getColumnFormControl(column);
    return control && control.touched && control.errors && control.errors[error];
  }
  /**
   * Returns whether the helper form control corresponding to the column given has the error state given
   * @param {DatatableColumn} column
   * @param {ModelHelperType} helperType
   * @param {string} error
   * @returns {boolean}
   * @private
   */
  _hasColumnHelperFormControlError(column: DatatableColumn, helperType: ModelHelperType, error: string): boolean {
    const control = this._getColumnHelperFormControl(column, helperType);
    return control && control.touched && control.errors && control.errors[error];
  }

  /**
   * Returns whether the Column is a required input field
   * @param {DatatableColumn} column
   * @returns {boolean}
   * @private
   */
  _isColumnRequired(column: DatatableColumn): boolean {
    return column.required;
  }

  /**
   * Retrieves the translated dialog title
   * @private
   */
  _getDialogTitleLabel(): string {
    if (this.dialogConfig.action === 'insert') {
      return this.translateHelperService.translate(this.dialogConfig.config.insertLabelKey);
    } else {
      return this.translateHelperService.translate('features.administration.components.datatableDialog.'
        + this.dialogConfig.action + '.title');
    }
  }
}
