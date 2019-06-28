import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DatatableDialogComponent } from './datatable-dialog.component';
import { configureTestSuite, MainTestingModule } from '../../../../../testing/main-testing.module';
import { ComponentsModule } from '../../components.module';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Information } from '../../../../../core/services/backend-api/admin/generated';
import { DatatableColumn } from '../datatable-config.interface';
import { Observable } from 'rxjs';
import { DialogConfig } from './dialog-config.interface';


/**
 * Actual tests of this component are implemented in the components that use the data table dialog
 */
describe('DatatableDialogComponent', () => {
  configureTestSuite();

  let component: DatatableDialogComponent<Information>;
  let fixture: ComponentFixture<DatatableDialogComponent<Information>>;

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
          useValue: <DialogConfig<{}>>{
            action: 'delete',
            model: {},
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
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DatatableDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should return the enabled fields', () => {
    component.dialogConfig.action = 'insert';
    expect(component._getAvailableColumns()).toEqual([
      COLUMNS['validFromDate'],
      COLUMNS['validUntilDate'],
      COLUMNS['contentDe'],
    ] as any);
    component.dialogConfig.action = 'update';
    expect(component._getAvailableColumns()).toEqual([
      COLUMNS['validFromDate'],
      COLUMNS['contentDe'],
    ] as any);
    component.dialogConfig.action = 'delete';
    expect(component._getAvailableColumns()).toEqual([
      COLUMNS['validFromDate'],
      COLUMNS['validUntilDate'],
      COLUMNS['contentDe'],
    ] as any);
  });

});
