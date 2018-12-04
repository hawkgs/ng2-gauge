import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { Ng2GaugeComponent } from './ng2-gauge.component';

@NgModule({
  declarations: [Ng2GaugeComponent],
  imports: [
    BrowserModule
  ],
  exports: [Ng2GaugeComponent]
})
export class Ng2GaugeModule { }
