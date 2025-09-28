import React from 'react';
// FIX: Corrected import path for icons
import { HomeIcon, ChartBarIcon, TrafficLightIcon, UsersIcon, Cog6ToothIcon } from './icons';
import type { ScreenName } from './Dashboard';

interface BottomNavBarProps {
    activeScreen: ScreenName;
    onNavigate: (screen: ScreenName) => void;
}

const BottomNavBar: React.FC<BottomNavBarProps> = ({ activeScreen, onNavigate }) => {
    
    const NavItem: React.FC<{
        icon: React.ReactNode, 
        label: string, 
        screen: ScreenName,
        isActive?: boolean
    }> = ({ icon, label, screen, isActive }) => (
        <button 
            onClick={() => onNavigate(screen)}
            className={`flex flex-col items-center justify-center w-full pt-2 pb-1 transition-colors duration-200 ${isActive ? 'text-brand-red' : 'text-slate-400 hover:text-white'}`}
            aria-current={isActive ? 'page' : undefined}
        >
            {icon}
            <span className="text-xs">{label}</span>
        </button>
    );

    return (
        <footer className="sticky bottom-0 bg-slate-800 border-t border-slate-700 z-20" role="navigation" aria-label="Main">
            <div className="container mx-auto flex justify-around">
                <NavItem icon={<HomeIcon className="w-6 h-6 mb-1"/>} label="Home" screen="home" isActive={activeScreen === 'home'} />
                <NavItem icon={<ChartBarIcon className="w-6 h-6 mb-1"/>} label="Finance" screen="finance" isActive={activeScreen === 'finance'} />
                <NavItem icon={<TrafficLightIcon className="w-6 h-6 mb-1"/>} label="Safety" screen="safety" isActive={activeScreen === 'safety'} />
                <NavItem icon={<UsersIcon className="w-6 h-6 mb-1"/>} label="Community" screen="community" isActive={activeScreen === 'community'} />
                <NavItem icon={<Cog6ToothIcon className="w-6 h-6 mb-1"/>} label="Settings" screen="settings" isActive={activeScreen === 'settings'} />
            </div>
        </footer>
    );
};

export default BottomNavBar;