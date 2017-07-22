# angular-gauge

Gauge component for Angular

## Installation

```
npm install angular-gauge
```

## How to?

You should import the `GaugeModule` to your desired module:

```typescript
import { GaugeModule } from 'angular-gauge';

@NgModule({
    imports : [CommonModule, GaugeModule, ...],
})
export class SharedModule {}
```

Then you can simply import the component and add it to your template:

```typescript
import { Component } from '@angular/core';
import { GaugeComponent } from 'angular-gauge';

@Component({
  selector: 'app-my-component',
  template: `
    <ng-gauge
      [max]="9000"
      [input]="input"
    </ng-gauge>`
})
export class MyComponent {
  input: number;
}
```

## Options

The component provides a list of the following options:
- `max: number` (required) - The maximal value of the gauge. It is suggested to use a number that is divisible by 100, 1000 and so on.
- `input: number` (required) - The current value of the gauge.
- `unit: string` - The unit of the gauge (i.e. mph, psi, etc.)
- `start: number` (in degrees) - The start/beginning of the scale
- `end: number` (in degrees) - The end of the scale
- `showDigital: boolean` - Displays the current value as number inside the gauge
- `lightTheme: boolean` - Switches to the light theme
- `light: number` - Shows a red light when the specified limit is reached
- `sectors: Sectors[]` - Defines the coloring of specified sectors
- `factor: number` (Not recommended) - Changes the scale factor
- `config: GaugeConfig` (Not recommended) - Alters the default configuration; This may lead to unexpected behavior; [GaugeConfig](./src/app/gauge/shared/config.ts)

### Sectors

Sectors are used for marking parts of the arc with a different color.

Example:
```typescript
const max = 9000;
const sectors = [{
  from: 6500,
  to: 7500,
  color: 'orange'
}, {
  from: 7500,
  to: 9000,
  color: 'red'
}];
```
