import React, { useState } from 'react';
// FIX: Corrected import path for types
import type { Game, MusicShare } from '../types';
// FIX: Corrected import path for icons
import { MusicalNoteIcon, TrophyIcon } from './icons';

interface MusicAndGamesProps {
  onClose: () => void;
  triggerRef: React.RefObject<HTMLButtonElement>;
}

// Mock Data
const gamesData: Game[] = [
    { id: 1, title: 'Road Safety Quiz', description: 'Test your knowledge of the Kenyan traffic act.', type: 'quiz' },
    { id: 2, title: 'SACCO Trivia', description: 'How well do you know your SACCO\'s history and benefits?', type: 'trivia' },
];

const musicData: MusicShare[] = [
    { id: 1, user: 'David M.', avatarUrl: 'https://picsum.photos/seed/david/40/40', songTitle: 'Sura Yako', artist: 'Sauti Sol', platform: 'YouTube', url: '#' },
    { id: 2, user: 'John K.', avatarUrl: 'https://picsum.photos/seed/john/40/40', songTitle: 'Malaika', artist: 'Nyashinski', platform: 'Spotify', url: '#' },
];

const MusicAndGames: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'games' | 'music'>('games');
    const titleId = 'music-games-title';

    const TabButton = ({ id, label, icon }: { id: typeof activeTab, label: string, icon: React.ReactNode }) => (
        <button role="tab" aria-selected={activeTab === id} onClick={() => setActiveTab(id)} className={`flex-1 flex justify-center items-center gap-2 p-3 font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-brand-green ${activeTab === id ? 'bg-slate-700 text-yellow-400' : 'bg-slate-800 text-slate-400 hover:bg-slate-700/50'}`}>
            {icon} {label}
        </button>
    );

    return (
    <div className="container mx-auto p-4 sm:p-6 min-h-screen flex flex-col items-center">
      <div className="bg-slate-800 w-full max-w-4xl rounded-2xl shadow-2xl flex flex-col">
        <header className="flex-shrink-0 p-6 border-b border-slate-700 flex justify-between items-center">
            <h1 id={titleId} className="text-2xl font-bold flex items-center gap-3">
                <MusicalNoteIcon className="w-8 h-8 text-yellow-400" />
                Music & Games
            </h1>
            <a href="index.html" className="px-4 py-2 bg-slate-600 text-white font-semibold rounded-lg hover:bg-slate-500 transition-colors">
                &larr; Back to Dashboard
            </a>
        </header>

        <div className="flex-shrink-0 flex border-b border-slate-700" role="tablist">
            <TabButton id="games" label="Games" icon={<TrophyIcon className="w-5 h-5" />} />
            <TabButton id="music" label="Music Sharing" icon={<MusicalNoteIcon className="w-5 h-5" />} />
        </div>
        
        <main className="flex-grow overflow-y-auto p-6 bg-slate-900/50 rounded-b-2xl">
            {activeTab === 'games' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {gamesData.map(game => (
                        <div key={game.id} className="bg-slate-800 p-4 rounded-lg flex flex-col justify-between items-start">
                            <div>
                                <h4 className="font-bold text-white text-lg">{game.title}</h4>
                                <p className="text-sm text-slate-400 mt-1">{game.description}</p>
                            </div>
                            <button className="mt-4 px-4 py-2 bg-brand-red text-white font-semibold rounded-lg text-sm">Play Now</button>
                        </div>
                    ))}
                </div>
            )}
            {activeTab === 'music' && (
                <div className="space-y-4">
                    <form className="flex gap-2">
                        <input type="text" placeholder="Paste YouTube/Spotify/Boomplay link..." className="flex-1 p-2 bg-slate-700 rounded-md text-white border border-slate-600 focus:ring-brand-green focus:border-brand-green" />
                        <button type="submit" className="px-4 py-2 bg-brand-red text-white font-semibold rounded-lg">Share</button>
                    </form>
                    <div className="border-t border-slate-700 pt-4 space-y-3">
                        {musicData.map(song => (
                             <div key={song.id} className="bg-slate-800 p-3 rounded-lg flex items-center gap-3">
                                 <img src={song.avatarUrl} alt={song.user} className="w-10 h-10 rounded-full" />
                                 <div className="flex-1">
                                     <p className="text-sm text-white font-semibold">{song.songTitle} - <span className="font-normal text-slate-300">{song.artist}</span></p>
                                     <p className="text-xs text-slate-400">Shared by {song.user} via {song.platform}</p>
                                 </div>
                                 <a href={song.url} target="_blank" rel="noopener noreferrer" className="px-3 py-1 bg-green-600 text-white font-semibold rounded-lg text-sm">Listen</a>
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

// FIX: Added default export for the component.
export default MusicAndGames;