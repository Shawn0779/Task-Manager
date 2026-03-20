import { RecurrenceFrequency, RecurrenceRule } from '../../context/types';
import styles from './RecurrenceEditor.module.css';

interface Props {
  value: RecurrenceRule | undefined;
  onChange: (rule: RecurrenceRule | undefined) => void;
}

export default function RecurrenceEditor({ value, onChange }: Props) {
  const enabled = !!value;

  function toggle() {
    if (enabled) {
      onChange(undefined);
    } else {
      onChange({ frequency: 'weekly', interval: 1 });
    }
  }

  function update(patch: Partial<RecurrenceRule>) {
    if (!value) return;
    onChange({ ...value, ...patch });
  }

  return (
    <div className={styles.wrapper}>
      <label className={styles.toggle}>
        <input type="checkbox" checked={enabled} onChange={toggle} />
        <span>Repeat</span>
      </label>

      {enabled && value && (
        <div className={styles.controls}>
          <div className={styles.row}>
            <label className={styles.label}>Frequency</label>
            <select
              className={styles.select}
              value={value.frequency}
              onChange={e => update({ frequency: e.target.value as RecurrenceFrequency })}
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>

          <div className={styles.row}>
            <label className={styles.label}>Every</label>
            <input
              type="number"
              min={1}
              max={99}
              className={styles.numInput}
              value={value.interval}
              onChange={e => update({ interval: Math.max(1, parseInt(e.target.value) || 1) })}
            />
            <span className={styles.unit}>
              {value.frequency === 'daily' ? 'day(s)' : value.frequency === 'weekly' ? 'week(s)' : 'month(s)'}
            </span>
          </div>

          <div className={styles.row}>
            <label className={styles.label}>Ends</label>
            <input
              type="date"
              className={styles.dateInput}
              value={value.endDate ?? ''}
              onChange={e => update({ endDate: e.target.value || undefined })}
            />
            {value.endDate && (
              <button className={styles.clearEnd} onClick={() => update({ endDate: undefined })}>
                Clear
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
