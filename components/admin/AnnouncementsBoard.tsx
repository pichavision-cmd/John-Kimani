import React, { useState } from 'react';

const AnnouncementsBoard: React.FC = () => {
    const [announcement, setAnnouncement] = useState('');
    const [history, setHistory] = useState<string[]>([
        'Reminder: NTSA SACCO registration deadline is August 31st.',
        'Update: New curfew hours in effect for designated zones.'
    ]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (announcement.trim()) {
            setHistory(prev => [announcement, ...prev]);
            setAnnouncement('');
            alert('Announcement sent!');
        }
    };

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Announcements Board</h2>
            <form onSubmit={handleSubmit} className="mb-6">
                <textarea
                    value={announcement}
                    onChange={(e) => setAnnouncement(e.target.value)}
                    placeholder="Type your announcement here..."
                    className="w-full bg-slate-700 p-3 rounded-lg text-white border border-slate-600"
                    rows={4}
                />
                <button type="submit" className="mt-2 px-6 py-2 bg-brand-red text-white font-semibold rounded-lg">
                    Broadcast
                </button>
            </form>
            <div>
                <h3 className="text-xl font-semibold">History</h3>
                <ul className="list-disc list-inside mt-2 space-y-2 text-slate-300">
                    {history.map((item, index) => <li key={index}>{item}</li>)}
                </ul>
            </div>
        </div>
    );
};

export default AnnouncementsBoard;
