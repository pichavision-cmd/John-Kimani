import React, { useState, useEffect, useRef } from 'react';
// FIX: Corrected import path for icons
import { XCircleIcon, SearchIcon, LocationMarkerIcon, UsersIcon, BuildingLibraryIcon } from './icons';

interface SaccoFinderProps {
  onClose: () => void;
  triggerRef: React.RefObject<HTMLButtonElement>;
}

export const saccoData = [
    { id: 1, name: 'Boda Boda SACCO Ltd.', location: 'Nairobi', members: 15000, assetBase: 'KES 500M' },
    { id: 2, name: '2Wheels Savings & Credit', location: 'Mombasa', members: 8000, assetBase: 'KES 250M' },
    { id: 3, name: 'Rider\'s Pride SACCO', location: 'Kisumu', members: 12000, assetBase: 'KES 350M' },
    { id: 4, name: 'Upendo Boda SACCO', location: 'Nairobi', members: 25000, assetBase: 'KES 800M' },
    { id: 5, name: 'Highway Riders SACCO', location: 'Nakuru', members: 6000, assetBase: 'KES 180M' },
    { id: 6, name: 'Coast Boda Operators SACCO', location: 'Mombasa', members: 11000, assetBase: 'KES 310M' },
];


const SaccoFinder: React.FC<SaccoFinderProps> = ({ onClose, triggerRef }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
    const [filteredSaccos, setFilteredSaccos] = useState(saccoData);
    const modalRef = useRef<HTMLDivElement>(null);
    const titleId = 'sacco-finder-title';

    useEffect(() => {
        const timerId = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 300); // 300ms debounce delay

        return () => {
            clearTimeout(timerId);
        };
    }, [searchTerm]);

    useEffect(() => {
        const results = saccoData.filter(sacco => 
            sacco.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
            sacco.location.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
        );
        setFilteredSaccos(results);
    }, [debouncedSearchTerm]);

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


    return (
    <div ref={modalRef} className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true" aria-labelledby={titleId}>
      <div className="bg-slate-800 w-full max-w-3xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col p-6">
        <div className="flex justify-between items-center mb-4 flex-shrink-0">
          <h2 id={titleId} className="text-2xl font-bold flex items-center gap-3">
            <BuildingLibraryIcon className="w-7 h-7 text-brand-green" />
            Find a SACCO
          </h2>
          <button onClick={onClose} aria-label="Close SACCO finder">
            <XCircleIcon className="w-8 h-8 text-slate-400 hover:text-brand-red" />
          </button>
        </div>

        <div className="mb-4 flex-shrink-0">
            <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <SearchIcon className="w-5 h-5 text-slate-400" />
                </span>
                 <label htmlFor="sacco-search" className="sr-only">Search for a SACCO by name or location</label>
                <input
                    id="sacco-search"
                    type="text"
                    placeholder="Search by name or location..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-brand-green"
                />
            </div>
        </div>
        
        <div className="flex-grow overflow-y-auto pr-2">
            {filteredSaccos.length > 0 ? (
                <ul className="space-y-4">
                    {filteredSaccos.map(sacco => (
                        <li key={sacco.id} className="bg-slate-900/70 p-4 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center">
                            <div className="flex-1 mb-3 sm:mb-0">
                                <h3 className="font-bold text-lg text-white">{sacco.name}</h3>
                                <div className="flex items-center flex-wrap gap-4 text-sm text-slate-400 mt-1">
                                    <span className="flex items-center gap-1.5"><LocationMarkerIcon className="w-4 h-4" /> {sacco.location}</span>
                                    <span className="flex items-center gap-1.5"><UsersIcon className="w-4 h-4" /> {sacco.members.toLocaleString()} Members</span>
                                </div>
                                <p className="text-sm text-slate-300 mt-2">Asset Base: <span className="font-semibold">{sacco.assetBase}</span></p>
                            </div>
                            <button className="w-full sm:w-auto px-4 py-2 bg-brand-red text-white font-semibold rounded-lg hover:bg-red-700 transition duration-300 text-sm">
                                View Details
                            </button>
                        </li>
                    ))}
                </ul>
            ) : (
                <div className="text-center py-12 bg-slate-900/50 rounded-lg">
                    <p className="text-slate-400">No SACCOs found matching your search.</p>
                </div>
            )}
        </div>
      </div>
    </div>
    );
};

export default SaccoFinder;