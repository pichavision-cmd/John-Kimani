import React, { useState, useEffect } from 'react';
import MemberManagement from './MemberManagement';
import AnnouncementsBoard from './AnnouncementsBoard';
import FinanceMonitor from './FinanceMonitor';
import EmergencyAlerts from './EmergencyAlerts';
import CommunicationLog from './CommunicationLog';
import { BuildingLibraryIcon } from '../icons';

type AdminTab = 'members' | 'announcements' | 'finance' | 'emergency' | 'communications';

// Helper functions to manage alert notification state
function getAlertsFromStorage(){
  try { return JSON.parse(localStorage.getItem('alerts') || '[]'); }
  catch { return []; }
}

function getSeenCount(){
  return parseInt(localStorage.getItem('admin_seen_count') || '0', 10);
}
function setSeenCount(n){
  localStorage.setItem('admin_seen_count', String(n));
}

const AdminDashboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState<AdminTab>('members');
    const [newAlertCount, setNewAlertCount] = useState(0);

    useEffect(() => {
        const updateAlertCount = () => {
            const totalAlerts = getAlertsFromStorage().length;
            const seenCount = getSeenCount();
            const newCount = Math.max(0, totalAlerts - seenCount);
            setNewAlertCount(newCount);
        };

        updateAlertCount(); // Initial check

        // Listen for changes from other tabs to keep the count in sync
        window.addEventListener('storage', updateAlertCount);

        return () => {
            window.removeEventListener('storage', updateAlertCount);
        };
    }, []);

    const renderContent = () => {
        switch (activeTab) {
            case 'members':
                return <MemberManagement />;
            case 'announcements':
                return <AnnouncementsBoard />;
            case 'finance':
                return <FinanceMonitor />;
            case 'emergency':
                return <EmergencyAlerts />;
            case 'communications':
                return <CommunicationLog />;
            default:
                return null;
        }
    };

    const handleTabClick = (tab: AdminTab) => {
        if (tab === 'emergency') {
            const totalAlerts = getAlertsFromStorage().length;
            setSeenCount(totalAlerts);
            setNewAlertCount(0);
        }
        setActiveTab(tab);
    };

    const TabButton: React.FC<{ tab: AdminTab; label: string; badgeCount?: number }> = ({ tab, label, badgeCount }) => (
        <button
            onClick={() => handleTabClick(tab)}
            className={`flex items-center px-3 py-2.5 border border-slate-700 rounded-lg bg-slate-800 text-sm font-semibold cursor-pointer hover:bg-slate-700 transition-colors
                ${activeTab === tab ? 'bg-brand-green text-slate-900 border-brand-green' : 'text-slate-300'}`}
        >
            {label}
            {badgeCount && badgeCount > 0 && (
                <span className="ml-2 bg-brand-red text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    {badgeCount}
                </span>
            )}
        </button>
    );

    return (
        <div className="min-h-screen">
            <header className="p-4 bg-slate-800 flex items-center gap-3 border-b border-slate-700 sticky top-0 z-10">
                <BuildingLibraryIcon className="w-8 h-8 text-brand-green" />
                <h1 className="text-lg font-bold">Boda Boda SACCO Admin</h1>
            </header>
            <main className="max-w-4xl mx-auto p-4">
                <div className="flex gap-2 flex-wrap mb-4">
                    <TabButton tab="members" label="Member Management" />
                    <TabButton tab="announcements" label="Announcements" />
                    <TabButton tab="finance" label="Finance Monitoring" />
                    <TabButton tab="emergency" label="Emergency Alerts" badgeCount={newAlertCount} />
                    <TabButton tab="communications" label="Communications" />
                </div>
                <div className="p-4 bg-slate-800 rounded-lg">
                    {renderContent()}
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;