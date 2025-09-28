import React from 'react';
import { ChartBarIcon } from '../icons';

const FinanceCard: React.FC<{ title: string; value: string; description: string }> = ({ title, value, description }) => (
    <div className="bg-slate-900/50 p-4 rounded-lg">
        <h3 className="text-sm text-slate-400">{title}</h3>
        <p className="text-2xl font-bold text-white mt-1">{value}</p>
        <p className="text-xs text-slate-500 mt-2">{description}</p>
    </div>
);

const FinanceMonitor: React.FC = () => {
    return (
        <div>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <ChartBarIcon className="w-6 h-6" />
                Finance Overview
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <FinanceCard title="Total Assets" value="KES 800M" description="+5.2% from last month" />
                <FinanceCard title="Loans Disbursed" value="KES 120M" description="312 active loans" />
                <FinanceCard title="Member Savings" value="KES 450M" description="25,000 members" />
            </div>
        </div>
    );
};

export default FinanceMonitor;