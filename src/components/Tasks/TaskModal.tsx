import { useState } from 'react';
import { format, subDays, parseISO } from 'date-fns';
import Modal from '../Shared/Modal';
import RecurrenceEditor from './RecurrenceEditor';
import AssigneeSelector from './AssigneeSelector';
import { useApp } from '../../context/AppContext';
import { Task, TaskStatus, RecurrenceRule, TaskInstance } from '../../context/types';
import styles from './TaskModal.module.css';

type Mode = 'create' | 'edit';

interface Props {
  instance?: TaskInstance; // existing task being edited
  defaultDate?: string; // YYYY-MM-DD for new task
  onClose: () => void;
}

export default function TaskModal({ instance, defaultDate, onClose }: Props) {
  const { dispatch } = useApp();
  const mode: Mode = instance ? 'edit' : 'create';
  const task = instance?.task;

  const [title, setTitle] = useState(task?.title ?? '');
  const [description, setDescription] = useState(task?.description ?? '');
  const [status, setStatus] = useState<TaskStatus>(task?.status ?? 'todo');
  const [dueDate, setDueDate] = useState(instance?.date ?? defaultDate ?? format(new Date(), 'yyyy-MM-dd'));
  const [assigneeIds, setAssigneeIds] = useState<string[]>(task?.assigneeIds ?? []);
  const [recurrence, setRecurrence] = useState<RecurrenceRule | undefined>(task?.recurrence);

  // Prompt shown for recurring task edits (only for root tasks that have a recurrence rule)
  const [recurringAction, setRecurringAction] = useState<'ask' | 'single' | 'future' | null>(
    mode === 'edit' && !!task?.recurrence ? 'ask' : null
  );

  function isRecurringEdit(): boolean {
    return mode === 'edit' && !!task?.recurrence;
  }

  function handleSave() {
    if (!title.trim()) return;

    if (mode === 'create') {
      dispatch({
        type: 'ADD_TASK',
        task: {
          id: crypto.randomUUID(),
          title: title.trim(),
          description: description.trim() || undefined,
          status,
          dueDate,
          assigneeIds,
          recurrence,
        },
      });
      onClose();
      return;
    }

    // Edit mode
    if (task?.recurrence && recurringAction === 'ask') {
      setRecurringAction('ask'); // force prompt to show
      return;
    }

    if (!task) return;

    if (recurringAction === 'single' || !task.recurrence) {
      // Edit/save just this instance as an exception
      if (task.isException) {
        // Already an exception, just update it
        dispatch({
          type: 'UPDATE_TASK',
          task: { ...task, title: title.trim(), description: description.trim() || undefined, status, dueDate, assigneeIds },
        });
      } else if (task.recurrence) {
        // Create exception, keep root unchanged
        dispatch({
          type: 'ADD_TASK',
          task: {
            id: crypto.randomUUID(),
            seriesId: task.seriesId ?? task.id,
            isException: true,
            title: title.trim(),
            description: description.trim() || undefined,
            status,
            dueDate: instance!.date,
            assigneeIds,
          },
        });
      } else {
        dispatch({
          type: 'UPDATE_TASK',
          task: { ...task, title: title.trim(), description: description.trim() || undefined, status, dueDate, assigneeIds },
        });
      }
    } else if (recurringAction === 'future') {
      // Truncate root series to day before this instance
      const rootTask = task.recurrence ? task : null; // root has recurrence defined

      if (rootTask) {
        const dayBefore = format(subDays(parseISO(instance!.date), 1), 'yyyy-MM-dd');
        if (dayBefore < rootTask.dueDate) {
          // This is the very first instance — delete the root entirely
          dispatch({ type: 'DELETE_TASK', id: rootTask.id });
        } else {
          dispatch({
            type: 'UPDATE_TASK',
            task: {
              ...rootTask,
              recurrence: { ...rootTask.recurrence!, endDate: dayBefore },
            },
          });
        }
      }

      // Create new root from this date forward
      dispatch({
        type: 'ADD_TASK',
        task: {
          id: crypto.randomUUID(),
          title: title.trim(),
          description: description.trim() || undefined,
          status,
          dueDate: instance!.date,
          assigneeIds,
          recurrence: recurrence ?? task.recurrence,
        },
      });
    }

    onClose();
  }

  function handleDelete() {
    if (!task) return;

    if (task.recurrence && recurringAction === 'ask') return;

    if (task.recurrence) {
      if (recurringAction === 'single') {
        // Delete just this instance: add a deleted exception
        dispatch({
          type: 'ADD_TASK',
          task: {
            id: crypto.randomUUID(),
            seriesId: task.seriesId ?? task.id,
            isException: true,
            isDeleted: true,
            title: task.title,
            status: task.status,
            dueDate: instance!.date,
            assigneeIds: task.assigneeIds,
          },
        });
      } else if (recurringAction === 'future') {
        // Truncate series
        const dayBefore = format(subDays(parseISO(instance!.date), 1), 'yyyy-MM-dd');
        if (dayBefore < task.dueDate) {
          dispatch({ type: 'DELETE_TASK', id: task.id });
        } else {
          dispatch({
            type: 'UPDATE_TASK',
            task: { ...task, recurrence: { ...task.recurrence!, endDate: dayBefore } },
          });
        }
      }
    } else if (task.isException) {
      dispatch({ type: 'DELETE_TASK', id: task.id });
    } else {
      dispatch({ type: 'DELETE_TASK', id: task.id });
    }

    onClose();
  }

  const showRecurringPrompt = mode === 'edit' && isRecurringEdit() && recurringAction === 'ask';

  return (
    <Modal
      onClose={onClose}
      title={mode === 'create' ? 'New Task' : 'Edit Task'}
    >
      {showRecurringPrompt ? (
        <div className={styles.recurringPrompt}>
          <p className={styles.promptText}>This is a recurring task. Which events do you want to change?</p>
          <div className={styles.promptBtns}>
            <button className={styles.promptBtn} onClick={() => setRecurringAction('single')}>
              This event only
            </button>
            <button className={styles.promptBtn} onClick={() => setRecurringAction('future')}>
              This and all future events
            </button>
          </div>
        </div>
      ) : (
        <form
          className={styles.form}
          onSubmit={e => { e.preventDefault(); handleSave(); }}
        >
          <div className={styles.field}>
            <label className={styles.label}>Title</label>
            <input
              className={styles.input}
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Task title"
              autoFocus
              required
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Description</label>
            <textarea
              className={styles.textarea}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Optional notes"
              rows={3}
            />
          </div>

          <div className={styles.twoCol}>
            <div className={styles.field}>
              <label className={styles.label}>Status</label>
              <select
                className={styles.select}
                value={status}
                onChange={e => setStatus(e.target.value as TaskStatus)}
              >
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Due Date</label>
              <input
                type="date"
                className={styles.input}
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                required
              />
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Assignees</label>
            <AssigneeSelector selectedIds={assigneeIds} onChange={setAssigneeIds} />
          </div>

          <div className={styles.field}>
            <RecurrenceEditor value={recurrence} onChange={setRecurrence} />
          </div>

          <div className={styles.actions}>
            {mode === 'edit' && (
              <button
                type="button"
                className={styles.deleteBtn}
                onClick={handleDelete}
              >
                Delete
              </button>
            )}
            <button type="button" className={styles.cancelBtn} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className={styles.saveBtn} disabled={!title.trim()}>
              {mode === 'create' ? 'Add Task' : 'Save'}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}
