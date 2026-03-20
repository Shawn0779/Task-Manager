import { useApp } from '../../context/AppContext';
import { TeamMember } from '../../context/types';
import styles from './AssigneeSelector.module.css';

interface Props {
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}

export default function AssigneeSelector({ selectedIds, onChange }: Props) {
  const { state } = useApp();

  function toggle(id: string) {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter(x => x !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  }

  function initials(name: string): string {
    return name
      .split(' ')
      .slice(0, 2)
      .map(w => w[0]?.toUpperCase() ?? '')
      .join('');
  }

  if (state.members.length === 0) {
    return <p className={styles.empty}>Add team members first</p>;
  }

  return (
    <div className={styles.list}>
      {state.members.map(m => {
        const selected = selectedIds.includes(m.id);
        return (
          <button
            key={m.id}
            type="button"
            className={`${styles.chip} ${selected ? styles.selected : ''}`}
            onClick={() => toggle(m.id)}
          >
            <span className={styles.avatar} style={{ background: m.color }}>
              {initials(m.name)}
            </span>
            <span className={styles.name}>{m.name}</span>
            {selected && <span className={styles.check}>✓</span>}
          </button>
        );
      })}
    </div>
  );
}
