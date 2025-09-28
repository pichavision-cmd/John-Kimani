import React, { useState, useEffect, useRef } from 'react';
// FIX: Corrected import path for types
import type { HealthTip, EmergencyContact } from '../types';
// FIX: Corrected import path for icons
import { XCircleIcon, HeartIcon, ShieldCheckIcon } from './icons';

interface WellnessAndFamilyProps {
  onClose: () => void;
  triggerRef: React.RefObject<HTMLButtonElement>;
}

// Mock Data
const healthTipsData: HealthTip[] = [
    { id: 1, title: 'Proper Riding Posture', content: 'Keep your back straight and shoulders relaxed to avoid long-term back pain. Adjust your mirrors to avoid straining your neck.', category: 'Back Care' },
    { id: 2, title: 'Stay Hydrated', content: 'Drink plenty of water throughout the day, not just when you feel thirsty. Dehydration can reduce concentration.', category: 'Nutrition' },
    { id: 3, title: 'Manage Road Stress', content: 'If you feel overwhelmed in traffic, pull over for a few minutes. Deep breathing exercises can help calm your nerves.', category: 'Stress' },
];

const WellnessAndFamily: React.FC<WellnessAndFamilyProps> = ({ onClose, triggerRef }) => {
    const [activeTab, setActiveTab] = useState<'wellness' | 'family'>('wellness');
    const [emergencyContact, setEmergencyContact] = useState<EmergencyContact>({ name: '', phone: '', relationship: '' });
    const modalRef = useRef<HTMLDivElement>(null);
    const titleId = 'wellness-family-title';
    
    useEffect(() => {
        try {
            const storedContact = localStorage.getItem('boda-emergency-contact');
            if (storedContact) setEmergencyContact(JSON.parse(storedContact));
        } catch (error) { console.error("Failed to load emergency contact", error); }
    }, []);

    const handleContactChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEmergencyContact(prev => ({...prev, [e.target.name]: e.target.value }));
    };

    const handleSaveContact = (e: React.FormEvent) => {
        e.preventDefault();
        if (emergencyContact.name && emergencyContact.phone && emergencyContact.relationship) {
            localStorage.setItem('boda-emergency-contact', JSON.stringify(emergencyContact));
            alert('Emergency contact saved!');
        } else {
            alert('Please fill all fields.');
        }
    };

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

    const TabButton = ({ id, label, icon }: { id: typeof activeTab, label: string, icon: React.ReactNode }) => (
        <button role="tab" aria-selected={activeTab === id} onClick={() => setActiveTab(id)} className={`flex-1 flex justify-center items-center gap-2 p-3 font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-brand-green ${activeTab === id ? 'bg-slate-700 text-brand-green' : 'bg-slate-800 text-slate-400 hover:bg-slate-700/50'}`}>
            {icon} {label}
        </button>
    );

    return (
    <div ref={modalRef} className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true" aria-labelledby={titleId}>
      <div className="bg-slate-800 w-full max-w-2xl h-auto max-h-[90vh] rounded-2xl shadow-2xl flex flex-col">
        <header className="flex-shrink-0 p-6 border-b border-slate-700 flex justify-between items-center">
            <h2 id={titleId} className="text-2xl font-bold flex items-center gap-3">
                <HeartIcon className="w-8 h-8 text-brand-green" />
                Wellness & Family
            </h2>
            <button onClick={onClose} aria-label="Close Wellness & Family">
                <XCircleIcon className="w-8 h-8 text-slate-400 hover:text-brand-red" />
            </button>
        </header>

        <div className="flex-shrink-0 flex border-b border-slate-700" role="tablist">
            <TabButton id="wellness" label="Health & Wellness" icon={<HeartIcon className="w-5 h-5" />} />
            <TabButton id="family" label="Family Link" icon={<ShieldCheckIcon className="w-5 h-5" />} />
        </div>
        
        <main className="flex-grow overflow-y-auto p-6 bg-slate-900/50">
            {activeTab === 'wellness' && (
                <div className="space-y-4">
                     {healthTipsData.map(tip => (
                         <div key={tip.id} className="bg-slate-800 p-4 rounded-lg">
                             <h4 className="font-bold text-brand-green">{tip.title}</h4>
                             <p className="text-slate-300 text-sm mt-1">{tip.content}</p>
                         </div>
                     ))}
                     <a href="https://www.nhif.or.ke/" target="_blank" rel="noopener noreferrer" className="block w-full text-center p-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-500">
                         Register for NHIF
                     </a>
                     <a href="https://linda-mama.nhif.or.ke/" target="_blank" rel="noopener noreferrer" className="block w-full text-center p-3 bg-pink-600 text-white font-semibold rounded-lg hover:bg-pink-500">
                         Register for Linda Mama
                     </a>
                </div>
            )}
            {activeTab === 'family' && (
                 <div className="max-w-lg mx-auto">
                    <div className="bg-slate-800 p-6 rounded-lg text-center">
                        <ShieldCheckIcon className="w-16 h-16 mx-auto text-brand-green" />
                        <h3 className="text-xl font-bold mt-4">Family Link Safety</h3>
                        <p className="text-slate-400 mt-2 text-sm">Add a trusted relative. They will receive an SMS alert if you press the Panic Button or if your app has been inactive for several days.</p>
                    </div>
                    <form onSubmit={handleSaveContact} className="mt-6 space-y-4">
                        <div>
                           <label htmlFor="contact-name" className="block text-sm font-medium text-slate-300 mb-1">Contact's Full Name</label>
                           <input type="text" id="contact-name" name="name" value={emergencyContact.name} onChange={handleContactChange} className="w-full p-2 bg-slate-700 rounded-md"/>
                       </div>
                        <div>
                           <label htmlFor="contact-phone" className="block text-sm font-medium text-slate-300 mb-1">Phone Number</label>
                           <input type="tel" id="contact-phone" name="phone" value={emergencyContact.phone} onChange={handleContactChange} className="w-full p-2 bg-slate-700 rounded-md"/>
                       </div>
                        <div>
                           <label htmlFor="contact-relationship" className="block text-sm font-medium text-slate-300 mb-1">Relationship</label>
                           <input type="text" id="contact-relationship" name="relationship" value={emergencyContact.relationship} onChange={handleContactChange} className="w-full p-2 bg-slate-700 rounded-md"/>
                       </div>
                       <button type="submit" className="w-full p-3 bg-brand-red text-white font-semibold rounded-lg hover:bg-red-700">Save Emergency Contact</button>
                    </form>
                </div>
            )}
        </main>
      </div>
    </div>
    );
};

export default WellnessAndFamily;