export interface Task {
    id: string;
    text: string;
    completed: boolean;
    createdAt: number;
    scheduledDate?: string; // Format: 'YYYY-MM-DD'
    scheduledTime?: string; // Format: 'HH:mm'
}
