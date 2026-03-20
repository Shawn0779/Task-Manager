import { useState } from 'react';
import styles from './ColorPicker.module.css';

export const APPLE_COLORS = [
  { name: 'Red',      value: '#FF3B30' },
  { name: 'Orange',   value: '#FF9500' },
  { name: 'Yellow',   value: '#FFCC00' },
  { name: 'Green',    value: '#34C759' },
  { name: 'Mint',     value: '#00C7BE' },
  { name: 'Teal',     value: '#30B0C7' },
  { name: 'Blue',     value: '#007AFF' },
  { name: 'Indigo',   value: '#5856D6' },
  { name: 'Purple',   value: '#AF52DE' },
  { name: 'Pink',     value: '#FF2D55' },
  { name: 'Brown',    value: '#A2845E' },
  { name: 'Graphite', value: '#8E8E93' },
];

interface Props {
  value: string;
  onChange: (color: string) => void;
}

export default function ColorPicker({ value, onChange }: Props) {
  const [hovered, setHovered] = useState<string | null>(null);

  const activeColor = APPLE_COLORS.find(c => c.value === (hovered ?? value));

  return (
    <div className={styles.wrapper}>
      <div className={styles.grid} role="radiogroup" aria-label="Color">
        {APPLE_COLORS.map(c => (
          <button
            key={c.value}
            type="button"
            className={`${styles.swatch} ${value === c.value ? styles.selected : ''}`}
            style={{ background: c.value }}
            onClick={() => onChange(c.value)}
            onMouseEnter={() => setHovered(c.value)}
            onMouseLeave={() => setHovered(null)}
            aria-label={c.name}
            aria-pressed={value === c.value}
          />
        ))}
      </div>
      <div className={styles.label} style={{ color: hovered ?? value }}>
        {activeColor?.name ?? ''}
      </div>
    </div>
  );
}
