import { useState, useEffect } from 'react';
import { parseISO } from 'date-fns';
import { CalendarView, TaskInstance } from '../../context/types';
import CalendarHeader from './CalendarHeader';
import MonthView from './MonthView';
import WeekView from './WeekView';
import DayView from './DayView';
import TaskModal from '../Tasks/TaskModal';
import styles from './Calendar.module.css';

interface Props {
  jumpTo?: { date: string; instance: TaskInstance } | null;
  onJumpConsumed: () => void;
}

export default function Calendar({ jumpTo, onJumpConsumed }: Props) {
  const [view, setView] = useState<CalendarView>('month');
  const [current, setCurrent] = useState<Date>(new Date());

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedInstance, setSelectedInstance] = useState<TaskInstance | undefined>();
  const [newTaskDate, setNewTaskDate] = useState<string | undefined>();

  useEffect(() => {
    if (!jumpTo) return;
    setCurrent(parseISO(jumpTo.date));
    setView('month');
    openEdit(jumpTo.instance);
    onJumpConsumed();
  }, [jumpTo]);

  function openCreate(date: string) {
    setSelectedInstance(undefined);
    setNewTaskDate(date);
    setModalOpen(true);
  }

  function openEdit(instance: TaskInstance) {
    setSelectedInstance(instance);
    setNewTaskDate(undefined);
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setSelectedInstance(undefined);
    setNewTaskDate(undefined);
  }

  return (
    <div className={styles.wrapper}>
      <CalendarHeader
        view={view}
        current={current}
        onViewChange={setView}
        onDateChange={setCurrent}
      />

      <div className={styles.body}>
        {view === 'month' && (
          <MonthView
            current={current}
            onDayClick={openCreate}
            onTaskClick={openEdit}
          />
        )}
        {view === 'week' && (
          <WeekView
            current={current}
            onDayClick={openCreate}
            onTaskClick={openEdit}
          />
        )}
        {view === 'day' && (
          <DayView
            current={current}
            onAddTask={openCreate}
            onTaskClick={openEdit}
          />
        )}
      </div>

      {modalOpen && (
        <TaskModal
          instance={selectedInstance}
          defaultDate={newTaskDate}
          onClose={closeModal}
        />
      )}
    </div>
  );
}
