import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

/**
 * A mock OBD data source used for demonstrating how ng2-gauge is fed with data.
 */
@Injectable()
export class MockEngineObdService {
  rpm$ = new BehaviorSubject<number>(0);

  connect() {
    const target = 5600;

    const simulate = () => {
      for (let i = 0, t = 0; i < target; i += 15, t++) {
        setTimeout(() => this.rpm$.next(i), t * 2);
      }
    };

    simulate();
  }
}
