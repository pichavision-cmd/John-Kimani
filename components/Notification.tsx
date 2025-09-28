import React, { useEffect } from 'react';
// FIX: Corrected import path for types
import type { Reminder } from '../types';
// FIX: Corrected import path for icons
import { XCircleIcon, ClockIcon, BellIcon } from './icons';

interface NotificationProps {
  reminder: Reminder;
  onDismiss: (id: number) => void;
  onSnooze: (id: number) => void;
}

const Notification: React.FC<NotificationProps> = ({ reminder, onDismiss, onSnooze }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(reminder.id);
    }, 10000); // Auto-dismiss after 10 seconds

    return () => clearTimeout(timer);
  }, [reminder.id, onDismiss]);

  return (
    <div
      className="fixed bottom-24 right-6 w-full max-w-sm bg-slate-700 rounded-xl shadow-2xl p-4 z-50 animate-slide-in"
      role="alert"
      aria-live="assertive"
    >
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 text-brand-green pt-1">
            <BellIcon className="h-6 w-6" />
        </div>
        <div className="flex-1">
          <p className="font-bold text-white">Reminder</p>
          <p className="text-slate-300">{reminder.text}</p>
          <div className="mt-3 flex gap-3">
            <button
              onClick={() => onSnooze(reminder.id)}
              className="flex-1 inline-flex justify-center items-center gap-2 px-3 py-1.5 bg-slate-600 text-white text-sm font-semibold rounded-md hover:bg-slate-500 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-700 focus:ring-brand-green"
              aria-label={`Snooze reminder: ${reminder.text} for 5 minutes`}
            >
              <ClockIcon className="w-4 h-4" />
              Snooze (5m)
            </button>
            <button
              onClick={() => onDismiss(reminder.id)}
              className="flex-1 inline-flex justify-center items-center gap-2 px-3 py-1.5 bg-brand-red text-white text-sm font-semibold rounded-md hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-700 focus:ring-brand-red"
               aria-label={`Dismiss reminder: ${reminder.text}`}
            >
              <XCircleIcon className="w-4 h-4" />
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notification;