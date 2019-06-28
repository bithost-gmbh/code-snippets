/**
 * Holds the state of a specific filter (input element) attached to the data table.
 */
import { DatatableColumn } from './datatable-config.interface';

export interface FilterStateValue {
  column: DatatableColumn;
  /** Basic string value filtering */
  value?: string;
  /** For date object filtering */
  dateObject?: Date;
  /** Operation to use when filtering a date*/
  dateComparison?: DateComparison;
  /** Whether the date filter value is valid or not */
  isDateFilterValid?: boolean;
}

export type DateComparison = 'equal' | 'greater' | 'lower';
