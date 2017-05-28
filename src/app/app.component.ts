import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: `<ng-gauge [max]="max" [unit]="'rpm'" [showDigital]="true" [input]="input" [sectors]="sectors"></ng-gauge>`
})
export class AppComponent {
  max = 9000;
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
    const target = Math.floor(Math.random() * this.max);

    const simulate = () => {
      for (let i = 0, t = 0; i < target; i++, t++) {
        setTimeout(() => {
          this.input = i;
        }, t * 0.5);
      }
    };

    simulate();
  }
}
