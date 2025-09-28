import React, { useState, useEffect, useRef, useMemo } from 'react';
// FIX: Corrected import path for types
import type { RideRequest, CustomerFeedback } from '../types';
// FIX: Corrected import path for icons
import { XCircleIcon, ClipboardListIcon, MapIcon, CalculatorIcon, StarIcon } from './icons';

interface JobsAndCustomersProps {
  onClose: () => void;
  triggerRef: React.RefObject<HTMLButtonElement>;
}

// Mock Data
const initialRideRequests: RideRequest[] = [
    { id: 1, customerName: 'Jane Doe', pickup: 'Sarit Centre', destination: 'Yaya Centre', estimatedFare: 350, status: 'pending' },
    { id: 2, customerName: 'Mark K.', pickup: 'Kenyatta Hospital', destination: 'CBD - Kencom', estimatedFare: 200, status: 'pending' },
    { id: 3, customerName: 'Lucy M.', pickup: 'Kilimani Primary', destination: 'Ngong Road', estimatedFare: 150, status: 'pending' },
];

const customerFeedbackData: CustomerFeedback[] = [
    { id: 1, customerName: 'Anonymous', rating: 5, comment: 'Very fast and safe rider. Reached my destination on time. Highly recommend!', date: new Date(Date.now() - 86400000).toISOString() },
    { id: 2, customerName: 'David', rating: 4, comment: 'Good trip, but the helmet provided was a bit loose. Otherwise, everything was great.', date: new Date(Date.now() - 2 * 86400000).toISOString() },
    { id: 3, customerName: 'Brenda', rating: 5, comment: 'Polite and professional. Knows all the shortcuts to avoid traffic. Will definitely call again.', date: new Date(Date.now() - 3 * 86400000).toISOString() },
];

const JobsAndCustomers: React.FC<JobsAndCustomersProps> = ({ onClose, triggerRef }) => {
    const [activeTab, setActiveTab] = useState<'stage' | 'fare' | 'ratings'>('stage');
    const [requests, setRequests] = useState<RideRequest[]>(initialRideRequests);

    // Fare Estimator State
    const [distance, setDistance] = useState('');
    const [baseFare, setBaseFare] = useState('100'); // Default KES 100
    const [farePerKm, setFarePerKm] = useState('30');  // Default KES 30
    const estimatedFare = useMemo(() => {
        const dist = parseFloat(distance);
        const base = parseFloat(baseFare);
        const perKm = parseFloat(farePerKm);
        if (!isNaN(dist) && !isNaN(base) && !isNaN(perKm) && dist > 0) {
            return base + (dist * perKm);
        }
        return null;
    }, [distance, baseFare, farePerKm]);
    
    const modalRef = useRef<HTMLDivElement>(null);
    const titleId = 'jobs-customers-title';
    
    // A11y: Focus trap and escape key handling
    useEffect(() => {
        const modalNode = modalRef.current;
        if (!modalNode) return;
        const focusableElements = modalNode.querySelectorAll<HTMLElement>('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        firstElement?.focus();

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') { onClose(); return; }
            if (e.key !== 'Tab') return;
            if (e.shiftKey) {
                if (document.activeElement === firstElement) { lastElement.focus(); e.preventDefault(); }
            } else {
                if (document.activeElement === lastElement) { firstElement.focus(); e.preventDefault(); }
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            triggerRef.current?.focus();
        };
    }, [onClose, triggerRef]);
    
    const handleRequestAction = (id: number, status: 'accepted' | 'declined') => {
        setRequests(prev => prev.map(req => req.id === id ? { ...req, status } : req));
    };

    const TabButton = ({ id, label, icon }: { id: typeof activeTab, label: string, icon: React.ReactNode }) => (
        <button role="tab" aria-selected={activeTab === id} aria-controls={`${id}-panel`} onClick={() => setActiveTab(id)} className={`flex-1 flex justify-center items-center gap-2 p-3 font-semibold rounded-t-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-brand-green ${activeTab === id ? 'bg-slate-700 text-brand-green' : 'bg-slate-800 text-slate-400 hover:bg-slate-700/50'}`}>
            {icon} {label}
        </button>
    );
    
    const StarRating = ({ rating }: { rating: number }) => (
        <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
                <StarIcon key={i} className={`w-5 h-5 ${i < rating ? 'text-yellow-400 fill-current' : 'text-slate-600'}`} />
            ))}
        </div>
    );

    return (
    <div ref={modalRef} className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true" aria-labelledby={titleId}>
      <div className="bg-slate-800 w-full max-w-4xl h-[90vh] rounded-2xl shadow-2xl flex flex-col">
        <header className="flex-shrink-0 p-6 border-b border-slate-700 flex justify-between items-center">
            <h2 id={titleId} className="text-2xl font-bold flex items-center gap-3">
                <ClipboardListIcon className="w-8 h-8 text-brand-green" />
                Jobs & Customers
            </h2>
            <button onClick={onClose} aria-label="Close jobs and customers">
                <XCircleIcon className="w-8 h-8 text-slate-400 hover:text-brand-red" />
            </button>
        </header>

        <div className="flex-shrink-0 flex border-b border-slate-700" role="tablist" aria-orientation="horizontal">
            <TabButton id="stage" label="Digital Stage" icon={<MapIcon className="w-5 h-5"/>} />
            <TabButton id="fare" label="Fare Estimator" icon={<CalculatorIcon className="w-5 h-5"/>} />
            <TabButton id="ratings" label="Customer Ratings" icon={<StarIcon className="w-5 h-5"/>} />
        </div>

        <main className="flex-grow overflow-y-auto p-6">
            {activeTab === 'stage' && (
                <div id="stage-panel" role="tabpanel" className="space-y-4">
                    {requests.filter(r => r.status === 'pending').length > 0 ? (
                        requests.filter(r => r.status === 'pending').map(req => (
                            <div key={req.id} className="bg-slate-900/50 p-4 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                <div>
                                    <h3 className="font-bold text-lg text-white">Ride for {req.customerName}</h3>
                                    <p className="text-sm text-slate-400">From: <span className="font-semibold text-slate-300">{req.pickup}</span></p>
                                    <p className="text-sm text-slate-400">To: <span className="font-semibold text-slate-300">{req.destination}</span></p>
                                </div>
                                <div className="text-left sm:text-right w-full sm:w-auto">
                                    <p className="text-xl font-bold text-brand-green">KES {req.estimatedFare}</p>
                                    <div className="flex gap-2 mt-2">
                                        {/* FIX: Corrected typo 'decline' to 'declined' to match the type definition for RideRequest status. */}
                                        <button onClick={() => handleRequestAction(req.id, 'declined')} className="flex-1 px-4 py-2 bg-slate-600 text-white font-semibold rounded-lg hover:bg-slate-500 transition-colors">Decline</button>
                                        <button onClick={() => handleRequestAction(req.id, 'accepted')} className="flex-1 px-4 py-2 bg-brand-red text-white font-semibold rounded-lg hover:bg-red-700 transition-colors">Accept</button>
                                    </div>
                                </div>
                            </div>
                        ))
                     ) : (
                        <div className="text-center py-12 bg-slate-900/50 rounded-lg">
                            <p className="text-slate-400">No new ride requests at the moment.</p>
                            <p className="text-sm text-slate-500 mt-2">Check back soon!</p>
                        </div>
                    )}
                </div>
            )}
            {activeTab === 'fare' && (
                <div id="fare-panel" role="tabpanel" className="max-w-md mx-auto">
                   <div className="bg-slate-900/50 p-6 rounded-lg space-y-4">
                       <h3 className="text-xl font-bold text-center">Fare Estimator</h3>
                       <div>
                           <label htmlFor="baseFare" className="block text-sm font-medium text-slate-300 mb-1">Base Fare (KES)</label>
                           <input type="number" id="baseFare" value={baseFare} onChange={(e) => setBaseFare(e.target.value)} className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg" />
                       </div>
                       <div>
                           <label htmlFor="farePerKm" className="block text-sm font-medium text-slate-300 mb-1">Fare per KM (KES)</label>
                           <input type="number" id="farePerKm" value={farePerKm} onChange={(e) => setFarePerKm(e.target.value)} className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg" />
                       </div>
                        <div>
                           <label htmlFor="distance" className="block text-sm font-medium text-slate-300 mb-1">Trip Distance (KM)</label>
                           <input type="number" id="distance" value={distance} onChange={(e) => setDistance(e.target.value)} placeholder="e.g., 5.5" className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg" />
                       </div>
                   </div>
                    {estimatedFare !== null && (
                        <div className="mt-6 text-center bg-brand-green/20 border border-brand-green p-4 rounded-lg">
                            <p className="text-slate-300">Estimated Trip Fare:</p>
                            <p className="text-4xl font-bold text-brand-white">KES {estimatedFare.toFixed(2)}</p>
                        </div>
                    )}
                </div>
            )}
            {activeTab === 'ratings' && (
                 <div id="ratings-panel" role="tabpanel" className="space-y-4">
                    {customerFeedbackData.map(feedback => (
                        <div key={feedback.id} className="bg-slate-900/50 p-4 rounded-lg">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="font-bold text-white">{feedback.customerName}</p>
                                    <p className="text-xs text-slate-500">{new Date(feedback.date).toLocaleDateString()}</p>
                                </div>
                                <StarRating rating={feedback.rating} />
                            </div>
                            <p className="text-slate-300 mt-2">{feedback.comment}</p>
                        </div>
                    ))}
                 </div>
            )}
        </main>
      </div>
    </div>
    );
};

export default JobsAndCustomers;