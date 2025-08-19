import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

export interface Task {
  id: string;
  name: string;
  endTime: Date;
  priority: 'High' | 'Low';
  isCompleted: boolean;
  createdAt: Date;
}

export interface TaskFormData {
  name: string;
  endTime: string;
  priority: 'High' | 'Low';
}

@Component({
  selector: 'app-task-schedular',
  templateUrl: './task-schedular.component.html',
  styleUrls: ['./task-schedular.component.css']
})
export class TaskSchedularComponent implements OnInit {
  taskForm: FormGroup;
  tasks: Task[] = [];

  constructor(private formBuilder: FormBuilder) {
    this.taskForm = this.createTaskForm();
  }

  ngOnInit(): void {
    // Initialize with empty task list
  }

  private createTaskForm(): FormGroup {
    return this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      endTime: ['', Validators.required],
      priority: ['High', Validators.required]
    });
  }

  addTask(): void {
    if (this.taskForm.valid) {
      const formData: TaskFormData = this.taskForm.value;
      
      const newTask: Task = {
        id: this.generateId(),
        name: formData.name,
        endTime: new Date(formData.endTime),
        priority: formData.priority,
        isCompleted: false,
        createdAt: new Date()
      };

      this.tasks.push(newTask);
      this.sortTasks();
      this.taskForm.reset({
        name: '',
        endTime: '',
        priority: 'High'
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  markTaskComplete(taskId: string): void {
    const task = this.tasks.find(t => t.id === taskId);
    if (task) {
      task.isCompleted = !task.isCompleted;
      this.sortTasks();
    }
  }

  deleteTask(taskId: string): void {
    this.tasks = this.tasks.filter(t => t.id !== taskId);
  }

  private sortTasks(): void {
    this.tasks.sort((a, b) => {
      // First, separate completed and active tasks
      if (a.isCompleted && !b.isCompleted) return 1;
      if (!a.isCompleted && b.isCompleted) return -1;
      
      // If both are completed, sort by completion time (most recent first)
      if (a.isCompleted && b.isCompleted) {
        return b.createdAt.getTime() - a.createdAt.getTime();
      }
      
      // For active tasks: sort by priority first (High before Low)
      if (a.priority !== b.priority) {
        return a.priority === 'High' ? -1 : 1;
      }
      
      // Within same priority: sort by end time (earlier first)
      return a.endTime.getTime() - b.endTime.getTime();
    });
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private markFormGroupTouched(): void {
    Object.keys(this.taskForm.controls).forEach(key => {
      const control = this.taskForm.get(key);
      if (control) {
        control.markAsTouched();
      }
    });
  }

  get activeTasks(): Task[] {
    return this.tasks.filter(task => !task.isCompleted);
  }

  get completedTasks(): Task[] {
    return this.tasks.filter(task => task.isCompleted);
  }

  // Getter methods for template validation
  get taskName() { return this.taskForm.get('name'); }
  get taskEndTime() { return this.taskForm.get('endTime'); }
  get taskPriority() { return this.taskForm.get('priority'); }
}
