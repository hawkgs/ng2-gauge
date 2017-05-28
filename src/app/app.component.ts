import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: `<ng-gauge [max]="max" [input]="input" [sectors]="sectors"></ng-gauge>`
})
export class AppComponent {
  max = 525;
  input: number;
  sectors = [/*{
    from: 7000,
    to: 8500,
    color: 'orange'
  }, */{
    from: 400,
    to: 525,
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
