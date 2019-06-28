import { Component, ElementRef, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DialogConfig } from '../dialog-config.interface';
import { TranslateHelperService } from 'lsg-ext';
import { DatatableColumn, EnumValue } from '../../datatable-config.interface';

export interface KeyValueColumn {
  column: DatatableColumn,
  key: string;
  value: string;
}

@Component({
  selector: 'rbtool-delete-dialog',
  templateUrl: './delete-dialog.component.html',
  styleUrls: ['./delete-dialog.component.scss']
})
export class DeleteDialogComponent<T> implements OnInit {

  public _deleteColumns: KeyValueColumn[];

  constructor(@Inject(MAT_DIALOG_DATA) public dialogConfig: DialogConfig<T>,
              private matDialogRef: MatDialogRef<DeleteDialogComponent<T>>,
              private translateHelperService: TranslateHelperService,
              public elementRef: ElementRef) { }

  ngOnInit() {
    if (this.dialogConfig) {
      this.generateDeleteDialogContent();
    }
  }

  public _cancel() {
    this.matDialogRef.close();
  }

  public _ok() {
    this.matDialogRef.close(true);
  }

  private generateDeleteDialogContent() {
    this._deleteColumns = [];

    this.dialogConfig.config.columns
      .filter(column => !column.hideInDialogActions || column.hideInDialogActions.indexOf('delete') === -1)
      .forEach(column => {
        this._deleteColumns.push({
          column: column,
          key: String(this.translateHelperService.translate(column.labelKey)),
          value: (String(this.dialogConfig.model[column.name]).length < 50 ? String(this.dialogConfig.model[column.name]) :
            String(this.dialogConfig.model[column.name]).substring(0, 50) + '...')
        });
      });
  }

  /**
   * Returns the enum value entity corresponding to the model value
   * @param {DatatableColumn} column
   * @param {string | number} value
   * @returns {EnumValue}
   * @private
   */
  public _findEnumValue(column: DatatableColumn, value: string | number): EnumValue {
    if (!column || !column.enumValues || value === undefined) {
      return;
    }
    return column.enumValues.find(enumValue => String(enumValue.value) === String(value));
  }

}
