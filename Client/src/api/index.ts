export * from './client';
export * from './taskApi';
export * from './challengeApi';
export * from './pomodoroApi';

import { taskApi } from './taskApi';
import { challengeApi } from './challengeApi';
import { pomodoroApi } from './pomodoroApi';

// Backward compatibility object
export const api = {
    ...taskApi,
    ...challengeApi,
    getPomodoroStats: pomodoroApi.getStats,
    getAllPomodoroStats: pomodoroApi.getAllStats,
    savePomodoroStats: pomodoroApi.saveStats,
    clearPomodoroHistory: pomodoroApi.clearHistory,
};
