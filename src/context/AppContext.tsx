import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { Task, TeamMember } from './types';

interface AppState {
  tasks: Task[];
  members: TeamMember[];
}

type Action =
  | { type: 'ADD_TASK'; task: Task }
  | { type: 'UPDATE_TASK'; task: Task }
  | { type: 'DELETE_TASK'; id: string }
  | { type: 'ADD_MEMBER'; member: TeamMember }
  | { type: 'UPDATE_MEMBER'; member: TeamMember }
  | { type: 'REMOVE_MEMBER'; id: string }
  | { type: 'LOAD_STATE'; state: AppState };

const TASKS_KEY = 'officeTasker_tasks';
const MEMBERS_KEY = 'officeTasker_members';

function loadInitialState(): AppState {
  try {
    const tasks = localStorage.getItem(TASKS_KEY);
    const members = localStorage.getItem(MEMBERS_KEY);
    return {
      tasks: tasks ? JSON.parse(tasks) : [],
      members: members ? JSON.parse(members) : [],
    };
  } catch {
    return { tasks: [], members: [] };
  }
}

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'ADD_TASK':
      return { ...state, tasks: [...state.tasks, action.task] };
    case 'UPDATE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(t => (t.id === action.task.id ? action.task : t)),
      };
    case 'DELETE_TASK':
      return { ...state, tasks: state.tasks.filter(t => t.id !== action.id) };
    case 'ADD_MEMBER':
      return { ...state, members: [...state.members, action.member] };
    case 'UPDATE_MEMBER':
      return { ...state, members: state.members.map(m => (m.id === action.member.id ? action.member : m)) };
    case 'REMOVE_MEMBER':
      return { ...state, members: state.members.filter(m => m.id !== action.id) };
    case 'LOAD_STATE':
      return action.state;
    default:
      return state;
  }
}

interface AppContextValue {
  state: AppState;
  dispatch: React.Dispatch<Action>;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadInitialState);

  useEffect(() => {
    localStorage.setItem(TASKS_KEY, JSON.stringify(state.tasks));
  }, [state.tasks]);

  useEffect(() => {
    localStorage.setItem(MEMBERS_KEY, JSON.stringify(state.members));
  }, [state.members]);

  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
