import { CalendarView } from '../../context/types';
import { formatMonthYear, formatWeekRange, formatDayFull, addMonths, subMonths, addWeeks, subWeeks, addDays, subDays } from '../../utils/dateUtils';
import styles from './CalendarHeader.module.css';

interface Props {
  view: CalendarView;
  current: Date;
  onViewChange: (v: CalendarView) => void;
  onDateChange: (d: Date) => void;
}

const VIEWS: CalendarView[] = ['day', 'week', 'month'];
const VIEW_LABELS: Record<CalendarView, string> = { month: 'Month', week: 'Week', day: 'Day' };

function getLabel(view: CalendarView, date: Date): string {
  switch (view) {
    case 'month': return formatMonthYear(date);
    case 'week': return formatWeekRange(date);
    case 'day': return formatDayFull(date);
  }
}

function prev(view: CalendarView, date: Date): Date {
  switch (view) {
    case 'month': return subMonths(date, 1);
    case 'week': return subWeeks(date, 1);
    case 'day': return subDays(date, 1);
  }
}

function next(view: CalendarView, date: Date): Date {
  switch (view) {
    case 'month': return addMonths(date, 1);
    case 'week': return addWeeks(date, 1);
    case 'day': return addDays(date, 1);
  }
}

export default function CalendarHeader({ view, current, onViewChange, onDateChange }: Props) {
  return (
    <div className={styles.header}>
      <div className={styles.navGroup}>
        <button className={styles.navBtn} onClick={() => onDateChange(prev(view, current))}>‹</button>
        <button className={styles.todayBtn} onClick={() => onDateChange(new Date())}>Today</button>
        <button className={styles.navBtn} onClick={() => onDateChange(next(view, current))}>›</button>
      </div>

      <span className={styles.label}>{getLabel(view, current)}</span>

      <div className={styles.viewGroup}>
        {VIEWS.map(v => (
          <button
            key={v}
            className={`${styles.viewBtn} ${view === v ? styles.active : ''}`}
            onClick={() => onViewChange(v)}
          >
            {VIEW_LABELS[v]}
          </button>
        ))}
      </div>
    </div>
  );
}
