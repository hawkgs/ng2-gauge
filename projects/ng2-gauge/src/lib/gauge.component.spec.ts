import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GaugeComponent } from './gauge.component';
import { CommonModule } from '@angular/common';

describe('GaugeComponent', () => {
  function createComponent() {
    const fixture = TestBed.createComponent(GaugeComponent);
    const component = fixture.componentInstance;

    return { fixture, component };
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommonModule],
      declarations: [GaugeComponent],
    }).compileComponents();
  });

  it('should create', async () => {
    const { component, fixture } = createComponent();
    component.max = 5000;
    fixture.detectChanges();

    expect(component).toBeTruthy();
  });

  describe('validators', () => {
    it('should throw an error, if "max" is not provided', async () => {
      expect(() => {
        const { fixture } = createComponent();
        fixture.detectChanges();
      }).toThrowError('GaugeComponent: Missing "max" input property (or zero)');
    });

    it('should throw an error, if "max" is negative', async () => {
      expect(() => {
        const { component, fixture } = createComponent();
        component.max = -1;
        fixture.detectChanges();
      }).toThrowError(
        'GaugeComponent: "max" input property cannot be negative.',
      );
    });

    it('should throw an error, if scale arc start is negative', () => {
      expect(() => {
        const { component, fixture } = createComponent();
        component.max = 5000;
        component.arcStart = -1;
        fixture.detectChanges();
      }).toThrowError(
        'GaugeComponent: The scale arc end and start must be between 0 and 359 degrees.',
      );
    });

    it('should throw an error, if scale arc start above 359', () => {
      expect(() => {
        const { component, fixture } = createComponent();
        component.max = 5000;
        component.arcStart = 360;
        fixture.detectChanges();
      }).toThrowError(
        'GaugeComponent: The scale arc end and start must be between 0 and 359 degrees.',
      );
    });

    it('should throw an error, if scale arc end is negative', () => {
      expect(() => {
        const { component, fixture } = createComponent();
        component.max = 5000;
        component.arcEnd = -1;
        fixture.detectChanges();
      }).toThrowError(
        'GaugeComponent: The scale arc end and start must be between 0 and 359 degrees.',
      );
    });

    it('should throw an error, if scale arc end is above 359', () => {
      expect(() => {
        const { component, fixture } = createComponent();
        component.max = 5000;
        component.arcEnd = 360;
        fixture.detectChanges();
      }).toThrowError(
        'GaugeComponent: The scale arc end and start must be between 0 and 359 degrees.',
      );
    });

    it('should throw an error, if the lower bound is greater than or equal to the upper', () => {
      expect(() => {
        const { component, fixture } = createComponent();
        component.max = 5000;
        component.sectors = [
          {
            from: 200,
            to: 100,
            color: 'red',
          },
        ];
        fixture.detectChanges();
      }).toThrowError(
        'GaugeComponent: The lower bound of the sector cannot be greater than or equal to the upper one.',
      );

      expect(() => {
        const { component, fixture } = createComponent();
        component.max = 5000;
        component.sectors = [
          {
            from: 100,
            to: 100,
            color: 'red',
          },
        ];
        fixture.detectChanges();
      }).toThrowError(
        'GaugeComponent: The lower bound of the sector cannot be greater than or equal to the upper one.',
      );
    });

    it('should throw an error, if the bounds are negative', () => {
      expect(() => {
        const { component, fixture } = createComponent();
        component.max = 5000;
        component.sectors = [
          {
            from: -1,
            to: 100,
            color: 'red',
          },
        ];
        fixture.detectChanges();
      }).toThrowError('GaugeComponent: The sector bounds cannot be negative.');

      expect(() => {
        const { component, fixture } = createComponent();
        component.max = 5000;
        component.sectors = [
          {
            from: 0,
            to: -1,
            color: 'red',
          },
        ];
        fixture.detectChanges();
      }).toThrowError('GaugeComponent: The sector bounds cannot be negative.');
    });

    it('should throw an error, if the bounds are greater than the max', () => {
      expect(() => {
        const { component, fixture } = createComponent();
        component.max = 5000;
        component.sectors = [
          {
            from: 5001,
            to: 5100,
            color: 'red',
          },
        ];
        fixture.detectChanges();
      }).toThrowError(
        'GaugeComponent: The sector bounds cannot be greater than the max value.',
      );
    });
  });
});
