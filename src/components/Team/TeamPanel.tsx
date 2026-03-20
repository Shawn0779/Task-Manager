import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import TeamMemberRow from './TeamMemberRow';
import ColorPicker, { APPLE_COLORS } from '../Shared/ColorPicker';
import styles from './TeamPanel.module.css';

export default function TeamPanel() {
  const { state, dispatch } = useApp();
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState('');
  const [color, setColor] = useState(APPLE_COLORS[6].value); // Blue default

  function handleAdd() {
    if (!name.trim()) return;
    dispatch({
      type: 'ADD_MEMBER',
      member: {
        id: crypto.randomUUID(),
        name: name.trim(),
        email: '',
        color,
      },
    });
    setName('');
    setColor(APPLE_COLORS[6].value);
    setAdding(false);
  }

  return (
    <aside className={styles.panel}>
      <div className={styles.heading}>
        <span style={{ textTransform: 'none' }}>Kinjal's Team</span>
        <button className={styles.addBtn} onClick={() => setAdding(v => !v)} aria-label="Add member">
          {adding ? '×' : '+'}
        </button>
      </div>

      {adding && (
        <div className={styles.form}>
          <input
            className={styles.input}
            placeholder="Name"
            value={name}
            onChange={e => setName(e.target.value)}
            autoFocus
          />
          <div className={styles.colorSection}>
            <span className={styles.colorLabel}>Color</span>
            <ColorPicker value={color} onChange={setColor} />
          </div>
          <button className={styles.saveBtn} onClick={handleAdd} disabled={!name.trim()}>
            Add
          </button>
        </div>
      )}

      <ul className={styles.list}>
        {state.members.map(member => (
          <TeamMemberRow key={member.id} member={member} />
        ))}
        {state.members.length === 0 && !adding && (
          <li className={styles.empty}>No team members yet</li>
        )}
      </ul>
    </aside>
  );
}
