import React, { useState, useEffect } from 'react';

interface HeaderProps {
    onProfileClick: () => void;
}

const Header = React.forwardRef<HTMLDivElement, HeaderProps>(({ onProfileClick }, ref) => {
    const [gpsStatus, setGpsStatus] = useState<'on' | 'off' | 'checking'>('checking');

    useEffect(() => {
        // Check for permissions API support
        if (!navigator.permissions) {
            setGpsStatus('off'); // Fallback for older browsers
            return;
        }

        const handlePermissionChange = (permissionStatus: PermissionStatus) => {
            setGpsStatus(permissionStatus.state === 'granted' ? 'on' : 'off');
        };

        // Query the initial permission status
        navigator.permissions.query({ name: 'geolocation' }).then(permissionStatus => {
            handlePermissionChange(permissionStatus);
            // Listen for changes in the permission status
            permissionStatus.onchange = () => handlePermissionChange(permissionStatus);
        }).catch(() => {
            // If the query fails, assume GPS is off
            setGpsStatus('off');
        });
        
    }, []);


  return (
    <header className="bg-slate-800/80 backdrop-blur-sm sticky top-0 z-10 p-4" role="banner">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center gap-3">
            <button onClick={onProfileClick} className="focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-brand-green rounded-full">
                <img src="https://picsum.photos/seed/user/48/48" alt="User Avatar" className="w-12 h-12 rounded-full border-2 border-slate-600" />
            </button>
            <div>
                <h1 className="text-lg font-bold text-brand-white">John Kamau</h1>
                <p className="text-sm text-slate-400">ID: 12345678</p>
            </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-300 font-medium">
            <span
                title="SACCO Membership Active"
                className="chip on"
            >
                SACCO ON
            </span>
            <span
                title="Insurance Policy Active"
                className="chip on"
            >
                INSURANCE ON
            </span>
             <span
                id="gpsChip"
                title={`GPS Status: ${gpsStatus.toUpperCase()}`}
                className={`chip ${gpsStatus === 'on' ? 'on' : 'off'}`}
            >
                {gpsStatus === 'on' ? 'GPS ON' : 'GPS OFF'}
            </span>
        </div>
      </div>
    </header>
  );
});

Header.displayName = 'Header';

export default Header;