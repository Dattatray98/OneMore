import React, { useState } from 'react';
import type { Task } from '../types';
import { Calendar as CalendarIcon, Clock, ChevronRight, Plus, Check } from 'lucide-react';
import { format, startOfToday, isSameDay } from 'date-fns';
import { TaskModal } from './TaskModal';

interface PlannedTasksProps {
    tasks: Task[];
    onToggle: (id: string) => void;
    onUpdate: (id: string, updates: Partial<Task>) => void;
    onAdd: (task: Partial<Task>) => void;
}

export const PlannedTasks: React.FC<PlannedTasksProps> = ({ tasks, onToggle, onUpdate, onAdd }) => {
    const [viewMode, setViewMode] = useState<'week' | 'day'>('week');
    const [selectedDate, setSelectedDate] = useState(startOfToday());

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<Partial<Task> | undefined>(undefined);
    const [modalDefaultDate, setModalDefaultDate] = useState<string | undefined>(undefined);
    const [modalDefaultTime, setModalDefaultTime] = useState<string | undefined>(undefined);

    // Generate unique set of dates to display
    // Includes: ONLY future/present dates that have a task scheduled
    // If no tasks are scheduled, defaults to Today
    const today = startOfToday();

    // Get all unique future dates from tasks
    const plannedDates = Array.from(new Set(
        tasks
            .filter(t => t.scheduledDate && new Date(t.scheduledDate) >= today)
            .map(t => t.scheduledDate!)
    )).map(dateStr => new Date(dateStr));

    // If no planned dates, default to just Today
    const datesToDisplay = plannedDates.length > 0
        ? plannedDates
        : [today];

    const dates = datesToDisplay
        .map(date => {
            // Ensure we are working with midnight time to avoid mismatch
            const d = new Date(date);
            d.setHours(0, 0, 0, 0);
            return d;
        })
        // Remove duplicates if any somehow slipped in via time differences (though set logic above handles strings)
        .sort((a, b) => a.getTime() - b.getTime());





    const handleAddTask = (dateStr?: string, timeStr?: string) => {
        setEditingTask(undefined);
        setModalDefaultDate(dateStr || format(selectedDate, 'yyyy-MM-dd'));
        setModalDefaultTime(timeStr);
        setIsModalOpen(true);
    };

    const handleEditTask = (task: Task) => {
        setEditingTask(task);
        setIsModalOpen(true);
    };

    const handleSaveTask = (task: Partial<Task>) => {
        if (task.id) {
            onUpdate(task.id, task);
        } else {
            onAdd(task);
        }
    };

    return (
        <>
            <div className="w-full flex flex-col gap-6 animate-fade-in">
                {/* Sub-Tabs for Planned View */}
                <div className="flex items-center gap-4 border-b border-white/10 pb-4">
                    <button
                        onClick={() => setViewMode('week')}
                        className={`text-sm font-medium transition-colors hover:text-white ${viewMode === 'week' ? 'text-cyan-400' : 'text-slate-500'}`}
                    >
                        Week Overview
                    </button>
                    <div className="h-4 w-px bg-white/10" />
                    <button
                        onClick={() => setViewMode('day')}
                        className={`text-sm font-medium transition-colors hover:text-white ${viewMode === 'day' ? 'text-cyan-400' : 'text-slate-500'}`}
                    >
                        Day Planner
                    </button>
                </div>

                {viewMode === 'week' ? (
                    /* Week Overview (Horizontal List per Day) */
                    <div className="w-full rounded-xl border border-white/10 bg-slate-900/50 backdrop-blur-sm overflow-hidden">
                        {dates.map((date) => {
                            const dateStr = format(date, 'yyyy-MM-dd');
                            const dayTasks = tasks
                                .filter(t => t.scheduledDate === dateStr)
                                .sort((a, b) => (a.scheduledTime || '23:59').localeCompare(b.scheduledTime || '23:59'));

                            return (
                                <div key={dateStr} className="flex border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors">
                                    {/* Date Column */}
                                    <div className="w-32 flex-shrink-0 p-4 border-r border-white/10 bg-slate-900/30 flex flex-col justify-center">
                                        <span className={`font-medium ${isSameDay(date, new Date()) ? 'text-cyan-400' : 'text-slate-200'}`}>
                                            {format(date, 'MMM d')}
                                        </span>
                                        <span className="text-xs text-slate-500">{format(date, 'EEEE')}</span>
                                    </div>

                                    {/* Tasks Column */}
                                    <div className="flex-1 p-4 flex items-center gap-3 overflow-x-auto custom-scrollbar">
                                        {dayTasks.length === 0 ? (
                                            <span className="text-xs text-slate-600 italic">No tasks scheduled</span>
                                        ) : (
                                            dayTasks.map(task => (
                                                <div
                                                    key={task.id}
                                                    onClick={() => onToggle(task.id)}
                                                    className={`flex-shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all cursor-pointer select-none ${task.completed
                                                        ? 'bg-slate-800/50 border-slate-700 text-slate-500'
                                                        : 'bg-white/5 border-white/10 hover:border-cyan-500/50 hover:bg-white/10 text-slate-300'
                                                        }`}
                                                    title={task.text}
                                                >
                                                    <span className="text-xs font-mono font-medium">
                                                        {task.scheduledTime ? format(new Date(`2000-01-01T${task.scheduledTime}`), 'h:mm a') : 'All Day'}
                                                    </span>

                                                    <div className={`w-4 h-4 rounded flex items-center justify-center border transition-colors ${task.completed
                                                        ? 'bg-cyan-500 border-cyan-500 text-black'
                                                        : 'border-slate-500'
                                                        }`}>
                                                        {task.completed && <Check size={10} strokeWidth={4} />}
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    /* Day Planner View (Custom Schedule) */
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-16rem)]">
                        {/* Week Days Sidebar */}
                        <div className="lg:col-span-1 bg-slate-900/50 rounded-xl border border-white/10 p-4 overflow-y-auto custom-scrollbar flex flex-col gap-6">
                            <div>
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Upcoming Schedule</h3>
                                <div className="space-y-2">
                                    {dates.map((date) => {
                                        const isSelected = isSameDay(date, selectedDate);
                                        return (
                                            <button
                                                key={date.toString()}
                                                onClick={() => setSelectedDate(date)}
                                                className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all ${isSelected
                                                    ? 'bg-cyan-500/10 border-cyan-500/50 text-white'
                                                    : 'bg-white/5 border-transparent text-slate-400 hover:bg-white/10 hover:text-slate-200'
                                                    }`}
                                            >
                                                <div className="flex flex-col items-start">
                                                    <span className="font-semibold">{format(date, 'EEEE')}</span>
                                                    <span className="text-xs opacity-70">{format(date, 'MMMM d')}</span>
                                                </div>
                                                {isSelected && <ChevronRight size={16} className="text-cyan-400" />}
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>

                            <div>
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Select Date</h3>
                                <div className="relative">
                                    <input
                                        type="date"
                                        value={format(selectedDate, 'yyyy-MM-dd')}
                                        onChange={(e) => {
                                            if (e.target.value) {
                                                setSelectedDate(new Date(e.target.value));
                                            }
                                        }}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all [color-scheme:dark]"
                                    />
                                    <CalendarIcon size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                                </div>
                            </div>
                        </div>

                        {/* Event List for Selected Day */}
                        <div className="lg:col-span-3 bg-slate-900/50 rounded-xl border border-white/10 p-6 overflow-y-auto custom-scrollbar relative min-h-[500px]">
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h3 className="text-xl font-bold flex items-center gap-2 mb-1">
                                        <CalendarIcon size={24} className="text-cyan-400" />
                                        {format(selectedDate, 'EEEE')}
                                    </h3>
                                    <p className="text-slate-400 ml-8">{format(selectedDate, 'MMM do, yyyy')}</p>
                                </div>
                                <button
                                    onClick={() => handleAddTask(format(selectedDate, 'yyyy-MM-dd'))}
                                    className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition-all shadow-lg shadow-cyan-500/20 font-medium text-sm"
                                >
                                    <Plus size={16} />
                                    Add Event
                                </button>
                            </div>

                            <div className="space-y-4 relative pl-8 border-l border-white/10 ml-4 pb-10">
                                {/* Dynamic Task List */}
                                {tasks.filter(t => t.scheduledDate === format(selectedDate, 'yyyy-MM-dd')).length === 0 ? (
                                    <div className="text-center py-20 bg-white/5 rounded-xl border border-white/5 border-dashed">
                                        <p className="text-slate-400 mb-4">No events scheduled for this day.</p>
                                        <button
                                            onClick={() => handleAddTask(format(selectedDate, 'yyyy-MM-dd'))}
                                            className="text-cyan-400 hover:text-cyan-300 text-sm font-medium"
                                        >
                                            Create your first event
                                        </button>
                                    </div>
                                ) : (
                                    tasks
                                        .filter(t => t.scheduledDate === format(selectedDate, 'yyyy-MM-dd'))
                                        .sort((a, b) => (a.scheduledTime || '23:59').localeCompare(b.scheduledTime || '23:59'))
                                        .map((task) => (
                                            <div key={task.id} className="relative group animate-fade-in">
                                                {/* Time Marker Dot */}
                                                <div className="absolute left-[-37px] top-[50%] -translate-y-1/2 w-4 h-4 rounded-full bg-slate-900 border-2 border-cyan-500 z-10 group-hover:bg-cyan-500 transition-colors shadow-[0_0_10px_-3px_rgba(6,182,212,0.5)]" />

                                                <div
                                                    onClick={(e) => { e.stopPropagation(); handleEditTask(task); }}
                                                    className={`flex items-center gap-4 p-4 rounded-xl border backdrop-blur-sm cursor-pointer transition-all hover:translate-x-1 ${task.completed
                                                        ? 'bg-slate-800/30 border-slate-700/50 opacity-60'
                                                        : 'bg-white/5 border-white/10 hover:border-cyan-500/30 hover:bg-white/10'
                                                        }`}
                                                >
                                                    {/* Time Display */}
                                                    <div className="min-w-[80px] text-center border-r border-white/10 pr-4">
                                                        <span className="block text-lg font-bold text-white">
                                                            {task.scheduledTime ? (
                                                                <>
                                                                    {parseInt(task.scheduledTime.split(':')[0]) > 12
                                                                        ? parseInt(task.scheduledTime.split(':')[0]) - 12
                                                                        : parseInt(task.scheduledTime.split(':')[0]) === 0 ? 12 : parseInt(task.scheduledTime.split(':')[0])}
                                                                    <span className="text-xs font-normal ml-0.5">{parseInt(task.scheduledTime.split(':')[0]) >= 12 ? 'PM' : 'AM'}</span>
                                                                    <span className="block text-sm font-normal text-slate-400">:{task.scheduledTime.split(':')[1]}</span>
                                                                </>
                                                            ) : (
                                                                <span className="text-xs">Anytime</span>
                                                            )}
                                                        </span>
                                                    </div>

                                                    <div className="flex-1">
                                                        <h4 className={`text-base font-medium mb-1 ${task.completed ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                                                            {task.text}
                                                        </h4>
                                                    </div>

                                                    <div
                                                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${task.completed
                                                            ? 'bg-green-500 border-green-500'
                                                            : 'border-slate-500 hover:border-cyan-400 text-transparent hover:text-cyan-400'
                                                            }`}
                                                        onClick={(e) => { e.stopPropagation(); onToggle(task.id); }}
                                                    >
                                                        {task.completed && <ChevronRight size={14} className="text-black rotate-90" />}
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <TaskModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveTask}
                initialData={editingTask}
                defaultDate={modalDefaultDate}
                defaultTime={modalDefaultTime}
            />
        </>
    );
};
