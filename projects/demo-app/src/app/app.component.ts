import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GaugeModule } from 'ng2-gauge';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, GaugeModule],
  template: `<ng2-gauge
    [max]="max"
    [unit]="'rpm'"
    [showDigital]="true"
    [sectors]="sectors"
    [input]="input"
  ></ng2-gauge>`,
})
export class AppComponent {
  max = 9000;
  input!: number;
  sectors = [
    {
      from: 6500,
      to: 8000,
      color: 'orange',
    },
    {
      from: 8000,
      to: 9000,
      color: 'red',
    },
  ];

  constructor() {
    const target = 5600;
    const simulate = () => {
      for (let i = 0, t = 0; i < target; i += 15, t++) {
        setTimeout(() => {
          this.input = i;
        }, t * 0.5);
      }
    };

    simulate();

    // setTimeout(() => {
    //   this.max = 15000;
    // }, 5000);
  }
}
