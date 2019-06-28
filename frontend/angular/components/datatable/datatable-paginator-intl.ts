import { MatPaginatorIntl } from '@angular/material/paginator';
import { TranslateHelperService } from 'lsg-ext';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { Injectable } from '@angular/core';

/**
 * Translates all the labels used for the material paginator to the currently selected language
 */
@Injectable()
export class DatatablePaginatorIntl extends MatPaginatorIntl {

  /** Label used in between the numbers, i.e. 1-10 -->von<-- 100 */
  private ofLabel: string;

  /** Subject that emits when the component has been destroyed. */
  private _onDestroy = new Subject<void>();

  constructor(private translateHelperService: TranslateHelperService) {
    super();

    this.translateHelperService.getUserLanguageSubject()
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.firstPageLabel = this.translateHelperService.translate('features.administration.components.datatablePaginator.firstPage');
        this.itemsPerPageLabel = this.translateHelperService.translate('features.administration.components.datatablePaginator.itemsPerPage');
        this.lastPageLabel = this.translateHelperService.translate('features.administration.components.datatablePaginator.lastPage');
        this.nextPageLabel = this.translateHelperService.translate('features.administration.components.datatablePaginator.nextPage');
        this.previousPageLabel = this.translateHelperService.translate('features.administration.components.datatablePaginator.previousPage');
        this.ofLabel = this.translateHelperService.translate('features.administration.components.datatablePaginator.of');
        this.changes.next();
      });
  }

  getRangeLabel = (page: number, pageSize: number, length: number) => {
    if (length === 0 || pageSize === 0) {
      return '0 ' + this.ofLabel + ' ' + length;
    }

    const startIndex = page * pageSize;
    const endIndex = startIndex < length ? Math.min(startIndex + pageSize, length) : startIndex + pageSize;
    return (startIndex + 1) + ' - ' + endIndex + ' ' + this.ofLabel + ' ' + length;
  };

}
