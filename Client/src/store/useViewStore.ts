import { create } from 'zustand';
import type { Task } from '../types/index';

type ViewType = 'my-day' | 'pomodoro' | 'planned' | 'disciplined' | 'settings' | 'important' | 'notes';

interface ViewState {
    currentView: ViewType;
    pomodoroAutoImport: 'my-day' | 'protocol' | 'direct' | null;
    pomodoroDirectTasks: Task[];
    
    // Actions
    setCurrentView: (view: ViewType) => void;
    setPomodoroImport: (type: 'my-day' | 'protocol' | 'direct' | null, tasks?: Task[]) => void;
}

export const useViewStore = create<ViewState>((set) => ({
    currentView: (localStorage.getItem('current_view') as ViewType) || 'my-day',
    pomodoroAutoImport: null,
    pomodoroDirectTasks: [],

    setCurrentView: (currentView) => {
        localStorage.setItem('current_view', currentView);
        set({ currentView });
    },
    
    setPomodoroImport: (type, tasks = []) => set({ 
        pomodoroAutoImport: type, 
        pomodoroDirectTasks: tasks 
    }),
}));
