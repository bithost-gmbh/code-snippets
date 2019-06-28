import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DatatableFilterInputComponent } from './datatable-filter-input.component';
import { configureTestSuite, MainTestingModule } from '../../../../../testing/main-testing.module';
import { ComponentsModule } from '../../components.module';

/**
 * Actual tests of this component are implemented in the components that use the data table filters
 */
describe('DatatableFilterInputComponent', () => {
  configureTestSuite();

  let component: DatatableFilterInputComponent;
  let fixture: ComponentFixture<DatatableFilterInputComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        MainTestingModule,
        ComponentsModule
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DatatableFilterInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

});
