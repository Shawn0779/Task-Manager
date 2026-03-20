import { useState } from 'react';
import { format } from 'date-fns';
import { AppProvider } from './context/AppContext';
import { TaskInstance } from './context/types';
import TeamPanel from './components/Team/TeamPanel';
import Calendar from './components/Calendar/Calendar';
import SearchBar from './components/Shared/SearchBar';
import TaskModal from './components/Tasks/TaskModal';
import styles from './App.module.css';

export default function App() {
  const [jumpTo, setJumpTo] = useState<{ date: string; instance: TaskInstance } | null>(null);
  const [addingTask, setAddingTask] = useState(false);

  return (
    <AppProvider>
      <div className={styles.layout}>
        <header className={styles.appHeader}>
          <span className={styles.appTitle}>Task Manager</span>
          <SearchBar onResultClick={(date, instance) => setJumpTo({ date, instance })} />
          <button className={styles.addTaskBtn} onClick={() => setAddingTask(true)}>
            + Add Task
          </button>
        </header>
        <div className={styles.main}>
          <TeamPanel />
          <Calendar jumpTo={jumpTo} onJumpConsumed={() => setJumpTo(null)} />
        </div>
      </div>

      {addingTask && (
        <TaskModal
          defaultDate={format(new Date(), 'yyyy-MM-dd')}
          onClose={() => setAddingTask(false)}
        />
      )}
    </AppProvider>
  );
}
