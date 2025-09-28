import React, { useState, useEffect } from 'react';
import { Alert } from '../../types';

declare global {
  interface Window {
    showToast: (msg: string) => void;
  }
}

const timeAgo = (isoString: string): string => {
    if(!isoString) return '';
    const diff = (Date.now() - new Date(isoString).getTime()) / 1000; // seconds
    if (diff < 60) return 'Just now';
    const m = Math.floor(diff / 60);
    if (m < 60) return `${m} min ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h} hr ago`;
    const d = Math.floor(h / 24);
    return `${d} d ago`;
};


// Function to generate demo data with fresh timestamps, as per the user's script.
const getDemoAlerts = (): Alert[] => [
    { id: 1, rider:'John Kimani', plate:'KMC 123A', type:'Accident', gps:'-1.11200, 36.64000', time:'', timeISO:new Date(Date.now()-120000).toISOString(), status: 'new' },
    { id: 2, rider:'Peter Njoroge', plate:'KMF 224B', type:'Theft', gps:'-1.10500, 36.63700', time:'', timeISO:new Date(Date.now()-1080000).toISOString(), status: 'acknowledged' },
    { id: 3, rider:'Jane Doe', plate:'KMD 456C', type:'Breakdown', gps:'-1.12500, 36.65700', time:'', timeISO:new Date(Date.now()-3600000).toISOString(), status: 'in-progress' }
];

const getStatusClasses = (status: Alert['status']) => {
    switch (status) {
        case 'new': return 'bg-red-500/20 text-red-400 border border-red-500/30';
        case 'acknowledged': return 'bg-blue-500/20 text-blue-400 border border-blue-500/30';
        case 'in-progress': return 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30';
        case 'resolved': return 'bg-green-500/20 text-green-400 border border-green-500/30';
        default: return 'bg-slate-500/20 text-slate-400 border border-slate-500/30';
    }
};

const EmergencyAlerts: React.FC = () => {
    const [alerts, setAlerts] = useState<Alert[]>([]);

    // This function is the single source of truth for loading/reloading alerts.
    const loadAndSetAlerts = () => {
        try {
            const storedAlertsRaw = localStorage.getItem('alerts');
            let alertsFromStorage: Alert[] = [];
            if (storedAlertsRaw) {
                alertsFromStorage = JSON.parse(storedAlertsRaw);
            }

            // Use demo alerts only if storage is completely empty, mirroring the user script's logic.
            const alertsToDisplay = alertsFromStorage.length > 0 ? alertsFromStorage : getDemoAlerts();
            
            const timedAlerts = alertsToDisplay.map(alert => ({
                ...alert,
                time: timeAgo(alert.timeISO),
            }));
            setAlerts(timedAlerts);

        } catch (error) {
            console.error("Failed to load alerts", error);
            // Fallback to demo data on error
            setAlerts(getDemoAlerts().map(alert => ({...alert, time: timeAgo(alert.timeISO)})));
        }
    };

    useEffect(() => {
        loadAndSetAlerts();
        
        const intervalId = setInterval(loadAndSetAlerts, 10000); // Refresh "time ago" periodically

        const handleStorageChange = (e: StorageEvent) => {
            if (e.key !== 'alerts') return;
            try {
                // Use functional update to get the most recent state for comparison
                setAlerts(currentAlerts => {
                    const latest = JSON.parse(e.newValue || '[]');
                    const prior = currentAlerts.length;

                    if (latest.length > prior) {
                        const newCount = latest.length - prior;
                        window.showToast(newCount === 1 ? 'New alert received' : `${newCount} new alerts`);
                    }

                    // This part is similar to loadAndSetAlerts, but uses the data from the event
                    const alertsToDisplay = latest.length > 0 ? latest : getDemoAlerts();
                    return alertsToDisplay.map(alert => ({
                        ...alert,
                        time: timeAgo(alert.timeISO),
                    }));
                });
            } catch (error) {
                console.error("Error handling storage change:", error);
            }
        };


        window.addEventListener('storage', handleStorageChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            clearInterval(intervalId);
        };
    }, []);

    const handleStatusChange = (alertId: number, newStatus: Alert['status']) => {
        const updatedAlertsWithTime = alerts.map(a => 
            a.id === alertId ? { ...a, status: newStatus } : a
        );
        setAlerts(updatedAlertsWithTime);
    
        const alertsForStorage = updatedAlertsWithTime.map(({ time, ...rest }) => rest);
        localStorage.setItem('alerts', JSON.stringify(alertsForStorage));
        
        window.showToast(`Alert status updated`);
    };

    const handleAddTestAlert = () => {
        try {
            const currentAlertsRaw = localStorage.getItem('alerts') || '[]';
            const currentAlerts: Alert[] = JSON.parse(currentAlertsRaw);

            const newAlert: Omit<Alert, 'time'> = {
                id: Date.now(),
                rider: 'Test Rider',
                plate: 'KAA 000A',
                type: 'Theft (Test)',
                gps: '-1.30000,36.80000',
                timeISO: new Date().toISOString(),
                status: 'new',
            };

            currentAlerts.unshift(newAlert as Alert);
            localStorage.setItem('alerts', JSON.stringify(currentAlerts));
            
            // The storage event will fire for other tabs. For this tab, we manually update.
            loadAndSetAlerts();
            window.showToast('Test alert added.');
        } catch (error) {
            console.error("Failed to add test alert", error);
            window.showToast('Could not add test alert.');
        }
    };

    const copyGPS = async (i: number) => {
        const a = alerts[i];
        const text = a && a.gps ? a.gps : '';
        if(!text){ window.showToast('No GPS available'); return; }
        try {
            await navigator.clipboard.writeText(text);
            window.showToast('GPS copied: ' + text);
        } catch (e) {
            // Fallback for older browsers
            const ta = document.createElement('textarea');
            ta.value = text; 
            document.body.appendChild(ta); 
            ta.select();
            try { 
                document.execCommand('copy'); 
                window.showToast('GPS copied: ' + text); 
            }
            catch { 
                window.showToast('Copy failed'); 
            }
            finally { 
                document.body.removeChild(ta); 
            }
        }
    };

    const handleCall = (name: string) => {
        alert(`Calling ${name}...`);
    };

    const handleNotify = (alertId: number) => {
        // The script uses index, but ID is more robust in React.
        alert(`Notified members about alert #${alertId}`);
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Emergency Alerts</h2>
                <button
                    onClick={handleAddTestAlert}
                    className="px-3 py-1.5 bg-slate-600 text-white rounded text-xs font-semibold hover:bg-slate-500 transition-colors"
                    aria-label="Add a test alert for demonstration"
                >
                    Add Test Alert
                </button>
            </div>
            <div className="space-y-4">
                {alerts.length > 0 ? alerts.map((alert, i) => (
                    <div key={alert.id} className="p-4 rounded-lg bg-slate-900/50 flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                        <div className="flex-1">
                            <p className="font-bold text-lg text-white flex items-center flex-wrap">
                                {alert.type || 'Emergency'}
                                <span className="font-normal text-slate-400 text-base mx-2">•</span>
                                <span className="font-normal text-slate-400 text-base">{alert.time}</span>
                                <span className={`ml-3 px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${getStatusClasses(alert.status)}`}>
                                    {alert.status.replace('-', ' ')}
                                </span>
                            </p>
                            <p className="text-sm text-slate-500 mt-1">
                                {alert.rider || 'Unknown'} • {alert.plate || 'No Plate'} • GPS: {alert.gps || 'N/A'}
                            </p>
                            <div className="mt-2 flex gap-2 flex-wrap">
                                <button
                                    onClick={() => copyGPS(i)}
                                    className="px-3 py-1.5 bg-slate-600 text-white rounded text-xs font-semibold hover:bg-slate-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={!alert.gps}
                                >
                                    Copy GPS
                                </button>
                                <a
                                    href={`https://maps.google.com/?q=${encodeURIComponent(alert.gps || '')}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`inline-block px-3 py-1.5 bg-slate-600 text-white rounded text-xs font-semibold hover:bg-slate-500 transition-colors ${!alert.gps ? 'opacity-50 pointer-events-none' : ''}`}
                                    aria-disabled={!alert.gps}
                                    tabIndex={!alert.gps ? -1 : undefined}
                                >
                                    Open in Maps
                                </a>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-2 self-start md:self-center">
                            <button
                                onClick={() => handleCall(alert.rider || 'Rider')}
                                className="px-3 py-1.5 bg-brand-blue text-white rounded text-sm font-semibold hover:bg-blue-600 transition-colors"
                            >
                                Call Rider
                            </button>
                             <button
                                onClick={() => handleNotify(alert.id)}
                                className="px-3 py-1.5 bg-slate-600 text-white rounded text-sm font-semibold hover:bg-slate-500 transition-colors"
                            >
                                Notify Members
                            </button>
                            <select
                                value={alert.status}
                                onChange={(e) => handleStatusChange(alert.id, e.target.value as Alert['status'])}
                                className="px-3 py-1.5 bg-slate-700 text-white rounded text-sm font-semibold hover:bg-slate-600 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-green capitalize"
                                aria-label={`Update status for alert ${alert.id}`}
                            >
                                <option value="new">New</option>
                                <option value="acknowledged">Acknowledged</option>
                                <option value="in-progress">In Progress</option>
                                <option value="resolved">Resolved</option>
                            </select>
                        </div>
                    </div>
                )) : (
                     <div className="text-center py-12 bg-slate-900/50 rounded-lg">
                        <p className="text-slate-400">No active emergency alerts.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EmergencyAlerts;