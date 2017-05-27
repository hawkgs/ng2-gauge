import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { GaugeComponent } from './gauge.component';

@NgModule({
  imports: [BrowserModule],
  declarations: [GaugeComponent],
  exports: [GaugeComponent]
})
export class GaugeModule {}
