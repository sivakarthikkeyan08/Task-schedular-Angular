import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskSchedularComponent } from './task-schedular.component';

describe('TaskSchedularComponent', () => {
  let component: TaskSchedularComponent;
  let fixture: ComponentFixture<TaskSchedularComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TaskSchedularComponent]
    });
    fixture = TestBed.createComponent(TaskSchedularComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
