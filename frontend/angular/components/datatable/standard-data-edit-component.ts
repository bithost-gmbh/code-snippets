/**
 * C(R)UD functionality to be implemented by all data table columns, e.g. the underlying model
 */
import { Observable, ReplaySubject } from 'rxjs';

export interface StandardDataEditComponent<T> {

  /** Datasource used for the data table */
  datasource: ReplaySubject<T[]>;

  /** Emits when the datasource was refreshed */
  datasourceRefreshed?: ReplaySubject<Date>;

  /**
   * Returns a new model instance
   * @returns {T}
   */
  getNewModelInstance(): T;

  /**
   * Persists a model
   * @param {T} model
   */
  createModel(model: T): Observable<void>;

  /**
   * Updates a persisted model
   * @param {T} model
   */
  updateModel(model: T): Observable<void>;

  /**
   * Deletes a persisted model
   * @param {T} model
   */
  deleteModel(model: T): Observable<void>;

  /**
   * Refreshes the datasource
   */
  refreshDatasource?(): void;
}
