import { DatatableAction, DatatableConfig } from '../datatable-config.interface';

/**
 * Configuration that is passed to the dialog component to configure
 * which action of dialog to show and which properties of the model
 * should be available for editing/inserting.
 */
export interface DialogConfig<T> {
  /** action of dialog */
  action: DatatableAction;
  /** Column configuration taken directly from the data table configuration */
  config: DatatableConfig;
  /** Model */
  model: T;
}
