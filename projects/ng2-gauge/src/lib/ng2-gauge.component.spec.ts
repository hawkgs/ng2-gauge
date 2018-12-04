import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Ng2GaugeComponent } from './ng2-gauge.component';

describe('Ng2GaugeComponent', () => {
  let component: Ng2GaugeComponent;
  let fixture: ComponentFixture<Ng2GaugeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Ng2GaugeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Ng2GaugeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
