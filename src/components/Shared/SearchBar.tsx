import { useState, useRef, useEffect, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import { Task, TaskInstance } from '../../context/types';
import styles from './SearchBar.module.css';

interface Props {
  onResultClick: (date: string, instance: TaskInstance) => void;
}

const STATUS_LABEL: Record<string, string> = {
  'todo': 'To Do',
  'in-progress': 'In Progress',
  'done': 'Done',
};

const STATUS_COLOR: Record<string, string> = {
  'todo': '#636366',
  'in-progress': '#0071e3',
  'done': '#34c759',
};

export default function SearchBar({ onResultClick }: Props) {
  const { state } = useApp();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const results = useCallback((): Task[] => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return state.tasks.filter(t =>
      !t.isException &&
      !t.isDeleted &&
      (t.title.toLowerCase().includes(q) ||
        (t.description ?? '').toLowerCase().includes(q))
    ).slice(0, 8);
  }, [query, state.tasks])();

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!open || results.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(i => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      selectTask(results[activeIndex]);
    } else if (e.key === 'Escape') {
      setOpen(false);
      inputRef.current?.blur();
    }
  }

  function selectTask(task: Task) {
    const instance: TaskInstance = { task, date: task.dueDate, isVirtual: false };
    onResultClick(task.dueDate, instance);
    setQuery('');
    setOpen(false);
  }

  function formatDate(dateStr: string): string {
    const [y, m, d] = dateStr.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  function initials(name: string): string {
    return name.split(' ').slice(0, 2).map(w => w[0]?.toUpperCase() ?? '').join('');
  }

  const showDropdown = open && query.trim().length > 0;

  return (
    <div className={styles.container} ref={containerRef}>
      <div className={styles.inputWrap}>
        <span className={styles.icon}>⌕</span>
        <input
          ref={inputRef}
          className={styles.input}
          placeholder="Search tasks…"
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          aria-label="Search tasks"
          aria-expanded={showDropdown}
          aria-autocomplete="list"
        />
        {query && (
          <button className={styles.clear} onClick={() => { setQuery(''); inputRef.current?.focus(); }}>
            ×
          </button>
        )}
      </div>

      {showDropdown && (
        <div className={styles.dropdown} role="listbox">
          {results.length === 0 ? (
            <div className={styles.empty}>No tasks found</div>
          ) : (
            results.map((task, i) => {
              const assignees = state.members.filter(m => task.assigneeIds.includes(m.id));
              return (
                <div
                  key={task.id}
                  className={`${styles.result} ${i === activeIndex ? styles.active : ''}`}
                  role="option"
                  aria-selected={i === activeIndex}
                  onMouseEnter={() => setActiveIndex(i)}
                  onMouseDown={e => { e.preventDefault(); selectTask(task); }}
                >
                  <span
                    className={styles.statusDot}
                    style={{ background: STATUS_COLOR[task.status] }}
                    title={STATUS_LABEL[task.status]}
                  />
                  <div className={styles.info}>
                    <span className={styles.title}>{task.title}</span>
                    <span className={styles.meta}>
                      {formatDate(task.dueDate)}
                      {task.recurrence && <span className={styles.recur}>↻</span>}
                    </span>
                  </div>
                  {assignees.length > 0 && (
                    <div className={styles.avatars}>
                      {assignees.slice(0, 3).map(m => (
                        <span
                          key={m.id}
                          className={styles.avatar}
                          style={{ background: m.color }}
                          title={m.name}
                        >
                          {initials(m.name)}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
