import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FilterStateValue } from '../filter-state-value.type';
import { DatatableColumn } from '../datatable-config.interface';
import { DateAdapter } from '@angular/material/core';
import { MatSelect } from '@angular/material/select';
import { DateService } from 'lsg-ext';
import { DatepickerDateAdapter } from '../datepicker-date-adapter';

/**
 * Generates an input element (text field, date picker, select) based on the column type
 * that is passed in. Emits an event whenever the ngModel of the input element changes,
 * the event is used to filter the data table that this component comes "attached" to.
 */
@Component({
  selector: 'rbtool-datatable-filter-input',
  templateUrl: './datatable-filter-input.component.html',
  styleUrls: ['./datatable-filter-input.component.scss'],
  providers: [
    {
      provide: DateAdapter,
      useClass: DatepickerDateAdapter
    }
  ]
})
export class DatatableFilterInputComponent implements OnInit {

  /** Config that specifies the type of input element to generate */
  @Input() columnConfig: DatatableColumn;

  /** Emits an event when the ngModel of the input element changes */
  @Output() filterChange: EventEmitter<FilterStateValue> = new EventEmitter<FilterStateValue>();

  /** The input element, used for unit testing */
  @ViewChild('filterInput', { read: ElementRef, static: false })
  public _filterInput: ElementRef;

  /** If the filter has a select field, this is a reference to the MatSelect */
  @ViewChild(MatSelect, { static: false }) matSelectField: MatSelect;

  /** Automatically emits a new value when the ngModel is changed  */
  private _filterValue: string | Date;
  set filterValue(filterValue: string | Date) {
    this._filterValue = filterValue;
    this._emitModelChange();
  }
  get filterValue(): string | Date {
    return this._filterValue;
  }


  constructor() {

  }

  ngOnInit() {
    this.initializeInitialFilterValue()
  }

  /**
   * If an initial filter value is provided, set it. The setter will then automatically emit the new value which in turn will
   * filter the data table.
   */
  private initializeInitialFilterValue() {
    if (!this.columnConfig || !this.columnConfig.initialFilterValue) {
      return;
    }

    // Set initial filter values
    if (this.columnConfig.type === 'string') {
      this.filterValue = this.columnConfig.initialFilterValue;
    } else if (this.columnConfig.type === 'date' || this.columnConfig.type === 'date-time') {
      this.filterValue = DateService.convertStringToDate(this.columnConfig.initialFilterValue);
    }
  }

  /**
   * Will be called whenever the the filter value is changed via the ngModel
   * @private
   */
  private _emitModelChange() {
    if (this.columnConfig.type === 'date' || this.columnConfig.type === 'date-time') {
      this.filterChange.emit({column: this.columnConfig, dateObject: <Date>this._filterValue});
    } else {
      this.filterChange.emit({column: this.columnConfig, value: <string>this._filterValue});
    }
  }
}
