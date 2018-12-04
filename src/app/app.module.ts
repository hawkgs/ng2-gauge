import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { Ng2GaugeModule } from 'ng2-gauge';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    Ng2GaugeModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
