import React, { useState, useEffect, useRef, useMemo } from 'react';
import type { Conversation, ChatMessage } from '../../types';
import {
    ChatBubbleOvalLeftEllipsisIcon,
    PaperAirplaneIcon,
    VideoCameraIcon,
    VideoCameraSlashIcon,
    MicrophoneIcon,
    MicrophoneSlashIcon,
    PhoneXMarkIcon,
    PlayIcon,
    PauseIcon,
    TrashIcon,
    SearchIcon,
} from '../icons';

const mockConversations: Conversation[] = [
    {
        id: 1,
        riderId: 1,
        riderName: 'John Kamau',
        avatarUrl: 'https://picsum.photos/seed/john/40/40',
        messages: [
            { id: 1, sender: 'rider', text: 'Hello, I had an issue with a flat tire yesterday near Westlands. The panic button alert was sent. Is everything okay?', timestamp: new Date(Date.now() - 86400000 * 2).toISOString() },
            { id: 2, sender: 'admin', text: 'Hi John, we saw the alert. Glad to hear you are okay. Was the issue resolved?', timestamp: new Date(Date.now() - 86400000).toISOString() },
            { id: 3, sender: 'rider', text: 'Yes, another rider helped me out. Thank you for checking in.', timestamp: new Date(Date.now() - 3600000).toISOString() },
        ],
    },
    {
        id: 2,
        riderId: 3,
        riderName: 'Mary Wanjiru',
        avatarUrl: 'https://picsum.photos/seed/mary/40/40',
        messages: [
            { id: 1, sender: 'rider', text: 'I have a question about my SACCO contributions. Can you help?', timestamp: new Date(Date.now() - 7200000).toISOString() },
        ],
    },
    {
        id: 3,
        riderId: 2,
        riderName: 'Peter Omondi',
        avatarUrl: 'https://picsum.photos/seed/peter/40/40',
        messages: [
            { id: 1, sender: 'rider', text: 'Is the office open on Saturdays?', timestamp: new Date(Date.now() - 86400000 * 3).toISOString() },
            { id: 2, sender: 'admin', text: 'Yes, we are open from 9 AM to 1 PM on Saturdays.', timestamp: new Date(Date.now() - 86400000 * 2).toISOString() }
        ],
    },
];

const formatDuration = (seconds: number = 0) => {
    const floorSeconds = Math.floor(seconds);
    const min = Math.floor(floorSeconds / 60);
    const sec = floorSeconds % 60;
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
};

const CommunicationLog: React.FC = () => {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedConversationId, setSelectedConversationId] = useState<number | null>(null);
    const [newMessage, setNewMessage] = useState('');
    const [messageSearchTerm, setMessageSearchTerm] = useState('');
    
    // Video Call State
    const [isCalling, setIsCalling] = useState(false);
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    
    // Voice Message State
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [playingAudioId, setPlayingAudioId] = useState<number | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const recordingIntervalRef = useRef<number | null>(null);
    const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const localVideoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        try {
            const storedConversations = localStorage.getItem('boda-conversations');
            if (storedConversations) {
                setConversations(JSON.parse(storedConversations));
            } else {
                setConversations(mockConversations);
                localStorage.setItem('boda-conversations', JSON.stringify(mockConversations));
            }
        } catch (error) {
            console.error("Failed to load conversations:", error);
            setConversations(mockConversations);
        }
    }, []);

    useEffect(() => {
        if (!isCalling) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [selectedConversationId, conversations, isCalling]);
    
     useEffect(() => {
        // Clear search when switching conversations
        setMessageSearchTerm('');
    }, [selectedConversationId]);
    
    useEffect(() => {
        if (localStream && localVideoRef.current) {
            localVideoRef.current.srcObject = localStream;
        }
    }, [localStream]);

    const saveConversations = (updatedConversations: Conversation[]) => {
        setConversations(updatedConversations);
        localStorage.setItem('boda-conversations', JSON.stringify(updatedConversations));
    };

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || selectedConversationId === null) return;

        const newMessageObj: ChatMessage = {
            id: Date.now(),
            sender: 'admin',
            text: newMessage.trim(),
            timestamp: new Date().toISOString(),
        };

        const updatedConversations = conversations.map(convo => {
            if (convo.id === selectedConversationId) {
                return { ...convo, messages: [...convo.messages, newMessageObj] };
            }
            return convo;
        });

        saveConversations(updatedConversations);
        setNewMessage('');
    };
    
    // Video Call Logic
    const startCall = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            setLocalStream(stream);
            setIsCalling(true);
        } catch (err) {
            console.error("Failed to get media devices.", err);
            alert("Failed to start video call. Please check camera and microphone permissions.");
        }
    };

    const endCall = () => {
        localStream?.getTracks().forEach(track => track.stop());
        setLocalStream(null);
        setIsCalling(false);
        setIsMuted(false);
        setIsVideoOff(false);
    };

    const toggleAudio = () => {
        if (localStream) {
            localStream.getAudioTracks().forEach(track => track.enabled = !track.enabled);
            setIsMuted(prev => !prev);
        }
    };

    const toggleVideo = () => {
        if (localStream) {
            localStream.getVideoTracks().forEach(track => track.enabled = !track.enabled);
            setIsVideoOff(prev => !prev);
        }
    };
    
    // Voice Message Logic
    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                audioChunksRef.current.push(event.data);
            };

            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                sendVoiceMessage(audioBlob);
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start();
            setIsRecording(true);
            setRecordingTime(0);
            recordingIntervalRef.current = window.setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);

        } catch (err) {
            console.error("Error starting recording:", err);
            alert("Could not start recording. Please check microphone permissions.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            if(recordingIntervalRef.current) clearInterval(recordingIntervalRef.current);
            setRecordingTime(0);
        }
    };
    
    const sendVoiceMessage = (audioBlob: Blob) => {
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
            const base64String = reader.result as string;
            
            // Get duration
            const audio = new Audio(URL.createObjectURL(audioBlob));
            audio.onloadedmetadata = () => {
                const duration = audio.duration;
                 if (selectedConversationId === null) return;
                
                const newMessageObj: ChatMessage = {
                    id: Date.now(),
                    sender: 'admin',
                    audioSrc: base64String,
                    duration: duration,
                    timestamp: new Date().toISOString(),
                };

                const updatedConversations = conversations.map(convo => {
                    if (convo.id === selectedConversationId) {
                        return { ...convo, messages: [...convo.messages, newMessageObj] };
                    }
                    return convo;
                });
                saveConversations(updatedConversations);
            };
        };
    };

    const togglePlayAudio = (msg: ChatMessage) => {
        if (playingAudioId === msg.id) {
            audioPlayerRef.current?.pause();
            setPlayingAudioId(null);
        } else {
            if (audioPlayerRef.current && !audioPlayerRef.current.paused) {
                audioPlayerRef.current.pause();
            }
            const newAudio = new Audio(msg.audioSrc);
            audioPlayerRef.current = newAudio;
            newAudio.play();
            setPlayingAudioId(msg.id);
            newAudio.onended = () => {
                setPlayingAudioId(null);
            }
        }
    };

    const selectedConversation = conversations.find(c => c.id === selectedConversationId);
    
    const filteredMessages = useMemo(() => {
        if (!selectedConversation) return [];
        if (!messageSearchTerm.trim()) return selectedConversation.messages;

        return selectedConversation.messages.filter(msg =>
            msg.text?.toLowerCase().includes(messageSearchTerm.toLowerCase())
        );
    }, [selectedConversation, messageSearchTerm]);
    
    const formatTimestamp = (isoString: string) => {
        return new Date(isoString).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    };

    return (
        <div>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <ChatBubbleOvalLeftEllipsisIcon className="w-6 h-6" />
                Rider Communications
            </h2>
            <div className="flex h-[65vh] border border-slate-700 rounded-lg bg-slate-900">
                <aside className="w-1/3 border-r border-slate-700 overflow-y-auto">
                    <ul>
                        {conversations.map(convo => {
                            const lastMessage = convo.messages[convo.messages.length - 1];
                            return (
                            <li key={convo.id}>
                                <button
                                    onClick={() => setSelectedConversationId(convo.id)}
                                    className={`w-full text-left p-4 hover:bg-slate-800/50 transition-colors border-l-4 ${selectedConversationId === convo.id ? 'bg-slate-800 border-brand-green' : 'border-transparent'}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <img src={convo.avatarUrl} alt={convo.riderName} className="w-10 h-10 rounded-full" />
                                        <div className="flex-1 truncate">
                                            <p className="font-bold text-white">{convo.riderName}</p>
                                            <p className="text-sm text-slate-400 truncate">
                                                {lastMessage?.audioSrc ? 'Voice message' : (lastMessage?.text || 'No messages yet')}
                                            </p>
                                        </div>
                                    </div>
                                </button>
                            </li>
                        )})}
                    </ul>
                </aside>
                <section className="w-2/3 flex flex-col">
                    {selectedConversation && isCalling ? (
                         <div className="flex-1 bg-black relative flex items-center justify-center">
                            {/* Remote Video Placeholder */}
                            <div className="w-full h-full flex flex-col items-center justify-center text-slate-500">
                                <img src={selectedConversation.avatarUrl} alt={selectedConversation.riderName} className="w-24 h-24 rounded-full opacity-30" />
                                <p className="mt-4 text-lg">Calling {selectedConversation.riderName}...</p>
                                <p className="text-sm">Waiting for rider to join</p>
                            </div>

                            {/* Local Video Preview */}
                            <video ref={localVideoRef} autoPlay playsInline muted className="absolute bottom-4 right-4 w-1/4 max-w-[180px] rounded-lg shadow-lg border-2 border-slate-700 bg-slate-800"></video>
                            
                            {/* Call Controls */}
                            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-slate-900/60 backdrop-blur-sm p-3 rounded-full">
                                <button onClick={toggleAudio} className={`p-3 rounded-full transition-colors ${isMuted ? 'bg-white text-slate-900' : 'bg-slate-700 text-white hover:bg-slate-600'}`} aria-label={isMuted ? 'Unmute' : 'Mute'}>
                                    {isMuted ? <MicrophoneSlashIcon className="w-6 h-6" /> : <MicrophoneIcon className="w-6 h-6" />}
                                </button>
                                <button onClick={toggleVideo} className={`p-3 rounded-full transition-colors ${isVideoOff ? 'bg-white text-slate-900' : 'bg-slate-700 text-white hover:bg-slate-600'}`} aria-label={isVideoOff ? 'Start Video' : 'Stop Video'}>
                                    {isVideoOff ? <VideoCameraSlashIcon className="w-6 h-6" /> : <VideoCameraIcon className="w-6 h-6" />}
                                </button>
                                <button onClick={endCall} className="p-3 rounded-full bg-brand-red text-white hover:bg-red-500" aria-label="End Call">
                                    <PhoneXMarkIcon className="w-6 h-6" />
                                </button>
                            </div>
                        </div>
                    ) : selectedConversation ? (
                        <>
                           <header className="flex-shrink-0 p-3 border-b border-slate-700 bg-slate-800/50 flex items-center gap-3">
                                <img src={selectedConversation.avatarUrl} alt={selectedConversation.riderName} className="w-10 h-10 rounded-full flex-shrink-0" />
                                <h3 className="font-bold text-lg text-white flex-shrink-0">{selectedConversation.riderName}</h3>
                                <div className="flex-1 flex justify-end items-center gap-2">
                                    <div className="relative w-full max-w-xs">
                                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                            <SearchIcon className="w-4 h-4 text-slate-400" />
                                        </span>
                                        <input
                                            type="search"
                                            aria-label="Search messages in this conversation"
                                            placeholder="Search messages..."
                                            value={messageSearchTerm}
                                            onChange={(e) => setMessageSearchTerm(e.target.value)}
                                            className="w-full pl-9 pr-3 py-1.5 bg-slate-700 border border-slate-600 rounded-full text-sm text-white focus:outline-none focus:ring-1 focus:ring-brand-green"
                                        />
                                    </div>
                                    <button onClick={startCall} aria-label={`Start video call with ${selectedConversation.riderName}`} className="flex-shrink-0 p-2 rounded-full text-slate-400 hover:bg-slate-700 hover:text-brand-green transition-colors">
                                        <VideoCameraIcon className="w-6 h-6" />
                                    </button>
                                </div>
                           </header>
                           <main className="flex-1 overflow-y-auto p-4 space-y-4">
                                {filteredMessages.map(msg => (
                                    <div key={msg.id} className={`flex items-end gap-2 ${msg.sender === 'admin' ? 'justify-end' : 'justify-start'}`}>
                                        {msg.sender === 'rider' && <img src={selectedConversation.avatarUrl} alt="" className="w-6 h-6 rounded-full self-start" />}
                                        <div className={`max-w-xs md:max-w-md p-3 rounded-xl ${msg.sender === 'admin' ? 'bg-brand-green text-slate-900 font-medium rounded-br-none' : 'bg-slate-700 text-white rounded-bl-none'}`}>
                                            {msg.text && <p>{msg.text}</p>}
                                            {msg.audioSrc && (
                                                <div className="flex items-center gap-3">
                                                    <button onClick={() => togglePlayAudio(msg)} aria-label={playingAudioId === msg.id ? "Pause voice message" : "Play voice message"}>
                                                        {playingAudioId === msg.id ? <PauseIcon className="w-6 h-6" /> : <PlayIcon className="w-6 h-6" />}
                                                    </button>
                                                    <div className="w-32 h-1 bg-slate-500/50 rounded-full"></div>
                                                    <span className="text-xs font-mono">{formatDuration(msg.duration)}</span>
                                                </div>
                                            )}
                                            <p className={`text-xs mt-1 text-right ${msg.sender === 'admin' ? 'text-slate-800/70' : 'text-slate-400'}`}>{formatTimestamp(msg.timestamp)}</p>
                                        </div>
                                    </div>
                                ))}
                                
                                {selectedConversation.messages.length > 0 && filteredMessages.length === 0 && (
                                    <div className="flex h-full items-center justify-center text-slate-500">
                                        <div className="text-center">
                                            <SearchIcon className="w-16 h-16 mx-auto text-slate-700" />
                                            <p>No messages found matching "{messageSearchTerm}".</p>
                                        </div>
                                    </div>
                                )}
                                
                                {selectedConversation.messages.length === 0 && (
                                     <div className="flex h-full items-center justify-center text-slate-500">
                                         <div className="text-center">
                                            <ChatBubbleOvalLeftEllipsisIcon className="w-16 h-16 mx-auto text-slate-700" />
                                            <p>This conversation is empty.</p>
                                        </div>
                                    </div>
                                )}
                                
                                <div ref={messagesEndRef} />
                           </main>
                           <footer className="flex-shrink-0 p-3 border-t border-slate-700">
                                {isRecording ? (
                                    <div className="flex items-center gap-4 justify-between">
                                        <div className="flex items-center gap-2 text-brand-red">
                                            <span className="relative flex h-3 w-3">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                                            </span>
                                            <span className="font-mono">{formatDuration(recordingTime)}</span>
                                        </div>
                                        <button onClick={stopRecording} className="px-4 py-2 bg-slate-700 text-white rounded-full text-sm font-semibold">Stop & Send</button>
                                    </div>
                                ) : (
                                    <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                                        <input
                                            type="text"
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                            placeholder="Type your message..."
                                            className="flex-1 w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-full text-white focus:outline-none focus:ring-2 focus:ring-brand-green"
                                        />
                                        {newMessage.trim() ? (
                                            <button type="submit" className="p-3 bg-brand-green rounded-full text-slate-900 hover:bg-green-400">
                                                <PaperAirplaneIcon className="w-5 h-5" />
                                            </button>
                                        ) : (
                                            <button type="button" onClick={startRecording} className="p-3 bg-slate-600 rounded-full text-white hover:bg-slate-500">
                                                <MicrophoneIcon className="w-5 h-5" />
                                            </button>
                                        )}
                                    </form>
                                )}
                           </footer>
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-slate-500">
                            <div className="text-center">
                                <ChatBubbleOvalLeftEllipsisIcon className="w-16 h-16 mx-auto text-slate-700" />
                                <p>Select a conversation to start messaging.</p>
                            </div>
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
};

export default CommunicationLog;