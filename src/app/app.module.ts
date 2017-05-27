import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { GaugeModule } from './gauge/gauge.module';

import { AppComponent } from './app.component';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    GaugeModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
