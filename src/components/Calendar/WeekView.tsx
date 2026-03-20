import { format, startOfWeek, endOfWeek } from 'date-fns';
import { useApp } from '../../context/AppContext';
import { getTaskInstancesForRange, groupByDate } from '../../utils/recurrenceUtils';
import { getWeekDays, DAY_NAMES, toDateString } from '../../utils/dateUtils';
import { TaskInstance } from '../../context/types';
import TaskChip from './TaskChip';
import styles from './WeekView.module.css';

interface Props {
  current: Date;
  onDayClick: (date: string) => void;
  onTaskClick: (instance: TaskInstance) => void;
}

export default function WeekView({ current, onDayClick, onTaskClick }: Props) {
  const { state } = useApp();
  const days = getWeekDays(current);
  const rangeStart = startOfWeek(current, { weekStartsOn: 0 });
  const rangeEnd = endOfWeek(current, { weekStartsOn: 0 });
  const instances = getTaskInstancesForRange(state.tasks, rangeStart, rangeEnd);
  const byDate = groupByDate(instances);
  const today = toDateString(new Date());

  return (
    <div className={styles.grid}>
      <div className={styles.header}>
        {days.map((day, i) => {
          const ds = toDateString(day);
          const isToday = ds === today;
          return (
            <div key={ds} className={styles.colHeader} onClick={() => onDayClick(ds)}>
              <span className={styles.dayName}>{DAY_NAMES[i]}</span>
              <span className={`${styles.dayNum} ${isToday ? styles.today : ''}`}>
                {format(day, 'd')}
              </span>
            </div>
          );
        })}
      </div>
      <div className={styles.body}>
        {days.map((day, i) => {
          const ds = toDateString(day);
          const dayInstances = byDate[ds] ?? [];
          const isToday = ds === today;
          return (
            <div
              key={ds}
              className={`${styles.col} ${isToday ? styles.todayCol : ''}`}
              onClick={() => onDayClick(ds)}
            >
              {dayInstances.map((inst, j) => (
                <TaskChip key={`${inst.task.id}-${j}`} instance={inst} onClick={onTaskClick} />
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
