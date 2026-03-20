import { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { TeamMember } from '../../context/types';
import ColorPicker from '../Shared/ColorPicker';
import styles from './TeamMemberRow.module.css';

interface Props {
  member: TeamMember;
}

export default function TeamMemberRow({ member }: Props) {
  const { dispatch } = useApp();
  const [pickerOpen, setPickerOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  function initials(name: string): string {
    return name
      .split(' ')
      .slice(0, 2)
      .map(w => w[0]?.toUpperCase() ?? '')
      .join('');
  }

  function handleColorChange(color: string) {
    dispatch({ type: 'UPDATE_MEMBER', member: { ...member, color } });
    setPickerOpen(false);
  }

  // Close popover on outside click
  useEffect(() => {
    if (!pickerOpen) return;
    function onDown(e: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setPickerOpen(false);
      }
    }
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [pickerOpen]);

  return (
    <li className={styles.row}>
      <div className={styles.avatarWrap} ref={popoverRef}>
        <button
          className={styles.avatarBtn}
          style={{ background: member.color }}
          onClick={() => setPickerOpen(v => !v)}
          title="Click to change color"
          aria-label={`Change color for ${member.name}`}
        >
          {initials(member.name)}
          <span className={styles.editHint}>✎</span>
        </button>

        {pickerOpen && (
          <div className={styles.popover}>
            <ColorPicker value={member.color} onChange={handleColorChange} />
          </div>
        )}
      </div>

      <span className={styles.name}>{member.name}</span>

      <button
        className={styles.removeBtn}
        onClick={() => dispatch({ type: 'REMOVE_MEMBER', id: member.id })}
        aria-label={`Remove ${member.name}`}
      >
        ×
      </button>
    </li>
  );
}
