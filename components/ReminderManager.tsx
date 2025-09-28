import React, { useState, useEffect, useRef } from 'react';
// FIX: Corrected import path for types
import type { Reminder } from '../types';
// FIX: Corrected import path for icons
import { BellIcon, TrashIcon, XCircleIcon } from './icons';

interface ReminderManagerProps {
  onClose: () => void;
  triggerRef: React.RefObject<HTMLButtonElement>;
}

const ReminderManager: React.FC<ReminderManagerProps> = ({ onClose, triggerRef }) => {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [newReminderText, setNewReminderText] = useState('');
  const [newReminderDate, setNewReminderDate] = useState('');
  const [newReminderTime, setNewReminderTime] = useState('');

  const modalRef = useRef<HTMLDivElement>(null);
  const titleId = 'reminder-manager-title';


  useEffect(() => {
    try {
      const storedReminders = localStorage.getItem('boda-reminders');
      if (storedReminders) {
        setReminders(JSON.parse(storedReminders));
      }
    } catch (error) {
      console.error("Failed to load reminders from localStorage", error);
    }
  }, []);

  // A11y: Focus trap and escape key handling
  useEffect(() => {
    const modalNode = modalRef.current;
    if (!modalNode) return;

    const focusableElements = modalNode.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    firstElement?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
            onClose();
            return;
        }

        if (e.key !== 'Tab') return;

        if (e.shiftKey) {
            if (document.activeElement === firstElement) {
                lastElement.focus();
                e.preventDefault();
            }
        } else {
            if (document.activeElement === lastElement) {
                firstElement.focus();
                e.preventDefault();
            }
        }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
        document.removeEventListener('keydown', handleKeyDown);
        triggerRef.current?.focus();
    };
}, [onClose, triggerRef]);


  const handleAddReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReminderText.trim() || !newReminderDate || !newReminderTime) {
      alert('Please fill out all fields for the reminder.');
      return;
    }

    const dateTime = new Date(`${newReminderDate}T${newReminderTime}`);
    if (isNaN(dateTime.getTime())) {
        alert("Invalid date or time provided.");
        return;
    }

    const newReminder: Reminder = {
      id: Date.now(),
      text: newReminderText.trim(),
      dateTime: dateTime.toISOString(),
    };

    const updatedReminders = [...reminders, newReminder].sort((a,b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());
    setReminders(updatedReminders);
    localStorage.setItem('boda-reminders', JSON.stringify(updatedReminders));

    setNewReminderText('');
    setNewReminderDate('');
    setNewReminderTime('');
  };

  const handleDeleteReminder = (id: number) => {
    const updatedReminders = reminders.filter(r => r.id !== id);
    setReminders(updatedReminders);
    localStorage.setItem('boda-reminders', JSON.stringify(updatedReminders));
  };
  
  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
    });
  }

  return (
    <div ref={modalRef} className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true" aria-labelledby={titleId}>
      <div className="bg-slate-800 w-full max-w-2xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col p-6">
        <div className="flex justify-between items-center mb-4 flex-shrink-0">
          <h2 id={titleId} className="text-2xl font-bold flex items-center gap-3">
            <BellIcon className="w-7 h-7 text-brand-green" />
            Set Your Reminders
          </h2>
          <button onClick={onClose} aria-label="Close reminder manager">
            <XCircleIcon className="w-8 h-8 text-slate-400 hover:text-brand-red" />
          </button>
        </div>
        
        <div className="flex-grow overflow-y-auto pr-2">
            <h3 className="text-lg font-semibold text-slate-300 mb-3">Upcoming Reminders</h3>
            {reminders.length > 0 ? (
                <ul className="space-y-3">
                    {reminders.map(reminder => (
                        <li key={reminder.id} className="bg-slate-900/70 p-4 rounded-lg flex justify-between items-center">
                            <div>
                                <p className="font-semibold text-white">{reminder.text}</p>
                                <p className="text-sm text-slate-400">{formatDate(reminder.dateTime)}</p>
                            </div>
                            <button onClick={() => handleDeleteReminder(reminder.id)} aria-label={`Delete reminder: ${reminder.text}`}>
                                <TrashIcon className="w-6 h-6 text-slate-500 hover:text-red-500 transition-colors" />
                            </button>
                        </li>
                    ))}
                </ul>
            ) : (
                <div className="text-center py-8 bg-slate-900/50 rounded-lg">
                    <p className="text-slate-400">You have no upcoming reminders.</p>
                </div>
            )}
        </div>

        <form onSubmit={handleAddReminder} className="mt-6 border-t border-slate-700 pt-6 flex-shrink-0">
          <h3 className="text-lg font-semibold text-slate-300 mb-4">Add New Reminder</h3>
          <div className="space-y-4">
            <label htmlFor="reminder-text" className="sr-only">Reminder task</label>
            <input
              id="reminder-text"
              type="text"
              value={newReminderText}
              onChange={(e) => setNewReminderText(e.target.value)}
              placeholder="e.g., Renew insurance policy"
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-brand-green"
              aria-required="true"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="reminder-date" className="sr-only">Reminder date</label>
                <input
                  id="reminder-date"
                  type="date"
                  value={newReminderDate}
                  onChange={(e) => setNewReminderDate(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-brand-green"
                  aria-required="true"
                />
              </div>
              <div>
                <label htmlFor="reminder-time" className="sr-only">Reminder time</label>
                <input
                  id="reminder-time"
                  type="time"
                  value={newReminderTime}
                  onChange={(e) => setNewReminderTime(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-brand-green"
                  aria-required="true"
                />
              </div>
            </div>
          </div>
          <button type="submit" className="w-full mt-4 py-3 px-4 bg-brand-red text-white font-semibold rounded-lg hover:bg-red-700 transition duration-300">
            Add Reminder
          </button>
        </form>
      </div>
    </div>
  );
};

export default ReminderManager;