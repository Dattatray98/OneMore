export interface Task {
    id: string;
    text: string;
    completed: boolean;
    createdAt: number;
    scheduledDate?: string; // Format: 'YYYY-MM-DD'
    scheduledTime?: string; // Format: 'HH:mm'
    isProtocol?: boolean;
    protocolIdx?: number;
}

export interface HistoryRecord {
    id: string;
    type: 'add' | 'edit' | 'delete' | 'toggle';
    taskId: string;
    taskText: string;
    timestamp: number;
    details?: string;
}

export interface Challenge {
    id: string;
    title: string;
    description?: string;
    dailyRoutine: {
        id: string;
        text: string;
        time?: string;
    }[];
    days: number;
    startDate: string;
    completedDays: number[];
    dailyProgress: Record<number, boolean[]>;
    dailyOverrides?: Record<number, Record<number, { text?: string; time?: string }>>;
    refreshTime: string;
    history: HistoryRecord[];
}
