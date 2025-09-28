
import React from 'react';

interface DashboardButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
  title: string;
  color: 'blue' | 'red' | 'green' | 'yellow';
}

const colorClasses = {
    blue: 'bg-blue-600 hover:bg-blue-500 focus:ring-blue-400',
    red: 'bg-red-600 hover:bg-red-500 focus:ring-red-400',
    green: 'bg-green-600 hover:bg-green-500 focus:ring-green-400',
    yellow: 'bg-yellow-500 hover:bg-yellow-400 focus:ring-yellow-300',
};

const DashboardButton = React.forwardRef<HTMLButtonElement, DashboardButtonProps>(
    ({ icon, title, color, ...props }, ref) => {
  return (
    <button
      ref={ref}
      type="button"
      className={`p-4 rounded-xl shadow-lg transition-transform transform hover:-translate-y-1 text-white font-bold flex flex-col items-center justify-center aspect-square focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 ${colorClasses[color]}`}
      {...props}
    >
      <div className="mb-2">
        {icon}
      </div>
      <span className="text-center text-sm">{title}</span>
    </button>
  );
});

DashboardButton.displayName = 'DashboardButton';

export default DashboardButton;
