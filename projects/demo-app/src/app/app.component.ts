import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GaugeModule } from 'ng2-gauge';
import { MockEngineObdService } from './mock-data-src.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, GaugeModule],
  providers: [MockEngineObdService],
  template: `<ng2-gauge
    unit="rpm"
    [max]="9000"
    [digitalDisplay]="true"
    [input]="(obd.rpm$ | async) || 0"
    [sectors]="[{
      from: 6500,
      to: 8000,
      color: 'orange',
    }, {
      from: 8000,
      to: 9000,
      color: 'red',
    }]"
  ></ng2-gauge>`,
})
export class AppComponent implements OnInit {
  constructor(public obd: MockEngineObdService) {}

  ngOnInit() {
    this.obd.connect();
  }
}
