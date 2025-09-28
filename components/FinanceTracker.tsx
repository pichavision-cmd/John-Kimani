import React from 'react';
// FIX: Corrected import path for types
import type { Transaction } from '../types';
// FIX: Corrected import path for icons
import { XCircleIcon, ChartBarIcon } from './icons';

const FinanceCard: React.FC<{ title: string, children: React.ReactNode }> = ({ title, children }) => (
    <div className="bg-slate-900/70 p-5 rounded-xl shadow-lg">
        <h3 className="text-lg font-bold text-brand-white mb-3">{title}</h3>
        <div className="space-y-2">
            {children}
        </div>
    </div>
);

const InfoRow: React.FC<{ label: string, value: React.ReactNode }> = ({ label, value }) => (
    <div className="flex justify-between items-center py-2 border-b border-slate-700/50 last:border-b-0">
        <span className="text-slate-400">{label}</span>
        <span className="font-bold text-white">{value}</span>
    </div>
);


const FinanceTracker: React.FC = () => {
    const titleId = 'finance-tracker-title';

    return (
         <div className="container mx-auto p-4 sm:p-6 min-h-screen flex flex-col items-center">
            <div className="bg-slate-800 w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col p-6">
                <div className="flex justify-between items-center mb-6 flex-shrink-0">
                    <h1 id={titleId} className="text-2xl font-bold flex items-center gap-3">
                        <ChartBarIcon className="w-7 h-7 text-brand-green" />
                        Finance Dashboard
                    </h1>
                     <a href="index.html" className="px-4 py-2 bg-slate-600 text-white font-semibold rounded-lg hover:bg-slate-500 transition-colors">
                        &larr; Back to Dashboard
                    </a>
                </div>
                <div className="flex-grow space-y-6">
                    <FinanceCard title="Earnings Summary">
                        <InfoRow label="Today’s Earnings" value="KSh 1,200" />
                        <InfoRow label="This Week" value="KSh 8,450" />
                        <InfoRow label="This Month" value="KSh 25,600" />
                    </FinanceCard>

                     <FinanceCard title="SACCO Contributions">
                        <InfoRow label="Dues (This Month)" value="KSh 200" />
                        <InfoRow label="Status" value={<span className="text-brand-green font-bold">Paid ✔</span>} />
                    </FinanceCard>

                     <FinanceCard title="Loan Overview">
                        <InfoRow label="Loan Balance" value="KSh 5,000" />
                        <InfoRow label="Next Payment" value="Oct 5" />
                    </FinanceCard>
                </div>
            </div>
        </div>
    );
};

export default FinanceTracker;