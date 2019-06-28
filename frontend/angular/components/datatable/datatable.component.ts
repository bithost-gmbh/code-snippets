import {
  ChangeDetectionStrategy, ChangeDetectorRef,
  Component,
  Inject,
  InjectionToken,
  Input, OnDestroy,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren
} from '@angular/core';
import { StandardDataEditComponent } from './standard-data-edit-component';
import { Observable, Subject } from 'rxjs';
import { combineLatest } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatPaginator, MatPaginatorIntl } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ComponentType } from '@angular/cdk/portal';

import { enterAnimation, TranslateHelperService } from 'lsg-ext';
import { DialogService } from 'lsg-ext/features/layout/material-theme';

import { DateComparison, FilterStateValue } from './filter-state-value.type';
import { DatatableAction, DatatableColumn, DatatableConfig, EnumValue } from './datatable-config.interface';
import { DatatableDialogComponent } from './datatable-dialog/datatable-dialog.component';
import { DateService } from 'lsg-ext';
import { PermissionService } from '../../../../core/services/permission/permission.service';
import { DatatableFilterInputComponent } from './datatable-filter-input/datatable-filter-input.component';
import { DialogConfig } from './datatable-dialog/dialog-config.interface';
import { DatatablePaginatorIntl } from './datatable-paginator-intl';
import { DeleteDialogComponent } from './datatable-dialog/delete-dialog/delete-dialog.component';
import { ErrorLoggingService } from '../../../../core/services/logging/error-logging/error-logging.service';
import { Initialized } from '../../../../shared/initialization/initialized';


export const STANDARD_DATA_EDIT_COMPONENT: InjectionToken<StandardDataEditComponent<any>> =
  new InjectionToken<StandardDataEditComponent<any>>('standard edit component');

export type SnackBarType = 'delete' | 'update' | 'insert' | 'error';


/**
 * Component that generates a Material Datatable component and filters attached to it, based on the datasource
 * and column configuration provided. C(R)UD dialogs can be attache to it by setting the according configurations.
 */
@Component({
  selector: 'rbtool-datatable',
  templateUrl: './datatable.component.html',
  styleUrls: ['./datatable.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    enterAnimation
  ],
  providers: [
    {
      provide: MatPaginatorIntl,
      useClass: DatatablePaginatorIntl
    },
  ]
})
export class DatatableComponent<T> implements OnInit, OnDestroy {

  /** When the datasource was last refreshed */
  private dataSourceRefreshDate: Date;

  /** Material data source 'wrapper' to attach the paginator and sorting*/
  public _matDataSource = new MatTableDataSource([]);

  /** Length of the data source, used for mat-paginator */
  public _dataSourceLength: number;

  /** Dialog reference to the currently open dialog */
  public _dialogRef: MatDialogRef<DatatableDialogComponent<T>>;

  /** In case it is a delete dialog, ref is stored here */
  public _deleteDialogRef: MatDialogRef<DeleteDialogComponent<T>>;

  /** Collection of all the columns and their attached filters including the value of the filters */
  private filterState: {[column: string]: FilterStateValue} = {};

  /** Emits a new subject whenever a filter value has changed and the datasource needs to be filtered */
  private triggerFilter: BehaviorSubject<void> = new BehaviorSubject<void>(null);

  /** Emits a new subject only once and only when both the table helpers (sorting and pagination) have been initialized */
  private matDatasourceInitialized: Initialized = new Initialized();

  /** All the filters used by the datatable, used for unit testing */
  @ViewChildren(DatatableFilterInputComponent) public _filterInputs: QueryList<DatatableFilterInputComponent>;

  /** Paginator for the data table */
  private paginator: MatPaginator;
  @ViewChild(MatPaginator, { static: false }) set matPaginator(mp: MatPaginator) {
    this.paginator = mp;
    this._matDataSource.paginator = this.paginator;
    this.checkTableHelpersInitialized();
  }

  /** Sorting for the data table */
  private sort: MatSort;
  @ViewChild(MatSort, { static: false }) set matSort(ms: MatSort) {
    this.sort = ms;
    this._matDataSource.sort = this.sort;
    this.checkTableHelpersInitialized();
  }

  /** Datasource of the mat-table, filtered by the attached filters (defined via column configuration) */
  _datasource: Observable<T[]>;
  @Input() set datasource(datasource: Observable<T[]>) {
    this._datasource = combineLatest(datasource, this.triggerFilter)
      .pipe(
        map(([data, triggerFilter]: [T[], void]) => {
          if (!data) {
            return [];
          }

          // Filter the data with all the combined filter states from the
          // filter input element that are attached to the table
          let filteredDatasource = data.filter(entry => this.entryFilter(entry));
          this._dataSourceLength = filteredDatasource.length;
          this.changeDetectorRef.markForCheck();
          return filteredDatasource;
        })
      );

    // Keep the Material datasource in sync
    combineLatest(this._datasource, this.matDatasourceInitialized)
      .pipe(takeUntil(this._onDestroy))
      .subscribe(([data, initialized]: [T[], boolean]) => {
        if (!this._dataLoaded) {
          this._dataLoaded = true;
        }
        setTimeout(() => {
          this._matDataSource.data = data;
          this.changeDetectorRef.markForCheck();
        });

    });
  };

  /** Column configuration for this mat-table */
  private _config: DatatableConfig;
  @Input() set config(config: DatatableConfig) {
    this._config = config;
    this.columnNameMapping = {};
    config.columns.forEach(column => this.columnNameMapping[this._getTableColumnName(column.name)] = column.name);
  }
  get config(): DatatableConfig {
    return this._config;
  }

  /** Whether to disable pagination */
  @Input() public disablePagination: boolean = false;

  /** Whether to disable sorting */
  @Input() public disableSorting: boolean = false;

  /** Maps the prefixed ('DATA_') column names to the actual column names / model property names, used for sorting the table */
  public columnNameMapping: {[tableColumnNamePrefixed: string]: string};

  /** Whether data is currently being loaded/persisted */
  public loading: boolean;

  /** Subject that emits when the component has been destroyed. */
  private _onDestroy = new Subject<void>();

  /** Whether data was loaded initially */
  public _dataLoaded: boolean = false;


  /** Inject StandardDataEditComponent to invoke CRUD functionality on the underlying model */
  constructor(@Inject(STANDARD_DATA_EDIT_COMPONENT) public standardDataEditComponent: StandardDataEditComponent<T>,
              private dialog: MatDialog,
              private snackBar: MatSnackBar,
              private translateHelperService: TranslateHelperService,
              private dateService: DateService,
              private dialogService: DialogService,
              private changeDetectorRef: ChangeDetectorRef,
              private permissionService: PermissionService,
              private errorLoggingService: ErrorLoggingService) {
  }

  ngOnInit() {
    // Override the data accessor because our column names are not equal to the property names
    this._matDataSource.sortingDataAccessor = (data: T[], sortHeaderId: string) => {
      return data[this.columnNameMapping[sortHeaderId]];
    };

    if (this.config && this.config.showRefreshButton) {
      this.standardDataEditComponent.datasourceRefreshed
        .pipe(takeUntil(this._onDestroy))
        .subscribe((d: Date) => {
          this.dataSourceRefreshDate = d;
        });
    }
  }

  /**
   * Returns whether or not the table helpers (sorting and pagination) have been initialized.
   */
  checkTableHelpersInitialized() {
    if ((this.disableSorting || this.sort) && (this.disablePagination || this.paginator)) {
      this.matDatasourceInitialized.next();
    }
  }

  ngOnDestroy() {
    this._onDestroy.next();
    this._onDestroy.complete();
  }

  /**
   * Returns the columns to be displayed in the table
   * @returns {string[]}
   */
  public _getDisplayedColumns(): string[] {
    if (!this.config || !this.config.columns) {
      return;
    }

    let displayedColumns = this.config.columns
      .filter(column => !column.noTableColumn)
      .map(column => this._getTableColumnName(column.name));

    // Add custom column for actions on the records in the table -> dialogs
    if (this._isActionEnabled('update', null) || this._isActionEnabled('delete', null)) {
      displayedColumns.push(this._getActionColumnName('action'));
    }

    return displayedColumns;
  }

  /**
   * Prefix the data columns to distinguish them clearly from the other custom columns, like actions
   * @param {string} columnName
   * @returns {string}
   * @private
   */
  public _getTableColumnName(columnName: string): string {
    return 'DATA_' + columnName;
  }


  /**
   * Prefix the action columns to distinguish them clearly from the data columns
   * @param {string} columnName
   * @returns {string}
   * @private
   */
  public _getActionColumnName(columnName: string): string {
    return 'ACTION_' + columnName;
  }

  /**
   * Returns whether the action given is enabled. False if it is a disabled action
   * or the user is non-admin (rb User) and the action is disabled for rb users
   *
   * Optionally also checks a condition for each model whether to show the update/delete action for this particular row
   * @param {string} action
   * @param element
   * @returns {boolean}
   * @private
   */
  public _isActionEnabled(action: DatatableAction, element: T) {
    const actionDisabledByConfig = (
        this._config && this._config.disabledActions && this._config.disabledActions.indexOf(action) > -1
      )
      || (
        !this.permissionService.isAdmin()
        && this.config.rbUserConfiguration
        && this.config.rbUserConfiguration.disabledActions
        && this.config.rbUserConfiguration.disabledActions.indexOf(action) > -1
      );

    let actionDisabledByCondition = false;
    if (element && this._config) {
      if (action === 'update' && this._config.showUpdateCondition) {
        actionDisabledByCondition  = !this._config.showUpdateCondition(element);
      } else if (action === 'delete' && this._config.showDeleteCondition) {
        actionDisabledByCondition  = !this._config.showDeleteCondition(element);
      }
    }

    return !actionDisabledByConfig && !actionDisabledByCondition;
  }

  /**
   * Returns whether displaying the filters is enabled
   * @returns {boolean}
   * @private
   */
  public _isFiltersEnabled() {
    return this.permissionService.isAdmin() || this.config.rbUserConfiguration && !this.config.rbUserConfiguration.hideFilters;
  }

  /**
   * Delete the underlying model
   * @param {T} model
   */
  public showDeleteDialog(model: T) {
    if (!this.standardDataEditComponent) {
      return;
    }

    this._deleteDialogRef = this.dialog
      .open(DeleteDialogComponent as ComponentType<DeleteDialogComponent<T>>, {
        data: <DialogConfig<T>>{
          action: 'delete',
          config: this.config,
          model: model
        }
      });

    this._deleteDialogRef.afterClosed()
      .pipe(takeUntil(this._onDestroy))
      .subscribe(dialogResult => {
        if (dialogResult) {
          this.loading = true;
          this.changeDetectorRef.markForCheck();
          this.standardDataEditComponent.deleteModel(model)
            .pipe(takeUntil(this._onDestroy))
            .subscribe(() => {
              this.loading = false;
              this.changeDetectorRef.markForCheck();
              this._displaySnackbar('delete');
            }, (e: Error) => {
              this._displaySnackbar('error');
              this.errorLoggingService.errors.next(e);
            });
        }
      });
  }

  /**
   * Update the underlying model
   * @param {T} model
   */
  public showUpdateDialog(model: T) {
    if (!this.standardDataEditComponent) {
      return;
    }

    this._dialogRef = this.dialog
      .open(DatatableDialogComponent as ComponentType<DatatableDialogComponent<T>>, {
        data: <DialogConfig<T>>{
          action: 'update',
          config: this.config,
          model: model
        }
      });

    this._dialogRef.componentInstance.modelChange
      .pipe(takeUntil(this._onDestroy))
      .subscribe((modelToUpdate: T) => {
        if (modelToUpdate) {
          this.loading = true;
          this.changeDetectorRef.markForCheck();
          this.standardDataEditComponent.updateModel(modelToUpdate)
            .pipe(takeUntil(this._onDestroy))
            .subscribe(() => {
              this.loading = false;
              this.changeDetectorRef.markForCheck();
              this._displaySnackbar('update');
            }, (e: Error) => {
              this._displaySnackbar('error');
              this.errorLoggingService.errors.next(e);
            });
        }
      });
  }

  /**
   * Create a new record in the database for the underlying model
   */
  public showCreateDialog() {
    if (!this.standardDataEditComponent) {
      return;
    }

    this._dialogRef = this.dialog
      .open(DatatableDialogComponent as ComponentType<DatatableDialogComponent<T>>, {
        data: <DialogConfig<T>>{
          action: 'insert',
          config: this.config,
          model: this.standardDataEditComponent.getNewModelInstance()
        }
      });

    this._dialogRef.componentInstance.modelChange
      .pipe(takeUntil(this._onDestroy))
      .subscribe((modelToInsert: T) => {
        if (modelToInsert) {
          this.loading = true;
          this.changeDetectorRef.markForCheck();
          this.standardDataEditComponent.createModel(modelToInsert)
            .pipe(takeUntil(this._onDestroy))
            .subscribe(() => {
              this.loading = false;
              this.changeDetectorRef.markForCheck();
              this._displaySnackbar('insert');
            }, (e: Error) => {
              this._displaySnackbar('error');
              this.errorLoggingService.errors.next(e);
            });
        }
      });
  }

  /**
   * Update the filter state for a particular column, triggers the filtering of datasource and
   * therefore also filters the data table
   * @param {DatatableColumn} column Column config
   * @param {FilterStateValue} event Value of the filter
   * @private
   */
  _setFilterState(column: DatatableColumn, event: FilterStateValue) {
    let filter: FilterStateValue = {
      column: column
    };

    if ((column.type === 'date' || column.type === 'date-time') && event.dateObject && DateService.isDateValid(event.dateObject)) {
        filter.dateObject = event.dateObject;
        filter.dateComparison = column.dateFilterComparison;
        filter.isDateFilterValid = true;
    } else {
      filter.value = event.value;
    }

    this.filterState[column.name] = filter;
    this.triggerFilter.next(null);
    this.changeDetectorRef.markForCheck();
  }

  /**
   * Filter function used to filter the datasource entries by the given filters in the filterState
   * @param {T} entry
   * @returns {boolean}
   */
  private entryFilter(entry: T): boolean {
    return Object.keys(this.filterState).every((column): boolean => {
      const filter = this.filterState[column];
      // check for undefined because the filter value can be false/true in case of a boolean type filter, so !filter.value doesn't work
      if (!filter || (filter.value === undefined && !filter.isDateFilterValid)) {
        return true;
      }

      if (filter.column.type === 'date' || filter.column.type === 'date-time') {
        // In case the date filter is not valid, don't filter the table
        if (!filter.dateObject || !filter.isDateFilterValid) {
          return true;
        }

        // For date filters check if the filter value should be applied to another column
        const columnToFilter = filter.column.applyFilterToColumn ? filter.column.applyFilterToColumn : column;

        return entry && entry[columnToFilter] &&
          this.compareDates(this.dateService.formatDateISO(filter.dateObject), entry[columnToFilter], filter.dateComparison);
      } else if (filter.column.type === 'enum' || filter.column.type === 'boolean') {
        return filter.value === undefined || filter.value === null || entry && entry[column] === filter.value;
      }

      return entry && entry[column] && String(entry[column]).toLowerCase().indexOf(String(filter.value).toLowerCase()) > -1;
    });
  };

  private compareDates(d1: string, d2: string, dateComparison: DateComparison): boolean {
    let d1Date = new Date(d1);
    let d2Date = new Date(d2);
    return dateComparison === 'equal' ? d1Date === d2Date :
           dateComparison === 'greater' ? d2Date > d1Date : d2Date < d1Date;

  }

  /**
   * Moves to the first page of the table via the paginator
   * @param {Sort} sort
   * @private
   */
  public _toFirstPage(sort: Sort) {
    if (this._matDataSource.paginator) {
      this._matDataSource.paginator.firstPage();
    }
  }

  /**
   * Display a snackbar, informing the user that the data manipulation was successful. In case of an error the snackbar will be highlighted
   * in red color and an error message will be shown
   */
  public _displaySnackbar(type: SnackBarType) {
    this.snackBar.open(
      this.translateHelperService.translate(
        'features.administration.components.datatableSnackbar.' + type
      ),
      null,
      {
        duration: 1000,
        panelClass: type === 'error' ? ['rbtool-datatable-snackbar-error'] : []
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
    return column.enumValues.find(enumValue => enumValue.value === value);
  }

  /**
   * Returns the insert button label key to be translated
   * @private
   */
  public _getInsertButtonLabelKey(): string {
    return this._config.insertLabelKey ? this._config.insertLabelKey :
      'features.administration.components.datatable.createButton';
  }

  /**
   * Returns the label and timestamp when the datasource was last refreshed
   * @private
   */
  public _getLastRefreshLabel(): string {
    return this.translateHelperService.translate(
      'features.administration.components.datatable.lastRefresh',
      { timestamp: this.dateService.formatDateWithSeconds(this.dataSourceRefreshDate) }
      );
  }
}
