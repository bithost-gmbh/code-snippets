import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DeleteDialogComponent } from './delete-dialog.component';
import { Information } from '../../../../../../core/services/backend-api/admin/generated';
import { DatatableColumn } from '../../datatable-config.interface';
import { configureTestSuite, MainTestingModule } from '../../../../../../testing/main-testing.module';
import { ComponentsModule } from '../../../components.module';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DialogConfig } from '../dialog-config.interface';
import { Observable } from 'rxjs';

describe('DeleteDialogComponent', () => {
  configureTestSuite();

  let component: DeleteDialogComponent<Information>;
  let fixture: ComponentFixture<DeleteDialogComponent<Information>>;

  const COLUMNS: {[name: string]: DatatableColumn} = {
    validFromDate: {
      name: 'validFromDate',
      type: 'date',
      labelKey: 'features.administration.banks.information.tableColumns.validFromDate',
      isFilter: true,
      dateFilterComparison: 'greater',
    },
    validUntilDate: {
      name: 'validUntilDate',
      type: 'date',
      labelKey: 'features.administration.banks.information.tableColumns.validUntilDate',
      isFilter: true,
      dateFilterComparison: 'lower',
      hideInDialogActions: ['update']
    },
    contentDe: {
      name: 'contentDe',
      type: 'textarea',
      labelKey: 'features.administration.banks.information.tableColumns.contentDe',
      isFilter: true,
    }
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        MainTestingModule,
        ComponentsModule
      ],
      providers: [
        {
          provide: MAT_DIALOG_DATA,
          useValue: <DialogConfig<Information>>{
            action: 'delete',
            model: {
              contentDe: 'Test',
              validFromDate: '2000-02-02',
              validUntilDate: '3000-03-03'
            },
            config: {
              columns: [
                COLUMNS['validFromDate'],
                COLUMNS['validUntilDate'],
                COLUMNS['contentDe']
              ]
            }
          }
        },
        {
          provide: MatDialogRef,
          userValue: {afterOpen: new Observable()}
        }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DeleteDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
