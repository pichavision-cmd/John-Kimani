import React, { useState, useEffect, useRef, useMemo } from 'react';
// FIX: Corrected import path for types
import type { SafetyVideo, GovNotice, FinancialProduct } from '../types';
// FIX: Corrected import path for icons
import { XCircleIcon, AcademicCapIcon, VideoCameraIcon, MegaphoneIcon, ShoppingCartIcon } from './icons';

interface TrainingAndUpdatesProps {
  onClose: () => void;
  triggerRef: React.RefObject<HTMLButtonElement>;
}

// Mock Data
const safetyVideosData: SafetyVideo[] = [
    { id: 1, title: 'Defensive Riding Techniques', description: 'Learn how to anticipate dangers on the road.', thumbnailUrl: 'https://picsum.photos/seed/safety1/400/225', videoUrl: '#', language: 'English' },
    // FIX: Corrected object property from a descriptive string to 'title'. The Swahili title for 'Defensive Riding Techniques' was incorrectly used as a key.
    { id: 2, title: 'Mbinu za Kujilinda Barabarani', description: 'Jifunze jinsi ya kutambua hatari barabarani.', thumbnailUrl: 'https://picsum.photos/seed/safety1/400/225', videoUrl: '#', language: 'Swahili' },
    { id: 3, title: 'Proper Helmet Usage', description: 'Ensure your helmet is worn correctly for maximum protection.', thumbnailUrl: 'https://picsum.photos/seed/safety2/400/225', videoUrl: '#', language: 'English' },
    // FIX: Corrected object property from a descriptive string to 'title'. The Swahili title for 'Proper Helmet Usage' was incorrectly used as a key.
    { id: 4, title: 'Matumizi Sahihi ya Helmet', description: 'Hakikisha umevaa kofia yako ipasavyo kwa ulinzi kamili.', thumbnailUrl: 'https://picsum.photos/seed/safety2/400/225', videoUrl: '#', language: 'Swahili' },
    { id: 5, title: 'Navigating Intersections Safely', description: 'Tips for crossing busy junctions without incidents.', thumbnailUrl: 'https://picsum.photos/seed/safety3/400/225', videoUrl: '#', language: 'English' },
];

const noticesData: GovNotice[] = [
    { id: 1, title: 'NTSA Announces New Boda Boda Regulations', content: 'All riders are required to have joined a registered SACCO by August 31st. Failure to comply will result in fines.', date: '2024-07-15', category: 'NTSA' },
    { id: 2, title: 'SACCO Registration Deadline Approaching', content: 'The deadline for mandatory SACCO registration is August 31st. Visit your nearest Huduma Centre for assistance.', date: '2024-07-10', category: 'SACCO' },
    { id: 3, title: 'Updated Curfew Hours for Designated Areas', content: 'Please be advised of the updated curfew from 10 PM to 4 AM in the following zones... This is effective immediately.', date: '2024-06-28', category: 'Curfew' },
];

const productsData: FinancialProduct[] = [
    { id: 1, provider: 'XYZ Insurance', type: 'Insurance', name: 'BodaSure Cover', features: ['Personal Accident Cover', 'Bike Repair', 'Theft Protection'], contactUrl: '#' },
    { id: 2, provider: 'Pesa Chap Chap', type: 'Loan', name: 'Rider Emergency Loan', features: ['Low Interest Rate', 'Instant M-Pesa Disbursement', 'Flexible Repayment'], contactUrl: '#' },
    { id: 3, provider: 'CoverAll Assurance', type: 'Insurance', name: 'Comprehensive Rider Shield', features: ['Third-Party Liability', 'Medical Expenses', '24/7 Roadside Assistance'], contactUrl: '#' },
    { id: 4, provider: 'Wekeza SACCO', type: 'Loan', name: 'Bike Upgrade Loan', features: ['Finance a new motorbike', 'Competitive rates for members', 'Payable over 24 months'], contactUrl: '#' },
];


const TrainingAndUpdates: React.FC<TrainingAndUpdatesProps> = ({ onClose, triggerRef }) => {
    const [activeTab, setActiveTab] = useState<'safety' | 'notices' | 'marketplace'>('safety');
    const [videoLang, setVideoLang] = useState<'English' | 'Swahili'>('English');
    const [productFilter, setProductFilter] = useState<'all' | 'Insurance' | 'Loan'>('all');

    const modalRef = useRef<HTMLDivElement>(null);
    const titleId = 'training-updates-title';
    
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
    
    const filteredVideos = useMemo(() => safetyVideosData.filter(v => v.language === videoLang), [videoLang]);
    const filteredProducts = useMemo(() => productFilter === 'all' ? productsData : productsData.filter(p => p.type === productFilter), [productFilter]);

    const TabButton = ({ id, label, icon }: { id: typeof activeTab, label: string, icon: React.ReactNode }) => (
        <button
            role="tab"
            aria-selected={activeTab === id}
            aria-controls={`${id}-panel`}
            onClick={() => setActiveTab(id)}
            className={`flex-1 flex justify-center items-center gap-2 p-3 font-semibold rounded-t-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-brand-green ${activeTab === id ? 'bg-slate-700 text-brand-green' : 'bg-slate-800 text-slate-400 hover:bg-slate-700/50'}`}
        >
            {icon} {label}
        </button>
    );

    return (
    <div ref={modalRef} className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true" aria-labelledby={titleId}>
      <div className="bg-slate-800 w-full max-w-4xl h-[90vh] rounded-2xl shadow-2xl flex flex-col">
        <header className="flex-shrink-0 p-6 border-b border-slate-700 flex justify-between items-center">
            <h2 id={titleId} className="text-2xl font-bold flex items-center gap-3">
                <AcademicCapIcon className="w-8 h-8 text-brand-green" />
                Training & Updates
            </h2>
            <button onClick={onClose} aria-label="Close training and updates">
                <XCircleIcon className="w-8 h-8 text-slate-400 hover:text-brand-red" />
            </button>
        </header>

        <div className="flex-shrink-0 flex border-b border-slate-700" role="tablist" aria-orientation="horizontal">
            <TabButton id="safety" label="Safety Tips" icon={<VideoCameraIcon className="w-5 h-5"/>} />
            <TabButton id="notices" label="Govt. Notices" icon={<MegaphoneIcon className="w-5 h-5"/>} />
            <TabButton id="marketplace" label="Marketplace" icon={<ShoppingCartIcon className="w-5 h-5"/>} />
        </div>

        <main className="flex-grow overflow-y-auto">
            {activeTab === 'safety' && (
                <div id="safety-panel" role="tabpanel" className="p-6">
                    <div className="flex justify-end mb-4">
                        <div className="bg-slate-700 p-1 rounded-lg flex gap-1">
                            <button onClick={() => setVideoLang('English')} className={`px-3 py-1 text-sm rounded-md ${videoLang === 'English' ? 'bg-brand-green text-white' : 'text-slate-300'}`}>English</button>
                            <button onClick={() => setVideoLang('Swahili')} className={`px-3 py-1 text-sm rounded-md ${videoLang === 'Swahili' ? 'bg-brand-green text-white' : 'text-slate-300'}`}>Swahili</button>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {filteredVideos.map(video => (
                            <div key={video.id} className="bg-slate-900/50 rounded-lg overflow-hidden shadow-lg">
                                <img src={video.thumbnailUrl} alt={video.title} className="w-full h-40 object-cover" />
                                <div className="p-4">
                                    <h3 className="font-bold text-white">{video.title}</h3>
                                    <p className="text-slate-400 text-sm mt-1">{video.description}</p>
                                    <a href={video.videoUrl} target="_blank" rel="noopener noreferrer" className="inline-block mt-3 px-4 py-2 bg-brand-red text-white text-sm font-semibold rounded-lg hover:bg-red-700">Watch Video</a>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
             {activeTab === 'notices' && (
                <div id="notices-panel" role="tabpanel" className="p-6">
                    <ul className="space-y-4">
                        {noticesData.map(notice => (
                            <li key={notice.id} className="bg-slate-900/50 p-4 rounded-lg">
                                <div className="flex justify-between items-baseline">
                                    <h3 className="font-bold text-lg text-white">{notice.title}</h3>
                                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                                        notice.category === 'NTSA' ? 'bg-blue-900 text-blue-300' :
                                        notice.category === 'SACCO' ? 'bg-green-900 text-green-300' :
                                        'bg-yellow-900 text-yellow-300'
                                    }`}>{notice.category}</span>
                                </div>
                                <p className="text-sm text-slate-400 mt-2 mb-3">{notice.date}</p>
                                <p className="text-slate-300">{notice.content}</p>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
             {activeTab === 'marketplace' && (
                <div id="marketplace-panel" role="tabpanel" className="p-6">
                    <div className="flex justify-end mb-4">
                        <div className="bg-slate-700 p-1 rounded-lg flex gap-1">
                            <button onClick={() => setProductFilter('all')} className={`px-3 py-1 text-sm rounded-md ${productFilter === 'all' ? 'bg-brand-green text-white' : 'text-slate-300'}`}>All</button>
                            <button onClick={() => setProductFilter('Insurance')} className={`px-3 py-1 text-sm rounded-md ${productFilter === 'Insurance' ? 'bg-brand-green text-white' : 'text-slate-300'}`}>Insurance</button>
                            <button onClick={() => setProductFilter('Loan')} className={`px-3 py-1 text-sm rounded-md ${productFilter === 'Loan' ? 'bg-brand-green text-white' : 'text-slate-300'}`}>Loans</button>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {filteredProducts.map(product => (
                            <div key={product.id} className="bg-slate-900/50 rounded-lg p-5 flex flex-col">
                                <span className={`text-sm font-bold self-start px-2 py-1 rounded-full mb-2 ${product.type === 'Insurance' ? 'bg-indigo-900 text-indigo-300' : 'bg-pink-900 text-pink-300'}`}>{product.type}</span>
                                <h3 className="text-xl font-bold text-white">{product.name}</h3>
                                <p className="text-sm text-slate-400 mb-3">by {product.provider}</p>
                                <ul className="space-y-1.5 text-slate-300 text-sm list-disc list-inside flex-grow">
                                    {product.features.map((feature, i) => <li key={i}>{feature}</li>)}
                                </ul>
                                <a href={product.contactUrl} target="_blank" rel="noopener noreferrer" className="inline-block mt-4 w-full text-center px-4 py-2 bg-brand-red text-white text-sm font-semibold rounded-lg hover:bg-red-700">Learn More</a>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </main>
      </div>
    </div>
    );
};

export default TrainingAndUpdates;