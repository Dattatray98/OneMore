import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Target, CheckCircle2, ListTodo, Settings } from 'lucide-react';
import { pomodoroApi } from '../api/index';
import type { Task, Challenge } from '../types/index';
import { differenceInDays, parseISO, format } from 'date-fns';
import { generateId } from '../utils/id';

import { FocusAnalyzer } from '../features/pomodoro/components/FocusAnalyzer';
import { ImportTasksModal } from '../features/pomodoro/components/ImportTasksModal';
import { PomodoroSequence } from '../features/pomodoro/components/PomodoroSequence';
import { TimerSettingsModal } from '../features/pomodoro/components/TimerSettingsModal';
import { useViewStore } from '../store/useViewStore';

interface PomodoroViewProps {
    tasks: Task[];
    activeChallenge: Challenge | null;
    onToggleTask: (id: string) => void;
    onUpdateTask: (id: string, updates: Partial<Task>) => void;
    onAddTask: (task: Partial<Task>) => void;
    onUpdateChallenge?: (challenge: Challenge | null, idToDelete?: string) => void;
}

export const PomodoroPage: React.FC<PomodoroViewProps> = ({ tasks, activeChallenge, onToggleTask, onUpdateTask, onAddTask, onUpdateChallenge }) => {
    const { pomodoroAutoImport: initialAutoImport, pomodoroDirectTasks: directImportTasks } = useViewStore();
    const [mode, setMode] = useState<'work' | 'shortBreak' | 'longBreak'>('work');
    const [timeLeft, setTimeLeft] = useState(25 * 60);
    const [isActive, setIsActive] = useState(false);
    const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
    const [sessionCount, setSessionCount] = useState(0);

    const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
    const [editValue, setEditValue] = useState('');
    const [editTime, setEditTime] = useState('');
    const [statsUpdateTrigger, setStatsUpdateTrigger] = useState(0);

    // Live Date Management (Auto-reset at midnight)
    const [todayStr, setTodayStr] = useState(format(new Date(), 'yyyy-MM-dd'));
    useEffect(() => {
        const interval = setInterval(() => {
            const now = format(new Date(), 'yyyy-MM-dd');
            if (now !== todayStr) {
                setTodayStr(now);
            }
        }, 1000 * 60); // Check every minute
        return () => clearInterval(interval);
    }, [todayStr]);

    const [showSettings, setShowSettings] = useState(false);
    const [durations, setDurations] = useState({
        work: 25,
        shortBreak: 5,
        longBreak: 15
    });
    const [settings, setSettings] = useState({
        autoStartBreak: true,
        autoStartWork: false
    });

    // Time Stats
    const [dailyStats, setDailyStats] = useState({ workSecs: 0, breakSecs: 0 });
    const [allHistory, setAllHistory] = useState<any[]>([]);

    useEffect(() => {
        const loadPomodoroData = async () => {
            const stats = await pomodoroApi.getStats(todayStr);
            const history = await pomodoroApi.getAllStats();

            setDailyStats({ workSecs: stats.workSecs || 0, breakSecs: stats.breakSecs || 0 });
            setSessionCount(stats.sessionCount || 0);
            setOrderedTasks(stats.sequence || []);
            setAllHistory(Array.isArray(history) ? history : []);
        };
        loadPomodoroData();
    }, [todayStr, statsUpdateTrigger]);

    // Load Settings (Still in localStorage is fine as it's 'necessary' config)
    useEffect(() => {
        const savedSettings = localStorage.getItem('pomodoro_settings');
        if (savedSettings) {
            setSettings(JSON.parse(savedSettings));
        }
    }, [todayStr, statsUpdateTrigger]);

    // Temp Settings for Modal
    const [tempSettings, setTempSettings] = useState(settings);

    const incrementSessionCount = async () => {
        setSessionCount(prev => {
            const newCount = prev + 1;
            pomodoroApi.saveStats(todayStr, { ...dailyStats, sessionCount: newCount, sequence: orderedTasks });
            return newCount;
        });
        setStatsUpdateTrigger(prev => prev + 1);
    };

    const updateDailyStats = async (type: 'work' | 'break', seconds: number, forceSessionCount?: number) => {
        setDailyStats(prev => {
            const newStats = {
                ...prev,
                [type === 'work' ? 'workSecs' : 'breakSecs']: prev[type === 'work' ? 'workSecs' : 'breakSecs'] + seconds
            };
            const currentSessionCount = forceSessionCount !== undefined ? forceSessionCount : sessionCount;
            pomodoroApi.saveStats(todayStr, { ...newStats, sessionCount: currentSessionCount, sequence: orderedTasks });
            return newStats;
        });
    };

    const clearAllStats = async () => {
        await pomodoroApi.clearHistory();
        setDailyStats({ workSecs: 0, breakSecs: 0 });
        setSessionCount(0);
        setAllHistory([]);
        setStatsUpdateTrigger(prev => prev + 1);
    };

    const [tempDurations, setTempDurations] = useState(durations);

    // Save durations to local storage? Optional but good UX.
    useEffect(() => {
        const saved = localStorage.getItem('pomodoro_durations');
        if (saved) {
            setDurations(JSON.parse(saved));
        }
    }, []);

    const openSettings = () => {
        setTempDurations(durations);
        setTempSettings(settings); // Sync temp with actual
        setShowSettings(true);
    };

    const handleTempDurationChange = (key: keyof typeof durations, val: string) => {
        const numVal = parseInt(val);
        setTempDurations(prev => ({ ...prev, [key]: isNaN(numVal) ? 0 : numVal }));
    };

    const saveSettings = () => {
        const finalDurations = {
            work: tempDurations.work || 25,
            shortBreak: tempDurations.shortBreak || 5,
            longBreak: tempDurations.longBreak || 15
        };

        setDurations(finalDurations);
        setSettings(tempSettings);
        localStorage.setItem('pomodoro_durations', JSON.stringify(finalDurations));
        localStorage.setItem('pomodoro_settings', JSON.stringify(tempSettings));

        if (!isActive && mode in finalDurations) {
            setTimeLeft(finalDurations[mode as keyof typeof finalDurations] * 60);
        }
        setShowSettings(false);
    };

    const resetDefaults = () => {
        setTempDurations({ work: 25, shortBreak: 5, longBreak: 15 });
        setTempSettings({ autoStartBreak: true, autoStartWork: false });
    };

    // Optimized Timer Logic (Avoids drift and per-second re-renders of the effect)
    useEffect(() => {
        let interval: any = null;

        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            setIsActive(false);
            if (interval) clearInterval(interval);

            // Notify user
            try {
                const audio = new Audio('https://actions.google.com/sounds/v1/alarms/beep_short.ogg');
                audio.play().catch(() => { }); // Catch browser auto-play blocks
            } catch (e) { }

            if (mode === 'work') {
                const nextSessionCount = sessionCount + 1;

                // Update everything in one go to ensure data integrity
                setSessionCount(nextSessionCount);
                updateDailyStats('work', durations.work * 60, nextSessionCount);

                setStatsUpdateTrigger(prev => prev + 1);

                if (nextSessionCount % 4 === 0) {
                    setMode('longBreak');
                    setTimeLeft(durations.longBreak * 60);
                } else {
                    setMode('shortBreak');
                    setTimeLeft(durations.shortBreak * 60);
                }
                setIsActive(settings.autoStartBreak);
            } else {
                updateDailyStats('break', (mode === 'shortBreak' ? durations.shortBreak : durations.longBreak) * 60);
                setMode('work');
                setTimeLeft(durations.work * 60);
                setIsActive(settings.autoStartWork);
            }
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isActive, timeLeft === 0, mode, durations, settings]);

    const toggleTimer = () => setIsActive(!isActive);

    const captureProgress = () => {
        const totalSeconds = durations[mode] * 60;
        const elapsedSeconds = totalSeconds - timeLeft;

        if (elapsedSeconds > 0) {
            updateDailyStats(mode === 'work' ? 'work' : 'break', elapsedSeconds);
        }
    };

    const handleManualSwitch = (newMode: 'work' | 'shortBreak' | 'longBreak') => {
        if (mode === newMode) return;

        // Capture progress before switching
        captureProgress();

        setMode(newMode);
        setTimeLeft(durations[newMode] * 60);
        setIsActive(false);
    };

    const resetTimer = () => {
        // Capture progress on reset/stop if timer was running or partially complete
        captureProgress();

        setIsActive(false);
        setTimeLeft(durations[mode] * 60);
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Unified Sequence State (Persistent)
    const [orderedTasks, setOrderedTasks] = useState<(Task & { isProtocol?: boolean })[]>(() => {
        const key = `pomodoro_sequence_${todayStr}`;
        const saved = localStorage.getItem(key);
        return saved ? JSON.parse(saved) : [];
    });

    // Sync Sequence with Global Tasks (only status updates)
    useEffect(() => {
        setOrderedTasks(prev => {
            return prev.map(t => {
                // Sync Regular Tasks
                const fresh = (Array.isArray(tasks) ? tasks : []).find(pt => pt.id === t.id);
                if (fresh) {
                    return { ...t, completed: fresh.completed, text: fresh.text, scheduledTime: fresh.scheduledTime };
                }

                // Sync Protocol Tasks
                if (t.isProtocol && t.id.startsWith('protocol-') && activeChallenge) {
                    const idx = parseInt(t.id.split('-')[1]);
                    const today = new Date();
                    const diff = differenceInDays(today, parseISO(activeChallenge.startDate)) + 1;
                    const isCompleted = activeChallenge.dailyProgress?.[diff]?.[idx] || false;

                    if (t.completed !== isCompleted) {
                        return { ...t, completed: isCompleted };
                    }
                }
                return t;
            });
        });
    }, [tasks, activeChallenge]);

    const handleToggleLocal = (id: string) => {
        if (id.startsWith('protocol-')) {
            if (activeChallenge && onUpdateChallenge) {
                const idx = parseInt(id.split('-')[1]);
                const today = new Date();
                const diff = differenceInDays(today, parseISO(activeChallenge.startDate)) + 1;

                const newProgress = { ...activeChallenge.dailyProgress };
                // Ensure we clone the specific day's array to avoid mutation
                const dayProgress = newProgress[diff] ? [...newProgress[diff]] : [];
                newProgress[diff] = dayProgress;

                const currentVal = dayProgress[idx] || false;
                dayProgress[idx] = !currentVal;

                onUpdateChallenge({
                    ...activeChallenge,
                    dailyProgress: newProgress
                });
            }
        } else {
            onToggleTask(id);
        }
    };

    // Save to DB
    useEffect(() => {
        const syncSequence = async () => {
            if (Array.isArray(orderedTasks) && orderedTasks.length > 0) {
                await pomodoroApi.saveStats(todayStr, { ...dailyStats, sessionCount, sequence: orderedTasks });
            }
        };
        syncSequence();
    }, [orderedTasks, todayStr]);

    // Import Logic with Selection
    const [importModal, setImportModal] = useState<'source-select' | 'my-day' | 'protocol' | null>(null);
    const [importCandidates, setImportCandidates] = useState<(Task & { isProtocol?: boolean })[]>([]);
    const [selectedImportIds, setSelectedImportIds] = useState<Set<string>>(new Set());

    const handleSelectSource = (source: 'my-day' | 'protocol' | 'direct') => {
        if (source === 'direct') {
            if (!directImportTasks || directImportTasks.length === 0) return;
            // Filter out tasks already in sequence
            const existingIds = new Set((Array.isArray(orderedTasks) ? orderedTasks : []).map(t => t.id));
            const newCandidates = directImportTasks.filter(t => !existingIds.has(t.id) && !t.completed);

            if (newCandidates.length === 0) return;

            setImportCandidates(newCandidates);
            setSelectedImportIds(new Set(newCandidates.map(t => t.id)));
            setImportModal('source-select'); // Reuse modal state or create new one?
            // Actually 'source-select' is typically the *list* view.
            // Let's call it 'my-day' just to show the list using the generic list renderer, or add 'direct' view to modal.
            // The modal rendering logic below (lines ~760) checks `importModal === 'my-day' || importModal === 'protocol'`.
            // I should use 'my-day' mode or add 'direct'. 'my-day' just means "list of candidates".
            // Let's use 'my-day' visual style for direct import list.
            setImportModal('my-day');
            return;
        }

        if (source === 'protocol') {
            if (!activeChallenge) return;

            const today = new Date();
            const diff = differenceInDays(today, parseISO(activeChallenge.startDate)) + 1;

            if (diff >= 1 && diff <= activeChallenge.days) {
                const todayProtocolTasks = activeChallenge.dailyRoutine.map((item, idx) => {
                    const isDone = activeChallenge.dailyProgress[diff]?.[idx] || false;
                    if (isDone) return null;
                    const override = activeChallenge.dailyOverrides?.[diff]?.[idx];
                    return {
                        id: `protocol-${idx}`,
                        text: override?.text || item.text,
                        completed: false,
                        isProtocol: true,
                        scheduledTime: override?.time || item.time
                    } as any;
                }).filter(Boolean);

                const newCandidates = todayProtocolTasks.filter(p => !(Array.isArray(orderedTasks) ? orderedTasks : []).some(existing => existing.id === p.id));
                setImportCandidates(newCandidates);
                setSelectedImportIds(new Set(newCandidates.map(c => c.id)));
                setImportModal('protocol');
            }
        } else if (source === 'my-day') {
            const myDayTasks = (Array.isArray(tasks) ? tasks : []).filter(t => t.scheduledDate === todayStr && !t.completed);
            const newCandidates = myDayTasks.filter(t => !(Array.isArray(orderedTasks) ? orderedTasks : []).some(existing => existing.id === t.id));

            setImportCandidates(newCandidates);
            setSelectedImportIds(new Set(newCandidates.map(c => c.id)));
            setImportModal('my-day');
        }
    };

    // Auto-trigger import if requested via props
    useEffect(() => {
        if (initialAutoImport) {
            // Small timeout to allow render stability
            const t = setTimeout(() => {
                handleSelectSource(initialAutoImport);
            }, 100);
            return () => clearTimeout(t);
        }
    }, []);

    const confirmImport = () => {
        const toAdd = importCandidates.filter(t => selectedImportIds.has(t.id));
        setOrderedTasks(prev => {
            return [...prev, ...toAdd].sort((a, b) => {
                const timeA = a.scheduledTime || '99:99';
                const timeB = b.scheduledTime || '99:99';
                return timeA.localeCompare(timeB);
            });
        });
        setImportModal(null);
        setImportCandidates([]);
    };

    const toggleImportSelection = (id: string) => {
        const newSet = new Set(selectedImportIds);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setSelectedImportIds(newSet);
    };

    const [newTaskText, setNewTaskText] = useState('');
    const handleCreateManualTask = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTaskText.trim()) return;

        const newTask: Task = {
            id: generateId(),
            text: newTaskText,
            completed: false,
            createdAt: Date.now(),
            scheduledDate: todayStr,
            scheduledTime: format(new Date(), 'HH:mm')
        };

        onAddTask(newTask);
        setOrderedTasks(prev => [...prev, newTask]);
        setNewTaskText('');
    };



    const removeTaskFromSequence = (index: number) => {
        setOrderedTasks(prev => {
            const newTasks = [...prev];
            newTasks.splice(index, 1);
            return newTasks;
        });
        if (selectedTaskId === (Array.isArray(orderedTasks) ? orderedTasks : [])[index]?.id) {
            setSelectedTaskId(null);
        }
    };

    const moveTask = (idx: number, direction: 'up' | 'down') => {
        const newTasks = [...(Array.isArray(orderedTasks) ? orderedTasks : [])];
        const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
        if (targetIdx < 0 || targetIdx >= newTasks.length) return;

        const temp = newTasks[idx];
        newTasks[idx] = newTasks[targetIdx];
        newTasks[targetIdx] = temp;
        setOrderedTasks(newTasks);
    };

    const handleSaveEdit = (id: string) => {
        if (!editValue.trim()) return;
        if (id.startsWith('protocol-')) {
            // Protocols are handled differently (typically via activeChallenge update)
            // For now, we update local view or notify user
        } else {
            onUpdateTask(id, { text: editValue, scheduledTime: editTime });
        }
        setEditingTaskId(null);
    };

    const selectedTask = (Array.isArray(orderedTasks) ? orderedTasks : []).find(t => t.id === selectedTaskId);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in p-0">
            {/* Timer Section */}
            <div className="lg:col-span-2 space-y-8">
                <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-[40px] p-6 md:p-12 flex flex-col items-center justify-center relative overflow-hidden shadow-2xl dark:shadow-none">
                    <div className={`absolute inset-0 bg-linear-to-br ${mode === 'work' ? 'from-cyan-500/10 to-blue-600/10' : 'from-emerald-500/10 to-teal-600/10'} pointer-events-none opacity-40 dark:opacity-40`} />


                    {/* Timer Settings Button */}
                    <button
                        onClick={openSettings}
                        className="absolute top-8 right-8 p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors z-20"
                        title="Timer Settings"
                    >
                        <Settings size={20} />
                    </button>

                    {/* Settings Modal (Overlay inside card) */}
                    <TimerSettingsModal
                        showSettings={showSettings}
                        tempDurations={tempDurations}
                        tempSettings={tempSettings}
                        handleTempDurationChange={handleTempDurationChange}
                        setTempSettings={setTempSettings}
                        resetDefaults={resetDefaults}
                        setShowSettings={setShowSettings}
                        saveSettings={saveSettings}
                    />

                    {/* Mode Status (Automatic) */}
                    <div className="flex gap-1 mb-8 md:mb-12 relative z-10 w-full justify-center overflow-x-auto">
                        {(['work', 'shortBreak', 'longBreak'] as const).map((m) => {
                            const isDisabled = mode === 'work' && timeLeft > 0 && m !== 'work';
                            const isActiveMode = mode === m;
                            return (
                                <button
                                    key={m}
                                    onClick={() => handleManualSwitch(m)}
                                    disabled={isDisabled}
                                    className={`px-3 py-1 md:px-6 md:py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all border whitespace-nowrap ${isActiveMode
                                        ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white shadow-lg'
                                        : 'bg-transparent text-slate-400 dark:text-slate-500 border-transparent hover:text-slate-900 dark:hover:text-slate-300'
                                        } ${isDisabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                                >
                                    {m === 'longBreak' ? 'Long Break' : m === 'shortBreak' ? 'Short Break' : 'Focus'}
                                </button>
                            );
                        })}
                    </div>

                    {/* Timer Circle */}
                    <div className="relative mb-8 group flex items-center justify-center">
                        <svg className="w-48 h-48 md:w-64 md:h-64 transform -rotate-90">
                            <circle cx="50%" cy="50%" r="45%" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-slate-100 dark:text-white/5" />
                            <circle
                                cx="50%"
                                cy="50%"
                                r="45%"
                                stroke="currentColor"
                                strokeWidth="8"
                                fill="transparent"
                                strokeDasharray={2 * Math.PI * (window.innerWidth < 768 ? 90 : 120)} // Approximate radius logic if using pixels, but here we used % so cleaner to keep pixel consistent or react to size. 
                            // Actually, standard SVG scaling is easier if we keep viewbox. 
                            // Let's simplify: Use viewBox="0 0 256 256" and keep original logic but scale via className w/h
                            />
                        </svg>
                        {/* RE-RENDERING SVG WITH VIEWBOX FOR RESPONSIVENESS */}
                        <svg className="absolute w-48 h-48 md:w-64 md:h-64 transform -rotate-90" viewBox="0 0 256 256">
                            <circle cx="128" cy="128" r="120" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-slate-100 dark:text-white/5" />
                            <circle
                                cx="128"
                                cy="128"
                                r="120"
                                stroke="currentColor"
                                strokeWidth="8"
                                fill="transparent"
                                strokeDasharray={2 * Math.PI * 120}
                                strokeDashoffset={2 * Math.PI * 120 * (1 - timeLeft / (durations[mode] * 60))}
                                className={`transition-all duration-1000 ${mode === 'work' ? 'text-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.5)]' : 'text-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.5)]'}`}
                                strokeLinecap="round"
                            />
                        </svg>

                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white font-mono tracking-tighter drop-shadow-2xl">
                                {formatTime(timeLeft)}
                            </span>
                            <div className="flex items-center gap-2 mt-2 md:mt-4 px-3 py-1 md:px-4 md:py-1.5 bg-slate-50 dark:bg-white/5 rounded-full border border-slate-200 dark:border-white/5">
                                <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
                                <span className="text-[8px] md:text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                                    {mode === 'work' ? `Session #${sessionCount + 1}` : 'Break Period'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Timer Controls */}
                    <div className="flex items-center gap-6 relative z-10">
                        <button
                            onClick={resetTimer}
                            className="w-12 h-12 flex items-center justify-center text-slate-400 hover:text-slate-900 dark:hover:text-slate-300 rounded-full border border-slate-200 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5 transition-all cursor-pointer"
                            title="Reset Timer"
                        >
                            <RotateCcw size={18} />
                        </button>

                        <button
                            onClick={toggleTimer}
                            className={`w-16 h-16 md:w-20 md:h-20 flex items-center justify-center rounded-full transition-all border-2 cursor-pointer ${isActive
                                ? 'border-slate-900 bg-slate-900 dark:border-white dark:bg-white text-white dark:text-slate-950 shadow-xl'
                                : 'border-slate-200 bg-transparent text-slate-900 hover:border-slate-400 dark:border-white/20 dark:text-white dark:hover:border-white/50'
                                }`}
                        >
                            {isActive ? (
                                <Pause size={28} fill="currentColor" />
                            ) : (
                                <Play size={28} fill="currentColor" className="ml-1" />
                            )}
                        </button>

                        <button

                            disabled={!selectedTaskId || mode !== 'work'}
                            className={`w-12 h-12 flex items-center justify-center rounded-full transition-all border ${selectedTaskId && mode === 'work'
                                ? 'border-emerald-500/50 text-emerald-500 hover:bg-emerald-500 hover:text-white'
                                : 'border-white/5 text-slate-600 cursor-not-allowed'
                                }`}
                            onClick={() => {
                                if (selectedTaskId && mode === 'work') {
                                    // 1. Mark in global or protocol state
                                    handleToggleLocal(selectedTaskId);

                                    // 2. Remove from sequence locally
                                    setOrderedTasks(prev => prev.filter(t => t.id !== selectedTaskId));

                                    // 3. Clear selection and reset timer if working
                                    setSelectedTaskId(null);
                                    if (mode === 'work') {
                                        captureProgress();
                                        incrementSessionCount(); // Count as a completed session
                                        setIsActive(false);
                                        setTimeLeft(durations.work * 60);
                                    }
                                }
                            }}
                            title={mode === 'work' ? "Complete Task" : "Cannot complete tasks during break"}
                        >
                            <CheckCircle2 size={18} />
                        </button>
                    </div>
                </div>

                {/* Selected Task Active Display */}
                {selectedTask ? (
                    <div className="w-full mt-12 bg-white dark:bg-slate-900/50 border border-cyan-500/30 rounded-3xl p-6 flex items-center gap-6 animate-slide-up backdrop-blur-xl relative z-10 shadow-lg dark:shadow-none">
                        <div className="w-12 h-12 rounded-xl bg-cyan-600 dark:bg-cyan-500 flex items-center justify-center text-white shrink-0 shadow-lg shadow-cyan-500/20">
                            {selectedTask.isProtocol ? <Target size={24} /> : <ListTodo size={24} />}
                        </div>
                        <div className="flex-1 min-w-0">
                            <span className="text-[10px] font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-[0.2em] mb-1 block">Working On Presently</span>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white truncate drop-shadow-sm">{selectedTask.text}</h3>
                        </div>
                        <button
                            onClick={() => setSelectedTaskId(null)}
                            className="px-4 py-2 bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white text-[10px] font-bold rounded-xl transition-all uppercase tracking-widest border border-slate-200 dark:border-white/5"
                        >
                            Switch
                        </button>
                    </div>
                ) : (
                    <div className="w-full mt-12 h-24 border border-slate-200 dark:border-white/5 border-dashed rounded-3xl flex items-center justify-center text-slate-400 dark:text-slate-600 text-xs font-medium uppercase tracking-widest">
                        No Active Task Selected
                    </div>
                )}
            </div>

            {/* Focus Analyzer Column */}
            <div className="lg:col-span-1 space-y-6">

                <FocusAnalyzer dailyStats={dailyStats} onClear={clearAllStats} history={allHistory} sessionCount={sessionCount} />

                <PomodoroSequence
                    orderedTasks={orderedTasks}
                    newTaskText={newTaskText}
                    setNewTaskText={setNewTaskText}
                    handleCreateManualTask={handleCreateManualTask}
                    setImportModal={setImportModal}
                    editingTaskId={editingTaskId}
                    setEditingTaskId={setEditingTaskId}
                    editValue={editValue}
                    setEditValue={setEditValue}
                    editTime={editTime}
                    setEditTime={setEditTime}
                    handleSaveEdit={handleSaveEdit}
                    selectedTaskId={selectedTaskId}
                    setSelectedTaskId={setSelectedTaskId}
                    mode={mode}
                    handleToggleLocal={handleToggleLocal}
                    removeTaskFromSequence={removeTaskFromSequence}
                    moveTask={moveTask}
                />
            </div>
            {/* Import Selection Modal */}
            <ImportTasksModal
                importModal={importModal}
                activeChallengeTitle={activeChallenge?.title}
                importCandidates={importCandidates}
                selectedImportIds={selectedImportIds}
                setImportModal={setImportModal}
                handleSelectSource={handleSelectSource}
                toggleImportSelection={toggleImportSelection}
                confirmImport={confirmImport}
            />
        </div >
    );
};
