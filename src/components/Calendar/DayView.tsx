import { useApp } from '../../context/AppContext';
import { getTaskInstancesForRange } from '../../utils/recurrenceUtils';
import { formatDayFull, toDateString } from '../../utils/dateUtils';
import { TaskInstance } from '../../context/types';
import TaskChip from './TaskChip';
import styles from './DayView.module.css';

interface Props {
  current: Date;
  onAddTask: (date: string) => void;
  onTaskClick: (instance: TaskInstance) => void;
}

export default function DayView({ current, onAddTask, onTaskClick }: Props) {
  const { state } = useApp();
  const ds = toDateString(current);
  const instances = getTaskInstancesForRange(state.tasks, current, current);
  const today = toDateString(new Date());
  const isToday = ds === today;

  return (
    <div className={styles.wrapper}>
      <div className={`${styles.dateHeading} ${isToday ? styles.today : ''}`}>
        <span className={styles.label}>{formatDayFull(current)}</span>
        {isToday && <span className={styles.todayBadge}>Today</span>}
      </div>

      <div className={styles.body} onClick={() => onAddTask(ds)}>
        {instances.length === 0 ? (
          <p className={styles.empty}>No tasks — click to add one</p>
        ) : (
          <div className={styles.tasks} onClick={e => e.stopPropagation()}>
            {instances.map((inst, i) => (
              <TaskChip key={`${inst.task.id}-${i}`} instance={inst} onClick={onTaskClick} />
            ))}
            <div
              className={styles.addMore}
              onClick={e => { e.stopPropagation(); onAddTask(ds); }}
            >
              + Add task
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
