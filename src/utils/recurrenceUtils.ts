import { parseISO, addDays, addWeeks, addMonths, format, startOfDay, endOfDay } from 'date-fns';
import { Task, TaskInstance, RecurrenceRule } from '../context/types';

/**
 * Given the full task list and a date range [start, end],
 * returns all TaskInstances that fall within that range.
 *
 * Strategy:
 *  1. Collect non-recurring tasks whose dueDate falls in range.
 *  2. For each recurring root task (no seriesId or seriesId === id), expand instances.
 *  3. Collect exception tasks (isException=true) keyed by seriesId+date.
 *  4. Override / suppress virtual instances with exceptions.
 */
export function getTaskInstancesForRange(
  tasks: Task[],
  rangeStart: Date,
  rangeEnd: Date
): TaskInstance[] {
  const instances: TaskInstance[] = [];
  // Normalize to midnight boundaries to avoid time-of-day comparison issues
  const start = startOfDay(rangeStart);
  const end = endOfDay(rangeEnd);

  // Build exception map: seriesId -> date -> Task
  const exceptionMap = new Map<string, Map<string, Task>>();
  for (const task of tasks) {
    if (task.isException && task.seriesId) {
      if (!exceptionMap.has(task.seriesId)) {
        exceptionMap.set(task.seriesId, new Map());
      }
      exceptionMap.get(task.seriesId)!.set(task.dueDate, task);
    }
  }

  for (const task of tasks) {
    // Skip exception records — they're handled via exceptionMap
    if (task.isException) continue;

    if (!task.recurrence) {
      // One-off task
      const d = parseISO(task.dueDate);
      if (d >= start && d <= end && !task.isDeleted) {
        instances.push({ task, date: task.dueDate, isVirtual: false });
      }
      continue;
    }

    // Recurring root task — expand
    const seriesExceptions = exceptionMap.get(task.id) ?? new Map<string, Task>();
    const expanded = expandSeries(task, start, end);

    for (const date of expanded) {
      const dateStr = format(date, 'yyyy-MM-dd');
      const exception = seriesExceptions.get(dateStr);

      if (exception) {
        // Exception overrides the virtual instance
        if (!exception.isDeleted) {
          instances.push({ task: exception, date: dateStr, isVirtual: false });
        }
      } else {
        instances.push({ task, date: dateStr, isVirtual: true });
      }
    }
  }

  return instances;
}

/** Returns dates within [rangeStart, rangeEnd] on which a recurring task occurs */
function expandSeries(task: Task, rangeStart: Date, rangeEnd: Date): Date[] {
  const rule = task.recurrence!;
  const seriesStart = parseISO(task.dueDate);
  const seriesEnd = rule.endDate ? parseISO(rule.endDate) : null;

  const results: Date[] = [];
  let cursor = seriesStart;
  const MAX_ITERATIONS = 3000;
  let iterations = 0;

  while (true) {
    iterations++;
    if (iterations > MAX_ITERATIONS) break;
    if (seriesEnd && cursor > seriesEnd) break;
    if (cursor > rangeEnd) break;

    if (cursor >= rangeStart) {
      results.push(cursor);
    }

    cursor = advance(cursor, rule);
  }

  return results;
}

function advance(date: Date, rule: RecurrenceRule): Date {
  const { frequency, interval } = rule;
  switch (frequency) {
    case 'daily':
      return addDays(date, interval);
    case 'weekly':
      return addWeeks(date, interval);
    case 'monthly':
      return addMonths(date, interval);
    default:
      return addDays(date, 1);
  }
}

/** Groups TaskInstances by date string */
export function groupByDate(instances: TaskInstance[]): Record<string, TaskInstance[]> {
  const map: Record<string, TaskInstance[]> = {};
  for (const inst of instances) {
    if (!map[inst.date]) map[inst.date] = [];
    map[inst.date].push(inst);
  }
  return map;
}
