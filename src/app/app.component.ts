import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: `<ng-gauge [max]="max" [input]="input"></ng-gauge>`
})
export class AppComponent {
  max = 9000;
  input: number;

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
