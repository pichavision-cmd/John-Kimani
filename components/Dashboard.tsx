import React, { useState, useRef } from 'react';
import Header from './Header';
import InfoCard from './InfoCard';
import DashboardButton from './DashboardButton';
import CommunityForum from './CommunityForum';
import VoiceAssistant from './VoiceAssistant';
import BottomNavBar from './BottomNavBar';
import RiderProfile from './RiderProfile';
import ReminderManager from './ReminderManager';
import Notification from './Notification';
import SaccoFinder from './SaccoFinder';
import FinanceTracker from './FinanceTracker';
import TrainingAndUpdates from './TrainingAndUpdates';
import JobsAndCustomers from './JobsAndCustomers';
import Marketplace from './Marketplace';
import MusicAndGames from './MusicAndGames';
import WellnessAndFamily from './WellnessAndFamily';
import SafetyHub from './SafetyHub';

import {
  BellIcon,
  UserCircleIcon,
  BuildingLibraryIcon,
  ChartBarIcon,
  AcademicCapIcon,
  ClipboardListIcon,
  ShoppingCartIcon,
  MusicalNoteIcon,
  HeartIcon,
  ShieldCheckIcon,
  UsersIcon,
  XCircleIcon,
  ExclamationTriangleIcon
} from './icons';
import { Reminder, Alert } from '../types';

export type ScreenName = 'home' | 'finance' | 'safety' | 'community' | 'settings' | 'music';

declare global {
  interface Window {
    showToast: (msg: string) => void;
  }
}

const Dashboard: React.FC = () => {
    const [activeModal, setActiveModal] = useState<string | null>(null);
    const [activeScreen, setActiveScreen] = useState<ScreenName>('home');

    //Refs for buttons to return focus
    const profileButtonRef = useRef<HTMLButtonElement>(null);
    const reminderButtonRef = useRef<HTMLButtonElement>(null);
    const saccoButtonRef = useRef<HTMLButtonElement>(null);
    const trainingButtonRef = useRef<HTMLButtonElement>(null);
    const jobsButtonRef = useRef<HTMLButtonElement>(null);
    const marketplaceButtonRef = useRef<HTMLButtonElement>(null);
    const wellnessButtonRef = useRef<HTMLButtonElement>(null);

    // Placeholder refs for nav bar items since they are in a child component
    const safetyNavRef = useRef<HTMLButtonElement>(null);
    // FIX: Changed the ref type to HTMLDivElement to match the element it's attached to.
    const communityNavRef = useRef<HTMLDivElement>(null);
    const settingsNavRef = useRef<HTMLButtonElement>(null);


    const [upcomingReminder, setUpcomingReminder] = useState<Reminder | null>(null);

    React.useEffect(() => {
        // Mock checking for reminders
        const checkReminders = () => {
             try {
                const storedReminders = localStorage.getItem('boda-reminders');
                if (storedReminders) {
                    const reminders: Reminder[] = JSON.parse(storedReminders);
                    const now = new Date();
                    const nextReminder = reminders.find(r => new Date(r.dateTime) > now);
                    if (nextReminder && new Date(nextReminder.dateTime).getTime() - now.getTime() < 5 * 60 * 1000) { // 5 minutes
                         // For demo, just pop a static one. A real app would be more robust.
                        if (!localStorage.getItem(`notif-shown-${nextReminder.id}`)) {
                           setUpcomingReminder(nextReminder);
                           localStorage.setItem(`notif-shown-${nextReminder.id}`, 'true');
                        }
                    }
                }
            } catch (error) {
                console.error("Failed to check reminders", error);
            }
        };
        const interval = setInterval(checkReminders, 1000 * 30); // Check every 30 seconds
        return () => clearInterval(interval);
    }, []);

    const handleDismissNotification = (id: number) => {
        if (upcomingReminder && upcomingReminder.id === id) {
            setUpcomingReminder(null);
        }
    };
    
    const handleSnoozeNotification = (id: number) => {
         if (upcomingReminder && upcomingReminder.id === id) {
            // A real app would reschedule this. For now, just dismiss.
            setUpcomingReminder(null);
            alert("Snoozed for 5 minutes (demo)");
        }
    };

    const addPanicAlert = (coords: GeolocationCoordinates | null) => {
        try {
            const alerts: Alert[] = JSON.parse(localStorage.getItem('alerts') || '[]');
            const now = new Date();
            const alertObj: Alert = {
                id: Date.now(),
                rider: 'John Kamau',
                plate: 'KMC D123X',
                type: 'Accident',
                gps: coords ? `${coords.latitude.toFixed(5)}, ${coords.longitude.toFixed(5)}` : 'GPS unavailable',
                timeISO: now.toISOString(),
                time: 'Just now',
                status: 'new',
            };
            alerts.unshift(alertObj);
            localStorage.setItem('alerts', JSON.stringify(alerts));

            window.showToast('Panic alert sent (with location if allowed)');

        } catch (error) {
            console.error("Failed to add panic alert", error);
            window.showToast('Failed to send alert.');
        }
    };

    const requestLocationAndSave = () => {
        if (!('geolocation' in navigator)) {
            addPanicAlert(null);
            return;
        }
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                addPanicAlert(pos.coords);
            },
            (err) => {
                console.warn('Geolocation error:', err.message);
                addPanicAlert(null); // fallback if denied or error
            },
            {
                enableHighAccuracy: true,
                timeout: 8000,
                maximumAge: 0
            }
        );
    };


    const openModal = (modalName: string) => setActiveModal(modalName);
    const closeModal = () => {
        setActiveModal(null);
        setActiveScreen('home'); // Reset to home screen when any modal closes
    };

    const handleNavigate = (screen: ScreenName) => {
        // Handle internal screen changes and modals first
        if (screen === 'home') {
            setActiveScreen(screen);
            if (activeModal) closeModal();
        } else if (screen === 'safety' || screen === 'community') {
            setActiveScreen(screen);
            openModal(screen);
        }
        // Handle external page redirects
        else if (screen === 'finance') {
            window.location.href = 'finance.html';
        } else if (screen === 'music') {
            window.location.href = 'music.html';
        } else if (screen === 'settings') {
            window.location.href = 'admin.html';
        }
    };

    return (
        <div className="flex flex-col min-h-screen">
             <Header onProfileClick={() => openModal('profile')} />
             <main className="flex-1 container mx-auto p-4 space-y-6">
                <section aria-labelledby="quick-stats-heading">
                    <h2 id="quick-stats-heading" className="sr-only">Quick Stats</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <InfoCard title="Earnings Today" value="KES 1,250" icon={<ChartBarIcon className="w-8 h-8"/>} />
                        <InfoCard title="Safety Score" value="98%" icon={<ShieldCheckIcon className="w-8 h-8"/>} />
                        <InfoCard title="Total Trips" value="15" icon={<UserCircleIcon className="w-8 h-8"/>} />
                        <InfoCard title="Next Reminder" value="Insurance" icon={<BellIcon className="w-8 h-8"/>} />
                    </div>
                </section>
                
                <section aria-labelledby="dashboard-actions-heading">
                    <h2 id="dashboard-actions-heading" className="sr-only">Dashboard Actions</h2>
                     <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-5 gap-4">
                        <DashboardButton ref={reminderButtonRef} icon={<BellIcon className="w-8 h-8"/>} title="Reminders" color="red" onClick={() => openModal('reminders')} />
                        <DashboardButton ref={saccoButtonRef} icon={<BuildingLibraryIcon className="w-8 h-8"/>} title="SACCOs" color="blue" onClick={() => openModal('sacco')} />
                        <DashboardButton icon={<ChartBarIcon className="w-8 h-8"/>} title="Finance" color="green" onClick={() => handleNavigate('finance')} />
                        <DashboardButton ref={trainingButtonRef} icon={<AcademicCapIcon className="w-8 h-8"/>} title="Training" color="yellow" onClick={() => openModal('training')} />
                        <DashboardButton ref={jobsButtonRef} icon={<ClipboardListIcon className="w-8 h-8"/>} title="Jobs" color="red" onClick={() => openModal('jobs')} />
                        <DashboardButton ref={marketplaceButtonRef} icon={<ShoppingCartIcon className="w-8 h-8"/>} title="Marketplace" color="blue" onClick={() => openModal('marketplace')} />
                        <DashboardButton icon={<MusicalNoteIcon className="w-8 h-8"/>} title="Music/Games" color="green" onClick={() => handleNavigate('music')} />
                        <DashboardButton ref={wellnessButtonRef} icon={<HeartIcon className="w-8 h-8"/>} title="Wellness" color="yellow" onClick={() => openModal('wellness')} />
                    </div>
                </section>

                <section aria-labelledby="community-forum-heading">
                    <h2 id="community-forum-heading" className="text-xl font-bold text-brand-white mb-4">Community Forum</h2>
                    <CommunityForum />
                </section>
             </main>

            <button
                id="panicBtn"
                onClick={requestLocationAndSave}
                aria-label="Trigger Panic Alert"
                className="fixed bottom-6 left-6 bg-red-600 text-white p-4 rounded-full shadow-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-red-500 transition-transform transform hover:scale-110 z-50 animate-pulse"
            >
                <ExclamationTriangleIcon className="w-8 h-8"/>
            </button>

             <VoiceAssistant />
             <BottomNavBar activeScreen={activeScreen} onNavigate={handleNavigate} />

             {/* Dashboard Modals */}
             {activeModal === 'reminders' && <ReminderManager onClose={closeModal} triggerRef={reminderButtonRef} />}
             {activeModal === 'sacco' && <SaccoFinder onClose={closeModal} triggerRef={saccoButtonRef} />}
             {activeModal === 'training' && <TrainingAndUpdates onClose={closeModal} triggerRef={trainingButtonRef} />}
             {activeModal === 'jobs' && <JobsAndCustomers onClose={closeModal} triggerRef={jobsButtonRef} />}
             {activeModal === 'marketplace' && <Marketplace onClose={closeModal} triggerRef={marketplaceButtonRef} />}
             {activeModal === 'wellness' && <WellnessAndFamily onClose={closeModal} triggerRef={wellnessButtonRef} />}

             {/* Nav Bar Modals */}
             {activeModal === 'profile' && <RiderProfile onClose={closeModal} triggerRef={activeScreen === 'settings' ? settingsNavRef : profileButtonRef} />}
             {activeModal === 'safety' && <SafetyHub onClose={closeModal} triggerRef={safetyNavRef} />}
             {activeModal === 'community' && (
                <div ref={communityNavRef} className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true" aria-labelledby="community-modal-title">
                    <div className="bg-slate-800 w-full max-w-4xl h-[90vh] rounded-2xl shadow-2xl flex flex-col">
                        <header className="flex-shrink-0 p-6 border-b border-slate-700 flex justify-between items-center">
                            <h2 id="community-modal-title" className="text-2xl font-bold flex items-center gap-3">
                                <UsersIcon className="w-8 h-8 text-brand-green" />
                                Community Forum
                            </h2>
                            <button onClick={closeModal} aria-label="Close Community Forum">
                                <XCircleIcon className="w-8 h-8 text-slate-400 hover:text-brand-red" />
                            </button>
                        </header>
                        <main className="flex-grow overflow-y-auto p-0 sm:p-6">
                            <CommunityForum />
                        </main>
                    </div>
                </div>
             )}

             {upcomingReminder && <Notification reminder={upcomingReminder} onDismiss={handleDismissNotification} onSnooze={handleSnoozeNotification} />}
        </div>
    );
};

export default Dashboard;