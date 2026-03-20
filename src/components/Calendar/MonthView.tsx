import { format, isSameMonth, startOfMonth, endOfMonth, startOfWeek, endOfWeek } from 'date-fns';
import { useApp } from '../../context/AppContext';
import { getTaskInstancesForRange, groupByDate } from '../../utils/recurrenceUtils';
import { getMonthGrid, DAY_NAMES, toDateString } from '../../utils/dateUtils';
import { TaskInstance } from '../../context/types';
import TaskChip from './TaskChip';
import styles from './MonthView.module.css';

interface Props {
  current: Date;
  onDayClick: (date: string) => void;
  onTaskClick: (instance: TaskInstance) => void;
}

export default function MonthView({ current, onDayClick, onTaskClick }: Props) {
  const { state } = useApp();

  const rangeStart = startOfWeek(startOfMonth(current), { weekStartsOn: 0 });
  const rangeEnd = endOfWeek(endOfMonth(current), { weekStartsOn: 0 });
  const instances = getTaskInstancesForRange(state.tasks, rangeStart, rangeEnd);
  const byDate = groupByDate(instances);
  const weeks = getMonthGrid(current);
  const today = toDateString(new Date());

  return (
    <div className={styles.grid}>
      <div className={styles.dayNames}>
        {DAY_NAMES.map(d => (
          <div key={d} className={styles.dayName}>{d}</div>
        ))}
      </div>
      <div className={styles.weeks}>
        {weeks.map((week, wi) => (
          <div key={wi} className={styles.week}>
            {week.map(day => {
              const ds = toDateString(day);
              const dayInstances = byDate[ds] ?? [];
              const isToday = ds === today;
              const otherMonth = !isSameMonth(day, current);

              return (
                <div
                  key={ds}
                  className={`${styles.cell} ${otherMonth ? styles.otherMonth : ''}`}
                  onClick={() => onDayClick(ds)}
                >
                  <span className={`${styles.dayNum} ${isToday ? styles.today : ''}`}>
                    {format(day, 'd')}
                  </span>
                  <div className={styles.tasks}>
                    {dayInstances.map((inst, i) => (
                      <TaskChip key={`${inst.task.id}-${i}`} instance={inst} onClick={onTaskClick} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
