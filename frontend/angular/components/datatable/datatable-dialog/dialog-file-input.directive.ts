import { Directive, ElementRef, forwardRef, Host, Inject, Input, OnInit, Optional } from '@angular/core';
import { DatatableDialogComponent } from './datatable-dialog.component';
import { DatatableColumn } from '../datatable-config.interface';

/**
 * Directive used on input[type="file"] elements in the data table dialog to register them with the dialog
 * and provide an element reference to access the hidden element
 */
@Directive({
  selector: '[rbtoolDialogFileInput]'
})
export class DialogFileInputDirective implements OnInit {

  /** Column to which this file input element/directive belongs */
  @Input() datatableColumn: DatatableColumn;


  constructor(public elementRef: ElementRef,
              @Optional() @Host() @Inject(forwardRef(() => DatatableDialogComponent))
              private dialogComponent?: DatatableDialogComponent<any>) {
  }

  ngOnInit() {
    if (!this.dialogComponent || !this.datatableColumn) {
      return;
    }

    this.registerWithDialogComponent();
  }

  /**
   * Register the element with the parent component, the dialog.
   */
  private registerWithDialogComponent() {
    this.dialogComponent._registerFileInput(this.datatableColumn, this);
  }
}
