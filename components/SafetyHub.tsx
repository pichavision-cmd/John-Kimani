import React, { useEffect, useRef } from 'react';
import { ShieldCheckIcon, XCircleIcon } from './icons';

interface SafetyHubProps {
  onClose: () => void;
  triggerRef: React.RefObject<HTMLButtonElement>;
}

const SafetyHub: React.FC<SafetyHubProps> = ({ onClose, triggerRef }) => {
    const modalRef = useRef<HTMLDivElement>(null);
    const titleId = 'safety-hub-title';

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
            <div className="bg-slate-800 w-full max-w-2xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col p-6">
                <div className="flex justify-between items-center mb-4 flex-shrink-0">
                    <h2 id={titleId} className="text-2xl font-bold flex items-center gap-3">
                        <ShieldCheckIcon className="w-8 h-8 text-brand-green" />
                        Safety Hub
                    </h2>
                    <button onClick={onClose} aria-label="Close Safety Hub">
                        <XCircleIcon className="w-8 h-8 text-slate-400 hover:text-brand-red" />
                    </button>
                </div>
                <div className="flex-grow overflow-y-auto pr-2 flex items-center justify-center">
                    <div className="text-center">
                        <ShieldCheckIcon className="w-24 h-24 text-slate-600 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-white">Your Safety Center</h3>
                        <p className="text-slate-400 mt-2 max-w-md mx-auto">
                            Emergency contacts, safety guides, and a panic button feature are coming soon. Stay tuned for updates to keep you safe on the road.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SafetyHub;
