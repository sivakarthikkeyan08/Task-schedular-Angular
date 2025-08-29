import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { GoogleGenerativeAI } from '@google/generative-ai';

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

  aiSuggestion: string = '';
  aiLoading = false;
  aiError: string | null = null;

  // Define API key directly in the component
  private readonly GEMINI_API_KEY = 'AIzaSyADmJg2BH6xnOkk_Oi3UGGR4hUN3PQmE64';
  private genAI = new GoogleGenerativeAI(this.GEMINI_API_KEY);
  private model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  constructor(private formBuilder: FormBuilder) {
    this.taskForm = this.createTaskForm();
  }

  ngOnInit(): void {
    this.safeGenerate();
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
        name: formData.name.trim(),
        endTime: new Date(formData.endTime),
        priority: formData.priority,
        isCompleted: false,
        createdAt: new Date()
      };

      this.tasks.push(newTask);
      this.sortTasks();
      this.taskForm.reset({ name: '', endTime: '', priority: 'High' });

      this.safeGenerate();
    } else {
      this.markFormGroupTouched();
    }
  }

  markTaskComplete(taskId: string): void {
    const task = this.tasks.find(t => t.id === taskId);
    if (task) {
      task.isCompleted = !task.isCompleted;
      this.sortTasks();
      this.safeGenerate();
    }
  }

  deleteTask(taskId: string): void {
    this.tasks = this.tasks.filter(t => t.id !== taskId);
    this.safeGenerate();
  }

  private sortTasks(): void {
    this.tasks.sort((a, b) => {
      if (a.isCompleted && !b.isCompleted) return 1;
      if (!a.isCompleted && b.isCompleted) return -1;
      if (a.isCompleted && b.isCompleted) {
        return b.createdAt.getTime() - a.createdAt.getTime();
      }
      if (a.priority !== b.priority) {
        return a.priority === 'High' ? -1 : 1;
      }
      return a.endTime.getTime() - b.endTime.getTime();
    });
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private markFormGroupTouched(): void {
    Object.keys(this.taskForm.controls).forEach(key => {
      const control = this.taskForm.get(key);
      if (control) control.markAsTouched();
    });
  }

  get taskName() {
    return this.taskForm.get('name');
  }
  get taskEndTime() {
    return this.taskForm.get('endTime');
  }
  get activeTasks(): Task[] {
    return this.tasks.filter(task => !task.isCompleted);
  }
  get completedTasks(): Task[] {
    return this.tasks.filter(task => task.isCompleted);
  }

  private buildPromptFromTasks(): string {
    const active = this.activeTasks;
    if (active.length === 0) {
      return `There are no active tasks. Please respond with a short, cheerful sentence encouraging the user to add tasks.`;
    }

    const high = active.filter(t => t.priority === 'High').sort((a, b) => a.endTime.getTime() - b.endTime.getTime());
    const low = active.filter(t => t.priority === 'Low').sort((a, b) => a.endTime.getTime() - b.endTime.getTime());

    const fmt = (t: Task) => `- ${t.name} (priority: ${t.priority}, due: ${t.endTime.toLocaleString()})`;

    return [
      `You are an assistant that writes a single friendly paragraph (3–6 sentences) suggesting a plan for the user's day.`,
      `Be concise, motivational, and specific. Mention "High" priority items first.`,
      `Tasks (active only):`,
      ...high.map(fmt),
      ...low.map(fmt),
      `Tone: warm, helpful, and matter-of-fact. Avoid bullet lists; write a paragraph.`
    ].join('\n');
  }

  async generateSuggestions(): Promise<void> {
    await this.safeGenerate(true);
  }

  private async safeGenerate(force = false): Promise<void> {
    if (this.activeTasks.length === 0 && !force) {
      this.aiSuggestion = '';
      this.aiError = null;
      this.aiLoading = false;
      return;
    }

    const prompt = this.buildPromptFromTasks();
    this.aiLoading = true;
    this.aiError = null;

    try {
      const result = await this.model.generateContent(prompt);
      const text = result.response?.text?.() ?? '';
      this.aiSuggestion = (text || '').trim();
      if (!this.aiSuggestion) {
        this.aiSuggestion = 'I could not craft a suggestion just now. Try Regenerate.';
      }
    } catch (err) {
      console.error(err);
      this.aiError = 'Failed to fetch AI suggestion. Please try again.';
    } finally {
      this.aiLoading = false;
    }
  }

  copySuggestion(): void {
    if (!this.aiSuggestion) return;
    navigator.clipboard.writeText(this.aiSuggestion).catch(() => {});
  }
}