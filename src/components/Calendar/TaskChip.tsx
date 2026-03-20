import { TaskInstance } from '../../context/types';
import { useApp } from '../../context/AppContext';
import styles from './TaskChip.module.css';

interface Props {
  instance: TaskInstance;
  onClick: (instance: TaskInstance) => void;
}

const STATUS_COLORS: Record<string, string> = {
  todo: '#636366',
  'in-progress': '#0071e3',
  done: '#34c759',
};

export default function TaskChip({ instance, onClick }: Props) {
  const { state } = useApp();
  const { task } = instance;

  const assignees = state.members.filter(m => task.assigneeIds.includes(m.id));

  return (
    <button
      className={`${styles.chip} ${styles[task.status.replace('-', '_')]}`}
      onClick={e => { e.stopPropagation(); onClick(instance); }}
      title={task.title}
    >
      <span
        className={styles.dot}
        style={{ background: STATUS_COLORS[task.status] ?? '#636366' }}
      />
      <span className={styles.title}>{task.title}</span>
      {assignees.length > 0 && (
        <span className={styles.avatars}>
          {assignees.slice(0, 3).map(m => (
            <span
              key={m.id}
              className={styles.avatar}
              style={{ background: m.color }}
              title={m.name}
            >
              {m.name[0]?.toUpperCase()}
            </span>
          ))}
          {assignees.length > 3 && (
            <span className={styles.more}>+{assignees.length - 3}</span>
          )}
        </span>
      )}
    </button>
  );
}
