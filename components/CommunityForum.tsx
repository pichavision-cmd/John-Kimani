import React, { useState, useMemo } from 'react';
// FIX: Corrected import path for types
import type { ForumPost } from '../types';
// FIX: Corrected import path for icons
import { PaperAirplaneIcon, LocationMarkerIcon, SearchIcon } from './icons';

const initialPosts: ForumPost[] = [
  {
    id: 4,
    author: 'David Mwangi',
    avatarUrl: 'https://picsum.photos/seed/david/40/40',
    content: 'Stuck near Westlands with a flat tire. If anyone is nearby and can help, I would appreciate it.',
    timestamp: '15 minutes ago',
    locationUrl: 'https://www.google.com/maps?q=-1.2678,36.8045',
  },
  {
    id: 1,
    author: 'John Kamau',
    avatarUrl: 'https://picsum.photos/seed/john/40/40',
    content: 'Found a great insurance deal with XYZ Insurance. Very affordable for boda boda riders and covers personal accidents. Highly recommend!',
    timestamp: '2 hours ago',
  },
  {
    id: 2,
    author: 'Peter Omondi',
    avatarUrl: 'https://picsum.photos/seed/peter/40/40',
    content: 'Guys, where can I find genuine brake pads for a Boxer 150 around Nairobi? The ones I got last time wore out too fast.',
    timestamp: '5 hours ago',
  },
   {
    id: 3,
    author: 'Mary Wanjiru',
    avatarUrl: 'https://picsum.photos/seed/mary/40/40',
    content: 'A reminder to everyone: always wear a reflective jacket, especially at night. It has saved me more than once. Stay safe!',
    timestamp: '1 day ago',
  },
];

const CommunityForum: React.FC = () => {
  const [posts, setPosts] = useState<ForumPost[]>(initialPosts);
  const [newPostContent, setNewPostContent] = useState('');
  const [locationUrl, setLocationUrl] = useState<string | null>(null);
  const [forumSearchTerm, setForumSearchTerm] = useState('');


  const handleShareLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const url = `https://www.google.com/maps?q=${latitude},${longitude}`;
        setLocationUrl(url);
        if (!newPostContent.trim()) {
            setNewPostContent("Sharing my current location.");
        }
      },
      () => {
        alert('Unable to retrieve your location. Please check your browser permissions.');
      }
    );
  };


  const handlePostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPostContent.trim() === '' && !locationUrl) return;

    const newPost: ForumPost = {
      id: Date.now(),
      author: 'You',
      avatarUrl: 'https://picsum.photos/seed/user/40/40',
      content: newPostContent,
      timestamp: 'Just now',
      locationUrl: locationUrl || undefined,
    };

    setPosts([newPost, ...posts]);
    setNewPostContent('');
    setLocationUrl(null);
  };

  const filteredPosts = useMemo(() => {
    const searchTerm = forumSearchTerm.toLowerCase();
    if (!searchTerm) return posts;
    return posts.filter(post =>
        (post.content && post.content.toLowerCase().includes(searchTerm)) ||
        post.author.toLowerCase().includes(searchTerm)
    );
  }, [posts, forumSearchTerm]);

  return (
    <div className="bg-slate-800 rounded-xl p-6 shadow-lg">
      <form onSubmit={handlePostSubmit} className="mb-6">
        <div className="flex items-start space-x-4">
            <img src="https://picsum.photos/seed/user/40/40" alt="Your avatar" className="w-10 h-10 rounded-full" />
            <div className="flex-1">
                <label htmlFor="new-post-content" className="sr-only">Share an idea or ask a question...</label>
                <textarea
                    id="new-post-content"
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-green"
                    placeholder="Share an idea or ask a question..."
                    rows={3}
                ></textarea>
                {locationUrl && (
                    <div className="mt-2 flex items-center text-sm text-green-400 bg-green-900/50 px-3 py-1 rounded-full">
                        <LocationMarkerIcon className="w-4 h-4 mr-2" />
                        <span>Location Attached</span>
                        <button
                        type="button"
                        onClick={() => setLocationUrl(null)}
                        className="ml-auto text-red-500 hover:text-red-400 text-xs font-bold"
                        aria-label="Remove attached location"
                        >
                        REMOVE
                        </button>
                    </div>
                )}
            </div>
        </div>
        <div className="flex justify-end items-center mt-3 space-x-3">
            <button 
                type="button" 
                onClick={handleShareLocation} 
                className="flex items-center gap-2 px-4 py-2 bg-slate-600 text-white font-semibold rounded-lg hover:bg-slate-500 transition duration-300"
                aria-label="Share your location"
            >
                <LocationMarkerIcon className="w-5 h-5" />
                Share Location
            </button>
            <button 
                type="submit" 
                className="bg-brand-red p-3 rounded-full text-white hover:bg-red-700 transition-transform transform hover:scale-110 disabled:bg-slate-600 disabled:cursor-not-allowed" 
                disabled={!newPostContent.trim() && !locationUrl}
                aria-label="Submit post"
            >
                <PaperAirplaneIcon className="w-6 h-6" />
            </button>
        </div>
      </form>
      
      <div className="border-t border-slate-700 pt-6">
        <div className="relative mb-4">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <SearchIcon className="w-5 h-5 text-slate-400" />
            </span>
            <label htmlFor="forum-search" className="sr-only">Search forum posts</label>
            <input
                id="forum-search"
                type="text"
                placeholder="Search posts by author or keyword..."
                value={forumSearchTerm}
                onChange={(e) => setForumSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-brand-green"
            />
        </div>
        {filteredPosts.length > 0 ? (
            <ul className="space-y-6">
                {filteredPosts.map((post) => (
                <li key={post.id} className="flex items-start space-x-4 p-4 bg-slate-900/50 rounded-lg" role="article" aria-labelledby={`post-author-${post.id}`}>
                    <img src={post.avatarUrl} alt={`${post.author}'s avatar`} className="w-10 h-10 rounded-full" />
                    <div className="flex-1">
                    <div className="flex items-baseline space-x-2">
                        <p id={`post-author-${post.id}`} className="font-bold text-white">{post.author}</p>
                        <p className="text-xs text-slate-500">{post.timestamp}</p>
                    </div>
                    {post.content && <p className="text-slate-300 mt-1">{post.content}</p>}
                    {post.locationUrl && (
                        <a 
                            href={post.locationUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-brand-green/20 text-brand-green font-semibold rounded-full hover:bg-brand-green/40 transition-colors text-sm"
                        >
                            <LocationMarkerIcon className="w-4 h-4" />
                            View Location on Map
                        </a>
                    )}
                    </div>
                </li>
                ))}
            </ul>
        ) : (
            <div className="text-center py-10 bg-slate-900/50 rounded-lg">
                <p className="text-slate-400">No posts found matching your search.</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default CommunityForum;