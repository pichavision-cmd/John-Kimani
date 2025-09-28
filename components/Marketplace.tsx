import React, { useState, useEffect, useRef, useMemo } from 'react';
// FIX: Corrected import path for types
import type { MarketplaceItem } from '../types';
// FIX: Corrected import path for icons
import { XCircleIcon, ShoppingCartIcon } from './icons';

interface MarketplaceProps {
  onClose: () => void;
  triggerRef: React.RefObject<HTMLButtonElement>;
}

// Mock Data
const marketplaceData: MarketplaceItem[] = [
    { id: 1, name: 'Slightly Used Helmet', price: 1500, seller: 'John K.', imageUrl: 'https://picsum.photos/seed/helmet/300/200', category: 'Gear' },
    { id: 2, name: 'Boxer 150 Side Mirror', price: 800, seller: 'Peter O.', imageUrl: 'https://picsum.photos/seed/mirror/300/200', category: 'Parts' },
    { id: 3, name: 'Reflective Jacket (Large)', price: 1200, seller: 'Mary W.', imageUrl: 'https://picsum.photos/seed/jacket/300/200', category: 'Gear' },
    { id: 4, name: 'Used Smartphone', price: 5000, seller: 'David M.', imageUrl: 'https://picsum.photos/seed/phone/300/200', category: 'Phones' },
    { id: 5, name: 'Brake Pads (new)', price: 500, seller: 'John K.', imageUrl: 'https://picsum.photos/seed/pads/300/200', category: 'Parts' },
];

type Category = 'All' | 'Parts' | 'Gear' | 'Phones';

const Marketplace: React.FC<MarketplaceProps> = ({ onClose, triggerRef }) => {
    const [category, setCategory] = useState<Category>('All');
    const modalRef = useRef<HTMLDivElement>(null);
    const titleId = 'marketplace-title';

    const filteredItems = useMemo(() => {
        if (category === 'All') return marketplaceData;
        return marketplaceData.filter(item => item.category === category);
    }, [category]);
    
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

    const FilterButton: React.FC<{cat: Category}> = ({ cat }) => (
        <button onClick={() => setCategory(cat)} className={`px-4 py-1.5 text-sm rounded-full ${category === cat ? 'bg-yellow-500 text-slate-900 font-bold' : 'bg-slate-700 text-slate-300'}`}>
            {cat}
        </button>
    );

    return (
    <div ref={modalRef} className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true" aria-labelledby={titleId}>
      <div className="bg-slate-800 w-full max-w-4xl h-[90vh] rounded-2xl shadow-2xl flex flex-col">
        <header className="flex-shrink-0 p-6 border-b border-slate-700 flex justify-between items-center">
            <h2 id={titleId} className="text-2xl font-bold flex items-center gap-3">
                <ShoppingCartIcon className="w-8 h-8 text-yellow-400" />
                Community Marketplace
            </h2>
            <button onClick={onClose} aria-label="Close Marketplace">
                <XCircleIcon className="w-8 h-8 text-slate-400 hover:text-brand-red" />
            </button>
        </header>
        
        <div className="flex-shrink-0 p-4 flex flex-col sm:flex-row justify-between items-center gap-4 border-b border-slate-700">
            <div className="flex items-center gap-2">
                <FilterButton cat="All" />
                <FilterButton cat="Parts" />
                <FilterButton cat="Gear" />
                <FilterButton cat="Phones" />
            </div>
            <button className="w-full sm:w-auto px-6 py-2 bg-brand-red text-white font-semibold rounded-lg">Sell an Item</button>
        </div>

        <main className="flex-grow overflow-y-auto p-6 bg-slate-900/50">
           <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredItems.map(item => (
                    <div key={item.id} className="bg-slate-800 rounded-lg overflow-hidden group">
                        <img src={item.imageUrl} alt={item.name} className="w-full h-32 object-cover" />
                        <div className="p-3">
                            <h4 className="font-bold text-white truncate">{item.name}</h4>
                            <p className="text-yellow-400 font-bold text-lg">KES {item.price.toLocaleString()}</p>
                            <p className="text-xs text-slate-400">Seller: {item.seller}</p>
                            <button className="w-full mt-2 py-1.5 bg-brand-green text-white text-sm font-semibold rounded-md opacity-0 group-hover:opacity-100 transition-opacity">Contact Seller</button>
                        </div>
                    </div>
                ))}
            </div>
        </main>
      </div>
    </div>
    );
};

export default Marketplace;