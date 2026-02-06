import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Target, CheckCircle2, ListTodo, ChevronUp, ChevronDown, Edit3, X, Plus, Trash2, Sun, Shield, ListPlus, ChevronLeft, Settings } from 'lucide-react';
import { api } from '../api';
import type { Task, Challenge } from '../types';
import { differenceInDays, parseISO, format, subDays } from 'date-fns';

const FocusAnalyzer = ({ dailyStats, onClear, history, sessionCount }: { dailyStats: { workSecs: number, breakSecs: number }, onClear: () => void, history: any[], sessionCount?: number }) => {
    const today = new Date();
    const [hoveredData, setHoveredData] = useState<{ x: number, y: number, day: string, hours: string, sessions: number } | null>(null);

    const sessionStats: Record<string, number> = {};
    const timeStatsRecord: Record<string, any> = {};

    const safeHistory = Array.isArray(history) ? history : [];
    safeHistory.forEach(h => {
        const stats = timeStatsRecord[h.date] || { workSecs: 0, breakSecs: 0 };
        sessionStats[h.date] = (sessionStats[h.date] || 0) + h.sessionCount;
        timeStatsRecord[h.date] = {
            workSecs: stats.workSecs + h.workSecs,
            breakSecs: stats.breakSecs + h.breakSecs
        };
    });

    const data = Array.from({ length: 7 }).map((_, i) => {
        const d = subDays(today, 6 - i);
        const dayStr = format(d, 'yyyy-MM-dd');
        const isToday = format(today, 'yyyy-MM-dd') === dayStr;

        let workSecs = 0;
        let sessions = 0;

        if (isToday) {
            workSecs = dailyStats.workSecs;
            sessions = sessionCount ?? (sessionStats[dayStr] || 0);
        } else {
            const timeStats = timeStatsRecord[dayStr] || { workSecs: 0 };
            workSecs = timeStats.workSecs !== undefined ? timeStats.workSecs : (timeStats.workMins || 0) * 60;
            sessions = sessionStats[dayStr] || 0;
        }

        const hours = workSecs / 3600;
        return {
            day: format(d, 'EEE'),
            fullDate: format(d, 'MMM d'),
            value: Number(hours.toFixed(2)),
            sessions: sessions,
            formattedDuration: formatDuration(workSecs)
        };
    });

    const maxVal = Math.max(...data.map(d => d.value), 4); // Scale up to at least 4 hours context

    const width = 200;
    const height = 40;
    const points = data.map((d, i) => {
        const x = (i / (data.length - 1)) * width;
        const normalizedVal = d.value / maxVal;
        const y = height - (normalizedVal * height);
        return `${x},${y}`;
    }).join(' ');

    const areaPath = `M 0,${height} ${points} L ${width},${height} Z`;

    const totalSecs = data.reduce((acc, curr) => acc + (curr.value * 3600), 0);
    const totalSessions = data.reduce((acc, curr) => acc + curr.sessions, 0);

    // Helper inside component to avoid hoist issues (or duplicating logic if formatDuration is outside)
    function formatDuration(totalSeconds: number) {
        const hours = Math.floor(totalSeconds / 3600);
        const mins = Math.floor((totalSeconds % 3600) / 60);
        const secs = Math.floor(totalSeconds % 60);
        return `${hours}h ${mins}m ${secs}s`;
    }

    return (
        <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-[32px] p-6 shadow-xl relative overflow-visible">
            <div className="flex justify-between items-end mb-4 relative z-10">
                <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Focus Analyzer (7 Days)</span>
                    <div className="flex items-baseline gap-3">
                        <span className="text-2xl font-black text-slate-900 dark:text-white">{formatDuration(totalSecs)}</span>
                        <span className="text-sm font-bold text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">{totalSessions} Sessions</span>
                    </div>
                </div>
                <div className="text-right flex flex-col items-end gap-2">
                    <button
                        onClick={() => {
                            if (confirm('Are you sure you want to clear all focus history? This cannot be undone.')) {
                                onClear();
                            }
                        }}
                        className="p-1.5 bg-slate-100 dark:bg-white/5 hover:bg-red-500/20 text-slate-500 hover:text-red-600 dark:hover:text-red-400 rounded-lg transition-colors cursor-pointer"
                        title="Reset History"
                    >
                        <RotateCcw size={12} />
                    </button>
                    <span className="text-[10px] font-mono text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 px-2 py-1 rounded-lg border border-cyan-500/20">Last 7 Days</span>
                </div>
            </div>

            {/* Graph Container */}
            <div className="h-16 w-full relative" onMouseLeave={() => setHoveredData(null)}>
                <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox={`0 0 ${width} ${height}`}>
                    {/* Grid Lines */}
                    <line x1="0" y1={height} x2={width} y2={height} stroke="currentColor" className="text-slate-200 dark:text-slate-700" strokeWidth="1" strokeDasharray="4 4" />
                    <line x1="0" y1={0} x2={width} y2={0} stroke="currentColor" className="text-slate-200 dark:text-slate-700" strokeWidth="1" strokeDasharray="4 4" opacity="0.3" />

                    {/* Gradient Fill */}
                    <defs>
                        <linearGradient id="lineGradient" x1="0" x2="0" y1="0" y2="1">
                            <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.4" />
                            <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
                        </linearGradient>
                    </defs>
                    <path d={areaPath} fill="url(#lineGradient)" />

                    {/* Line */}
                    <path d={`M ${points}`} fill="none" stroke="#06b6d4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />

                    {/* Points */}
                    {data.map((d, i) => {
                        const x = (i / (data.length - 1)) * width;
                        const normalizedVal = d.value / maxVal;
                        const y = height - (normalizedVal * height);
                        return (
                            <g key={i}>
                                {/* Invisible hit target */}
                                <circle
                                    cx={x} cy={y} r="8" fill="transparent"
                                    className="cursor-pointer"
                                    onMouseEnter={() => setHoveredData({ x, y, day: d.fullDate, hours: d.formattedDuration, sessions: d.sessions })}
                                />
                                {d.value > 0 && <circle cx={x} cy={y} r="2" className="fill-slate-900 dark:fill-white pointer-events-none" />}
                            </g>
                        );
                    })}
                </svg>

                {/* Tooltip */}
                {hoveredData && (
                    <div
                        className="absolute bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-lg p-2 shadow-xl z-50 pointer-events-none animate-fade-in"
                        style={{
                            left: `${(hoveredData.x / width) * 100}%`,
                            bottom: `${((height - hoveredData.y) / height) * 100}%`,
                            transform: 'translate(-50%, -10px)',
                            whiteSpace: 'nowrap'
                        }}
                    >
                        <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1">{hoveredData.day}</div>
                        <div className="text-xs font-bold text-slate-900 dark:text-white mb-0.5">{hoveredData.hours}</div>
                        <div className="text-[10px] text-cyan-600 dark:text-cyan-400">{hoveredData.sessions} Sessions</div>
                    </div>
                )}
            </div>

            {/* X-Axis Labels */}
            <div className="flex justify-between mt-2">
                {data.map((d, i) => (
                    <span key={i} className="text-[8px] font-bold text-slate-600 uppercase w-4 text-center">{d.day.charAt(0)}</span>
                ))}
            </div>
            {/* Hours Summary */}
            <div className="grid grid-cols-3 gap-2 mt-6 pt-6 border-t border-slate-200 dark:border-white/5">
                <div className="text-center">
                    <span className="text-[8px] uppercase font-bold text-slate-500 block mb-1">Focus</span>
                    <span className="text-sm font-bold text-cyan-600 dark:text-cyan-400">
                        {formatDuration(dailyStats.workSecs)}
                    </span>
                </div>
                <div className="text-center">
                    <span className="text-[8px] uppercase font-bold text-slate-500 block mb-1">Break</span>
                    <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                        {formatDuration(dailyStats.breakSecs)}
                    </span>
                </div>
                <div className="text-center">
                    <span className="text-[8px] uppercase font-bold text-slate-500 block mb-1">Total</span>
                    <span className="text-sm font-bold text-slate-950 dark:text-white">
                        {formatDuration(dailyStats.workSecs + dailyStats.breakSecs)}
                    </span>
                </div>
            </div>
        </div>
    );
};

interface PomodoroViewProps {
    tasks: Task[];
    activeChallenge: Challenge | null;
    onToggleTask: (id: string) => void;
    onUpdateTask: (id: string, updates: Partial<Task>) => void;
    onAddTask: (task: Partial<Task>) => void;

    initialAutoImport?: 'my-day' | 'protocol' | 'direct' | null;
    directImportTasks?: Task[];
    onUpdateChallenge?: (challenge: Challenge | null, idToDelete?: string) => void;
}

export const PomodoroView: React.FC<PomodoroViewProps> = ({ tasks, activeChallenge, onToggleTask, onUpdateTask, onAddTask, initialAutoImport, directImportTasks, onUpdateChallenge }) => {
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
            const stats = await api.getPomodoroStats(todayStr);
            const history = await api.getAllPomodoroStats();

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
            api.savePomodoroStats(todayStr, { ...dailyStats, sessionCount: newCount, sequence: orderedTasks });
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
            api.savePomodoroStats(todayStr, { ...newStats, sessionCount: currentSessionCount, sequence: orderedTasks });
            return newStats;
        });
    };

    const clearAllStats = async () => {
        await api.clearPomodoroHistory();
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
                await api.savePomodoroStats(todayStr, { ...dailyStats, sessionCount, sequence: orderedTasks });
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
            id: crypto.randomUUID(),
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
                <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-[40px] p-12 flex flex-col items-center justify-center relative overflow-hidden shadow-2xl dark:shadow-none">
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
                    {showSettings && (
                        <div className="absolute inset-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl flex flex-col items-center justify-center p-8 animate-fade-in space-y-6">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Timer Settings</h3>

                            <div className="w-full space-y-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Focus Duration (min)</label>
                                    <input
                                        type="number"
                                        value={tempDurations.work || ''}
                                        onChange={(e) => handleTempDurationChange('work', e.target.value)}
                                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white font-mono focus:outline-none focus:border-cyan-500 transition-all"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Short Break</label>
                                        <input
                                            type="number"
                                            value={tempDurations.shortBreak || ''}
                                            onChange={(e) => handleTempDurationChange('shortBreak', e.target.value)}
                                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white font-mono focus:outline-none focus:border-emerald-500 transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Long Break</label>
                                        <input
                                            type="number"
                                            value={tempDurations.longBreak || ''}
                                            onChange={(e) => handleTempDurationChange('longBreak', e.target.value)}
                                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white font-mono focus:outline-none focus:border-emerald-500 transition-all"
                                        />
                                    </div>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/5 rounded-xl">
                                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Auto-start Breaks</span>
                                    <button
                                        onClick={() => setTempSettings(prev => ({ ...prev, autoStartBreak: !prev.autoStartBreak }))}
                                        className={`w-10 h-6 rounded-full p-1 transition-colors ${tempSettings.autoStartBreak ? 'bg-cyan-500' : 'bg-slate-300 dark:bg-slate-600'}`}
                                    >
                                        <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${tempSettings.autoStartBreak ? 'translate-x-4' : 'translate-x-0'}`} />
                                    </button>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/5 rounded-xl">
                                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Auto-start Focus</span>
                                    <button
                                        onClick={() => setTempSettings(prev => ({ ...prev, autoStartWork: !prev.autoStartWork }))}
                                        className={`w-10 h-6 rounded-full p-1 transition-colors ${tempSettings.autoStartWork ? 'bg-cyan-500' : 'bg-slate-300 dark:bg-slate-600'}`}
                                    >
                                        <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${tempSettings.autoStartWork ? 'translate-x-4' : 'translate-x-0'}`} />
                                    </button>
                                </div>
                            </div>


                            <div className="flex gap-2 w-full mt-4">
                                <button
                                    onClick={resetDefaults}
                                    className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-slate-400 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-colors cursor-pointer"
                                >
                                    Default
                                </button>
                                <button
                                    onClick={() => setShowSettings(false)}
                                    className="flex-1 py-3 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-600 dark:text-white rounded-xl font-bold text-[10px] uppercase tracking-widest transition-colors cursor-pointer border border-slate-200 dark:border-transparent"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={saveSettings}
                                    className="flex-1 py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest transition-colors cursor-pointer"
                                >
                                    Save
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Mode Status (Automatic) */}
                    <div className="flex gap-1 mb-12 relative z-10">
                        {(['work', 'shortBreak', 'longBreak'] as const).map((m) => {
                            const isDisabled = mode === 'work' && timeLeft > 0 && m !== 'work';
                            const isActiveMode = mode === m;
                            return (
                                <button
                                    key={m}
                                    onClick={() => handleManualSwitch(m)}
                                    disabled={isDisabled}
                                    className={`px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all border ${isActiveMode
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
                    <div className="relative mb-8 group">
                        <svg className="w-64 h-64 transform -rotate-90">
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
                            <span className="text-7xl font-black text-slate-900 dark:text-white font-mono tracking-tighter drop-shadow-2xl">
                                {formatTime(timeLeft)}
                            </span>
                            <div className="flex items-center gap-2 mt-4 px-4 py-1.5 bg-slate-50 dark:bg-white/5 rounded-full border border-slate-200 dark:border-white/5">
                                <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
                                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                                    {mode === 'work' ? `Session #${sessionCount + 1}` : 'Break Period'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Timer Controls */}
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
                            className={`w-20 h-20 flex items-center justify-center rounded-full transition-all border-2 cursor-pointer ${isActive
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

                <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-[32px] p-6 h-[calc(100vh-28rem)] flex flex-col shadow-xl dark:shadow-none">
                    <div className="flex items-center justify-between mb-8 shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20">
                                <ListTodo size={16} className="text-cyan-600 dark:text-cyan-400" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-widest">Today's Sequence</h3>
                                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">{orderedTasks.length} Operations Pending</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setImportModal('source-select')}
                                className="p-2 bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg transition-colors border border-slate-200 dark:border-white/10"
                                title="Import Tasks"
                            >
                                <ListPlus size={16} />
                            </button>

                        </div>
                    </div>

                    {/* Manual Task Input */}
                    <form onSubmit={handleCreateManualTask} className="mb-4 relative group">
                        <input
                            type="text"
                            value={newTaskText}
                            onChange={(e) => setNewTaskText(e.target.value)}
                            placeholder="Add sequence task..."
                            className="w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 pl-10 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500/50 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600 placeholder:font-medium"
                        />
                        <Plus size={14} className="absolute left-3.5 top-3.5 text-slate-400 dark:text-slate-600 group-focus-within:text-cyan-500 transition-colors" />
                    </form>

                    <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                        {orderedTasks.map((task, index) => (
                            <div key={task.id} className="relative group">
                                {editingTaskId === task.id ? (
                                    <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-cyan-500/50 rounded-2xl p-4 space-y-4 animate-fade-in">
                                        <input
                                            autoFocus
                                            value={editValue}
                                            onChange={(e) => setEditValue(e.target.value)}
                                            className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500/50"
                                            placeholder="Task details..."
                                        />
                                        <input
                                            type="time"
                                            value={editTime}
                                            onChange={(e) => setEditTime(e.target.value)}
                                            className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500/50 font-mono"
                                        />
                                        <div className="flex gap-2">
                                            <button onClick={() => handleSaveEdit(task.id)} className="flex-1 py-2 bg-cyan-600 text-white text-[10px] font-bold rounded-lg hover:bg-cyan-500 uppercase tracking-widest">Save</button>
                                            <button onClick={() => setEditingTaskId(null)} className="p-2 bg-white/5 text-slate-400 rounded-lg hover:bg-white/10 hover:text-white"><X size={14} /></button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className={`w-full group/item text-left p-3 rounded-lg border transition-all flex items-center justify-between gap-3 ${selectedTaskId === task.id
                                        ? 'bg-cyan-500/5 border-cyan-500/30 dark:border-cyan-500/30'
                                        : mode === 'work' ? 'bg-transparent border-slate-100 dark:border-white/5 hover:border-slate-200 dark:hover:border-white/10 hover:bg-slate-50 dark:hover:bg-white/2 cursor-pointer' : 'bg-transparent border-slate-100 dark:border-white/5 opacity-50 cursor-not-allowed'}`}
                                    >
                                        <div className="flex items-center gap-3 flex-1 min-w-0" onClick={() => mode === 'work' && setSelectedTaskId(task.id)}>
                                            <div className={`w-1 h-8 rounded-full transition-colors ${selectedTaskId === task.id ? 'bg-cyan-500' : 'bg-slate-200 dark:bg-white/10 group-hover/item:bg-slate-300 dark:group-hover/item:bg-white/20'}`} />

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <p className={`text-sm font-medium truncate ${selectedTaskId === task.id ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>
                                                        {task.text}
                                                    </p>
                                                    {task.isProtocol && (
                                                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 shrink-0" title="Protocol Task" />
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] font-mono text-slate-400 dark:text-slate-600">
                                                        {task.scheduledTime ? format(new Date(`2000-01-01T${task.scheduledTime}`), 'h:mm a') : 'Flex'}
                                                    </span>
                                                    {task.completed && (
                                                        <span className="text-[8px] font-bold px-1.5 py-0.5 bg-emerald-500/10 text-emerald-500 rounded border border-emerald-500/20 uppercase tracking-tighter">Done</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Hover Controls */}
                                        <div className="flex items-center gap-1 opacity-0 group-hover/item:opacity-100 transition-opacity">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleToggleLocal(task.id); }}
                                                className={`p-1.5 rounded-lg transition-colors ${task.completed ? 'text-emerald-500' : 'text-slate-400 hover:text-emerald-500'}`}
                                                title={task.completed ? "Mark as pending" : "Mark as completed"}
                                            >
                                                <CheckCircle2 size={14} />
                                            </button>
                                            <button
                                                onClick={() => removeTaskFromSequence(index)}
                                                className="p-1.5 text-slate-600 hover:text-red-400 transition-colors"
                                                title="Remove from sequence"
                                            >
                                                <Trash2 size={12} />
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setEditingTaskId(task.id);
                                                    setEditValue(task.text);
                                                    setEditTime(task.scheduledTime || '');
                                                }}
                                                className="p-1.5 text-slate-400 dark:text-slate-600 hover:text-slate-900 dark:hover:text-white transition-colors"
                                            >
                                                <Edit3 size={12} />
                                            </button>
                                            <div className="flex flex-col">
                                                <button onClick={() => moveTask(index, 'up')} disabled={index === 0} className="text-slate-400 dark:text-slate-600 hover:text-slate-900 dark:hover:text-white disabled:opacity-0"><ChevronUp size={12} /></button>
                                                <button onClick={() => moveTask(index, 'down')} disabled={index === orderedTasks.length - 1} className="text-slate-400 dark:text-slate-600 hover:text-slate-900 dark:hover:text-white disabled:opacity-0"><ChevronDown size={12} /></button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
// Import Selection Modal
            {
                importModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-8 bg-slate-950/40 dark:bg-black/60 backdrop-blur-sm animate-fade-in text-left">
                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-3xl p-8 max-w-md w-full shadow-2xl space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    {(importModal === 'my-day' || importModal === 'protocol') && (
                                        <button
                                            onClick={() => setImportModal('source-select')}
                                            className="p-1 -ml-2 text-slate-500 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
                                        >
                                            <ChevronLeft size={20} />
                                        </button>
                                    )}
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                                        {importModal === 'source-select' && 'Select Source'}
                                        {importModal === 'my-day' && 'My Day Tasks'}
                                        {importModal === 'protocol' && 'Protocol Tasks'}
                                    </h3>
                                </div>
                                <button onClick={() => setImportModal(null)} className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-full text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                                    <X size={20} />
                                </button>
                            </div>

                            {importModal === 'source-select' ? (
                                <div className="space-y-4 max-h-[50vh] overflow-y-auto custom-scrollbar pr-2">
                                    <button
                                        onClick={() => handleSelectSource('my-day')}
                                        className="w-full p-4 bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 border border-slate-200 dark:border-white/5 hover:border-emerald-500/50 rounded-2xl flex items-center gap-4 transition-all group text-left"
                                    >
                                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-500 border border-emerald-500/20 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                                            <Sun size={20} />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-slate-900 dark:text-white">My Day Schedule</h4>
                                            <p className="text-xs text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-400">Import from today's plan</p>
                                        </div>
                                    </button>

                                    {activeChallenge && (
                                        <button
                                            onClick={() => handleSelectSource('protocol')}
                                            className="w-full p-4 bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 border border-slate-200 dark:border-white/5 hover:border-cyan-500/50 rounded-2xl flex items-center gap-4 transition-all group text-left"
                                        >
                                            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-600 dark:text-cyan-500 border border-cyan-500/20 group-hover:bg-cyan-500 group-hover:text-white transition-colors">
                                                <Shield size={20} />
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-bold text-slate-900 dark:text-white">{activeChallenge.title}</h4>
                                                <p className="text-xs text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-400">Import from active protocol</p>
                                            </div>
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <>
                                    <div className="space-y-3 max-h-[50vh] overflow-y-auto custom-scrollbar pr-2">
                                        {importCandidates.length === 0 ? (
                                            <div className="text-center py-8 text-slate-500 text-xs">
                                                No tasks available to import from this source.
                                            </div>
                                        ) : (
                                            importCandidates.map(task => (
                                                <div
                                                    key={task.id}
                                                    className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center gap-4 ${selectedImportIds.has(task.id)
                                                        ? 'bg-cyan-500/10 border-cyan-500/50'
                                                        : 'bg-slate-50 dark:bg-white/5 border-slate-100 dark:border-white/5 hover:bg-slate-100 dark:hover:bg-white/10'}`}
                                                    onClick={() => toggleImportSelection(task.id)}
                                                >
                                                    <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${selectedImportIds.has(task.id)
                                                        ? 'bg-cyan-500 border-cyan-500'
                                                        : 'bg-white dark:bg-transparent border-slate-200 dark:border-white/20'}`}
                                                    >
                                                        {selectedImportIds.has(task.id) && <CheckCircle2 size={12} className="text-white" />}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className={`text-sm font-medium truncate ${selectedImportIds.has(task.id) ? 'text-cyan-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}>{task.text}</p>
                                                        {task.scheduledTime && (
                                                            <span className="text-[10px] font-mono text-slate-500">{task.scheduledTime}</span>
                                                        )}
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>

                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => setImportModal(null)}
                                            className="flex-1 py-3 bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-500 dark:text-slate-300 rounded-xl font-bold text-xs uppercase tracking-wider transition-colors border border-slate-200 dark:border-white/5"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={confirmImport}
                                            disabled={selectedImportIds.size === 0}
                                            className="flex-1 py-3 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-colors shadow-lg shadow-cyan-500/20"
                                        >
                                            Import ({selectedImportIds.size})
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                )
            }
        </div >
    );
};
