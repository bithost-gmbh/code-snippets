import { DateComparison } from './filter-state-value.type';
import { FormGroup, ValidatorFn } from '@angular/forms';

/** Data action */
export type DatatableAction = 'insert' | 'update' | 'delete';

/**
 * Contains the column configuration and overall configuration properties for the data table.
 */
export interface DatatableConfig {
  /** Definition of all the columns */
  columns: DatatableColumn[];

  /** Which actions should be disabled. */
  disabledActions?: DatatableAction[];

  /** Will replace the generated delete message with the translation key given here */
  customDeleteMessageKey?: string;

  /** Whether to hide the data table / filters. Can be used if only the option to create is required but no table / filters should be shown */
  hideTable?: boolean;

  /** Security config for the data table actions and filters. Only rely on this config in case
   * the user does not have an admin role. Admins can see all filters and access all actions */
  rbUserConfiguration?: {
    hideFilters?: boolean;
    /** Which actions should be disabled. */
    disabledActions?: DatatableAction[];
  }

  /** If set, returns whether the update icon should be shown for this row */
  showUpdateCondition?: (model: any) => boolean;

  /** If set, returns whether the delete icon should be shown for this row */
  showDeleteCondition?: (model: any) => boolean;

  /** When set, overrides the text of the insert button and the insert dialog title with the translation key provided here */
  insertLabelKey?: string;

  /** Displays a refresh button that allows the user to manually refresh the database. The refreshing of the data is being done by the
   * function implemented from the StandardDataEditComponent interface. Also includes a timestamp when the last refresh happened. */
  showRefreshButton?: boolean;
}

/**
 * Contains the configuration for a single column, which is part of the data table.
 */
export interface DatatableColumn {
  /** Property of the model class which should be displayed in this column */
  name: string;

  /** data type of the column used for input fields / displaying data in table */
  type: ColumnType;

  /** list of enum values. Required for type: enum */
  enumValues?: EnumValue[];

  /** Text that should be converted to a link element, points to the value of the column element.
   *  This has to be a valid translation key. Required for type: link */
  linkTextKey?: string;

  /** Optional function callback that will be executed (and passed the current rows model) when the link is clicked
   *  When this property is set, the link will not point to the column value, instead this function will be executed.
   * */
  linkFunctionCallback?: (model: any, $event: Event) => void;

  /** Key that will be translated in field labels / column headings */
  labelKey: string;

  /** Whether the field can't be updated. */
  preventUpdate?: boolean;

  /** Whether the field can't be inserted. */
  preventInsert?: boolean

  /** Whether the column is not shown in the table.  */
  noTableColumn?: boolean;

  /** Whether a filter element will be shown above the data table to filter this column. */
  isFilter?: boolean;

  /** Initial value of the filter control. Only has an effect if the column is a filter. */
  initialFilterValue?: string;

  /** Applies the value entered in this filter input element to another column. Useful if a date column needs to be filtered with two
   * filters, e.g. there is a from and a to date filter, but only one corresponding field/property on the model
   * */
  applyFilterToColumn?: string;

  /**  What comparison to use when filtering a date */
  dateFilterComparison?: DateComparison;

  /** List of dialog actions for which the field should not be displayed in the dialog form */
  hideInDialogActions?: DatatableAction[];

  /** If set, returns whether the field should be displayed in the dialog form */
  showInDialogCondition?: (action: DatatableAction, modelFormGroup: FormGroup) => boolean;

  /** Whether the Validators.required validator function should be added to the FormControl representing this column */
  required?: boolean;

  /** Custom validator function(s) can be defined here, in case the column requires more advanced validation,
   * i.e. range check for dates, validation including other columns, etc.
   */
  customValidators?: ValidatorFn[];

  /** If a tooltip should be displayed and what property from the model should be displayed in the tooltip
   *  Currently only implemented for string/enum */
  tooltipColumn?: string;

  /** Whenever the value of the enum changes (Note: only works for enum column types), this function will be executed */
  onEnumChange?: (formGroup: FormGroup, newValue: any) => void;
}

/**
 * Defines the type of a column in the data table. This has influence on the following things:
 * - Formatting of the value in the table
 * - Type of the input element that will be shown in case the column is filterable
 * - Type of the input element that will be shown in case the column is included in one of the modals
 *
 * Note
 * - Type file is only available as an input in a dialog, not as a filter or type to display in the table
 * - Types decimal/link are only available in the table as a display column type, not implemented as filter/dialog input
 * - Type percent can be used in the table as well as in dialogs
 */
export type ColumnType = 'string' | 'date' | 'date-time' | 'textarea' | 'boolean' | 'enum' | 'file' | 'link' | 'decimal' | 'percent';

/**
 * An enum value entity.
 */
export interface EnumValue {
  /** actual value of this enum entity */
  value: string | number;
  /** String label */
  label?: string;
  /** Label key. If set, will be translated and shown as label */
  labelKey?: string;
}

/**
 * User Language type used when retrieving status messages according to the selected language
 */
export type UserLanguage = 'de' | 'fr' | 'it';
