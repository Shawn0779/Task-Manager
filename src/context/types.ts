export interface TeamMember {
  id: string;
  name: string;
  email: string;
  color: string;
}

export type TaskStatus = 'todo' | 'in-progress' | 'done';
export type RecurrenceFrequency = 'daily' | 'weekly' | 'monthly';

export interface RecurrenceRule {
  frequency: RecurrenceFrequency;
  interval: number;
  daysOfWeek?: number[]; // 0–6, used for weekly
  endDate?: string; // YYYY-MM-DD, inclusive
}

export interface Task {
  id: string;
  seriesId?: string;
  isException?: boolean;
  isDeleted?: boolean;
  title: string;
  description?: string;
  status: TaskStatus;
  dueDate: string; // YYYY-MM-DD
  assigneeIds: string[];
  recurrence?: RecurrenceRule;
}

export type CalendarView = 'month' | 'week' | 'day';

// A resolved task instance ready for calendar display
export interface TaskInstance {
  task: Task;
  date: string; // YYYY-MM-DD — the date this instance falls on
  isVirtual: boolean; // computed from recurrence, not a stored exception
}
