import React from 'react';

export interface TimerSettingsModalProps {
    showSettings: boolean;
    tempDurations: { work: number; shortBreak: number; longBreak: number };
    tempSettings: { autoStartBreak: boolean; autoStartWork: boolean };
    handleTempDurationChange: (key: 'work' | 'shortBreak' | 'longBreak', val: string) => void;
    setTempSettings: React.Dispatch<React.SetStateAction<{ autoStartBreak: boolean; autoStartWork: boolean }>>;
    resetDefaults: () => void;
    setShowSettings: (val: boolean) => void;
    saveSettings: () => void;
}

export const TimerSettingsModal: React.FC<TimerSettingsModalProps> = ({
    showSettings,
    tempDurations,
    tempSettings,
    handleTempDurationChange,
    setTempSettings,
    resetDefaults,
    setShowSettings,
    saveSettings
}) => {
    if (!showSettings) return null;

    return (
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
    );
};
