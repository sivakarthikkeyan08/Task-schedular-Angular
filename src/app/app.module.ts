import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms'; // ADD THIS LINE

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { TaskSchedularComponent } from './task-schedular/task-schedular.component';

@NgModule({
  declarations: [
    AppComponent,
    TaskSchedularComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule // ADD THIS LINE
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
