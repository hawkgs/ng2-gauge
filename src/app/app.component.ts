import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: `<ng-gauge [max]="max" [unit]="'rpm'" [showDigital]="true" [input]="input" [sectors]="sectors" [light]="7000"></ng-gauge>`
})
export class AppComponent {
  max = 10000;
  input: number;
  sectors = [{
    from: 7000,
    to: 7700,
    color: 'orange'
  }, {
    from: 7700,
    to: 9000,
    color: 'red'
  }];

  constructor() {
    // const target = Math.floor(Math.random() * this.max);
    const target = 7500;

    const simulate = () => {
      for (let i = 0, t = 0; i < target; i += 15, t++) {
        setTimeout(() => {
          this.input = i;
        }, t * 0.5);
      }
    };

    simulate();
  }
}
