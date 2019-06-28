import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DatatableComponent, STANDARD_DATA_EDIT_COMPONENT } from './datatable.component';
import { Information } from '../../../../core/services/backend-api/admin/generated';
import { configureTestSuite, MainTestingModule } from '../../../../testing/main-testing.module';
import { ComponentsModule } from '../components.module';

/**
 * Actual tests of this component are implemented in the components that use the data table
 */
describe('DatatableComponent', () => {
  configureTestSuite();

  let component: DatatableComponent<Information>;
  let fixture: ComponentFixture<DatatableComponent<Information>>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        MainTestingModule,
        ComponentsModule
      ],
      providers: [
        {
          provide: STANDARD_DATA_EDIT_COMPONENT,
          useValue: {}
        }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DatatableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should return whether an action is enabled', () => {
    // check the defaults
    component.config = {columns: []};
    expect(component._isActionEnabled('insert', null)).toBe(true);
    expect(component._isActionEnabled('update', null)).toBe(true);
    expect(component._isActionEnabled('delete', null)).toBe(true);

    component.config = {columns: [], disabledActions: []};
    expect(component._isActionEnabled('insert', null)).toBe(true);
    expect(component._isActionEnabled('update', null)).toBe(true);
    expect(component._isActionEnabled('delete', null)).toBe(true);

    component.config = {columns: [], disabledActions: ['update']};
    expect(component._isActionEnabled('insert', null)).toBe(true);
    expect(component._isActionEnabled('update', null)).toBe(false);
    expect(component._isActionEnabled('delete', null)).toBe(true);

    component.config = {columns: [], disabledActions: ['insert']};
    expect(component._isActionEnabled('insert', null)).toBe(false);
    expect(component._isActionEnabled('update', null)).toBe(true);
    expect(component._isActionEnabled('delete', null)).toBe(true);

    component.config = {columns: [], disabledActions: ['delete']};
    expect(component._isActionEnabled('insert', null)).toBe(true);
    expect(component._isActionEnabled('update', null)).toBe(true);
    expect(component._isActionEnabled('delete', null)).toBe(false);

    component.config = {columns: [], disabledActions: ['delete', 'update']};
    expect(component._isActionEnabled('insert', null)).toBe(true);
    expect(component._isActionEnabled('update', null)).toBe(false);
    expect(component._isActionEnabled('delete', null)).toBe(false);
  });

});
