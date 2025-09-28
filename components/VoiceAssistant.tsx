import React, { useState, useRef, useCallback, useEffect } from 'react';
import { GoogleGenAI, Modality, type LiveSession } from '@google/genai';
import type { LiveServerMessage, Blob } from '@google/genai';
// FIX: Corrected import path for icons
import { MicrophoneIcon, XCircleIcon } from './icons';

// Add SpeechRecognition type declaration for browsers that have it
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

// Base64 encode/decode functions
function encode(bytes: Uint8Array): string {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

function decode(base64: string): Uint8Array {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
}

async function decodeAudioData(
    data: Uint8Array,
    ctx: AudioContext,
    sampleRate: number,
    numChannels: number,
): Promise<AudioBuffer> {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

    for (let channel = 0; channel < numChannels; channel++) {
        const channelData = buffer.getChannelData(channel);
        for (let i = 0; i < frameCount; i++) {
            channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
        }
    }
    return buffer;
}


const VoiceAssistant: React.FC = () => {
    const [isActive, setIsActive] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [userTranscript, setUserTranscript] = useState('');
    const [modelTranscript, setModelTranscript] = useState('');
    const [conversationHistory, setConversationHistory] = useState<{ user: string, model: string }[]>([]);
    
    const sessionRef = useRef<LiveSession | null>(null);
    const currentUserTranscriptRef = useRef('');
    const currentModelTranscriptRef = useRef('');
    const inputAudioContextRef = useRef<AudioContext | null>(null);
    const outputAudioContextRef = useRef<AudioContext | null>(null);
    const microphoneStreamRef = useRef<MediaStream | null>(null);
    const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
    const nextStartTimeRef = useRef<number>(0);
    const audioSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
    const wakeWordRecognitionRef = useRef<any | null>(null);

    const assistantTriggerRef = useRef<HTMLButtonElement>(null);
    const modalRef = useRef<HTMLDivElement>(null);
    const titleId = 'boda-assistant-title';


    const createBlob = (data: Float32Array): Blob => {
        const l = data.length;
        const int16 = new Int16Array(l);
        for (let i = 0; i < l; i++) {
            int16[i] = data[i] * 32768;
        }
        return {
            data: encode(new Uint8Array(int16.buffer)),
            mimeType: 'audio/pcm;rate=16000',
        };
    }

    const stopConversation = useCallback(async () => {
        setIsListening(false);
        if (sessionRef.current) {
            await sessionRef.current.close();
            sessionRef.current = null;
        }
        if (scriptProcessorRef.current) {
            scriptProcessorRef.current.disconnect();
            scriptProcessorRef.current = null;
        }
        if (microphoneStreamRef.current) {
            microphoneStreamRef.current.getTracks().forEach(track => track.stop());
            microphoneStreamRef.current = null;
        }
        if (inputAudioContextRef.current && inputAudioContextRef.current.state !== 'closed') {
            await inputAudioContextRef.current.close();
        }
        if (outputAudioContextRef.current && outputAudioContextRef.current.state !== 'closed') {
            await outputAudioContextRef.current.close();
        }
         audioSourcesRef.current.forEach(source => source.stop());
         audioSourcesRef.current.clear();
         nextStartTimeRef.current = 0;
    }, []);

    const toggleAssistant = useCallback(() => {
        setIsActive(currentIsActive => {
            if (currentIsActive) {
                stopConversation();
            }
            return !currentIsActive;
        });
    }, [stopConversation]);

    const handleCommand = (command: string) => {
        const lowerCaseCommand = command.toLowerCase();
        if (lowerCaseCommand.includes('stop listening')) {
            stopConversation();
        } else if (lowerCaseCommand.includes('close assistant')) {
            toggleAssistant();
        }
    };

    const startConversation = useCallback(async () => {
        if (!process.env.API_KEY) {
            console.error("API_KEY environment variable not set.");
            alert("API Key is not configured. Please contact support.");
            return;
        }
        setIsListening(true);
        setUserTranscript('');
        setModelTranscript('');
        currentUserTranscriptRef.current = '';
        currentModelTranscriptRef.current = '';

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
            outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            nextStartTimeRef.current = 0;

            const sessionPromise = ai.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                callbacks: {
                    onopen: async () => {
                        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                        microphoneStreamRef.current = stream;

                        const source = inputAudioContextRef.current!.createMediaStreamSource(stream);
                        const scriptProcessor = inputAudioContextRef.current!.createScriptProcessor(4096, 1, 1);
                        scriptProcessorRef.current = scriptProcessor;
                        
                        scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
                            const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                            const pcmBlob = createBlob(inputData);
                             sessionPromise.then((session) => {
                                session.sendRealtimeInput({ media: pcmBlob });
                             });
                        };

                        source.connect(scriptProcessor);
                        scriptProcessor.connect(inputAudioContextRef.current!.destination);
                    },
                    onmessage: async (message: LiveServerMessage) => {
                        if (message.serverContent?.outputTranscription) {
                            const text = message.serverContent.outputTranscription.text;
                            setModelTranscript(prev => prev + text);
                            currentModelTranscriptRef.current += text;
                        }
                        if (message.serverContent?.inputTranscription) {
                            const text = message.serverContent.inputTranscription.text;
                            setUserTranscript(prev => prev + text);
                            currentUserTranscriptRef.current += text;
                            handleCommand(currentUserTranscriptRef.current);
                        }
                        if (message.serverContent?.turnComplete) {
                            const fullInputTranscription = currentUserTranscriptRef.current;
                            const fullOutputTranscription = currentModelTranscriptRef.current;
                            setConversationHistory(prev => [...prev, { user: fullInputTranscription, model: fullOutputTranscription }]);
                            
                            currentUserTranscriptRef.current = '';
                            currentModelTranscriptRef.current = '';
                            setUserTranscript('');
                            setModelTranscript('');
                        }
                        
                        const audioData = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
                        if (audioData) {
                            const outputCtx = outputAudioContextRef.current;
                            if (!outputCtx) return;

                            nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputCtx.currentTime);
                            const decodedAudio = decode(audioData);
                            const audioBuffer = await decodeAudioData(decodedAudio, outputCtx, 24000, 1);
                            
                            const source = outputCtx.createBufferSource();
                            source.buffer = audioBuffer;
                            source.connect(outputCtx.destination);
                            
                            source.addEventListener('ended', () => {
                                audioSourcesRef.current.delete(source);
                            });

                            source.start(nextStartTimeRef.current);
                            nextStartTimeRef.current += audioBuffer.duration;
                            audioSourcesRef.current.add(source);
                        }
                    },
                    onerror: (e: ErrorEvent) => {
                        console.error('Gemini Live API Error:', e);
                        stopConversation();
                    },
                    onclose: (e: CloseEvent) => {
                        stopConversation();
                    },
                },
                config: {
                    responseModalities: [Modality.AUDIO],
                    inputAudioTranscription: {},
                    outputAudioTranscription: {},
                    systemInstruction: "You are a helpful assistant for Boda Boda motorbike riders in Kenya. Provide concise, clear, and practical advice on topics like road safety, motorcycle maintenance, insurance, finding parts, and understanding local regulations. Speak in a friendly, encouraging, and easy-to-understand manner. Keep responses short and to the point."
                }
            });
            sessionRef.current = await sessionPromise;
        } catch (error) {
            console.error("Failed to start conversation:", error);
            setIsListening(false);
        }
    }, [stopConversation]);
    
    // Wake Word listener
     useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            console.warn("Speech Recognition API not supported in this browser.");
            return;
        }

        if (!isActive) {
            if (wakeWordRecognitionRef.current) return;
            
            const recognition = new SpeechRecognition();
            wakeWordRecognitionRef.current = recognition;
            recognition.continuous = true;
            recognition.interimResults = false;

            recognition.onresult = (event: any) => {
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    const transcript = event.results[i][0].transcript.trim().toLowerCase();
                    if (transcript.includes('open assistant') || transcript.includes('hey boda')) {
                        toggleAssistant();
                    }
                }
            };
            
            recognition.onend = () => {
                if (wakeWordRecognitionRef.current) {
                    try { recognition.start(); } 
                    catch (e) { console.error("Could not restart wake word recognition", e); }
                }
            };

            recognition.onerror = (event: any) => {
                // A "no-speech" or "aborted" error is common. We don't treat it as a critical error.
                // We only log other, more significant errors.
                if (event.error !== 'no-speech' && event.error !== 'aborted') {
                    console.error("Wake word recognition error", event.error);
                }
                
                // If the error is due to denied permissions, we must stop trying to listen,
                // otherwise it will fall into an infinite error loop.
                if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
                    if (wakeWordRecognitionRef.current) {
                        // This prevents the `onend` handler from restarting the recognition service.
                        wakeWordRecognitionRef.current.stop();
                        wakeWordRecognitionRef.current = null;
                    }
                }
            };
            
            try { recognition.start(); } 
            catch(e) { console.error("Wake word listener failed to start.", e); }

        } else {
            if (wakeWordRecognitionRef.current) {
                wakeWordRecognitionRef.current.stop();
                wakeWordRecognitionRef.current = null;
            }
        }

        return () => {
            if (wakeWordRecognitionRef.current) {
                wakeWordRecognitionRef.current.stop();
                wakeWordRecognitionRef.current = null;
            }
        };
    }, [isActive, toggleAssistant]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            stopConversation();
        }
    }, [stopConversation]);

    // A11y: Hide background content when modal is active
    useEffect(() => {
        const mainContent = document.querySelector('main');
        const headerContent = document.querySelector('header');
        if (isActive) {
            mainContent?.setAttribute('aria-hidden', 'true');
            headerContent?.setAttribute('aria-hidden', 'true');
        }
        return () => {
            mainContent?.removeAttribute('aria-hidden');
            headerContent?.removeAttribute('aria-hidden');
        };
    }, [isActive]);

    // A11y: Focus trap for modal
    useEffect(() => {
        if (!isActive) return;

        const modalNode = modalRef.current;
        if (!modalNode) return;

        const focusableElements = modalNode.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        const handleKeyDown = (e: KeyboardEvent) => {
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

        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                toggleAssistant();
            }
        }

        firstElement?.focus();
        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('keydown', handleEscape);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('keydown', handleEscape);
            assistantTriggerRef.current?.focus();
        };
    }, [isActive, toggleAssistant]);

    const handleStartStop = () => {
        if(isListening) {
            stopConversation();
        } else {
            startConversation();
        }
    }

    return (
        <>
            <button
                ref={assistantTriggerRef}
                onClick={toggleAssistant}
                aria-label={isActive ? "Close Boda Assistant" : "Open Boda Assistant"}
                aria-expanded={isActive}
                aria-controls="boda-assistant-modal"
                className="fixed bottom-6 right-6 bg-brand-red text-white p-4 rounded-full shadow-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-brand-red transition-transform transform hover:scale-110 z-50"
            >
                {isActive ? <XCircleIcon className="w-8 h-8"/> : <MicrophoneIcon className="w-8 h-8" />}
            </button>

            {isActive && (
                <div 
                    id="boda-assistant-modal"
                    ref={modalRef}
                    className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-40 p-4"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby={titleId}
                >
                    <div className="bg-slate-800 w-full max-w-lg h-[80vh] max-h-[700px] rounded-2xl shadow-2xl flex flex-col p-6">
                        <div className="flex-shrink-0 text-center mb-4">
                            <h3 id={titleId} className="text-xl font-bold">Boda Assistant</h3>
                            <p className="text-sm text-slate-400">Ask me anything about road safety, parts, or insurance!</p>
                        </div>
                        <div className="flex-1 bg-slate-900 rounded-lg p-4 overflow-y-auto space-y-4" aria-live="polite" aria-atomic="true">
                            {conversationHistory.map((turn, index) => (
                                <React.Fragment key={index}>
                                    <div className="text-right">
                                        <p className="bg-brand-green inline-block text-white p-2 rounded-lg rounded-br-none">{turn.user}</p>
                                    </div>
                                    <div>
                                        <p className="bg-slate-700 inline-block text-white p-2 rounded-lg rounded-bl-none">{turn.model}</p>
                                    </div>
                                </React.Fragment>
                            ))}
                             {userTranscript && <div className="text-right"><p className="bg-brand-green/70 inline-block text-white p-2 rounded-lg rounded-br-none">{userTranscript}</p></div>}
                             {modelTranscript && <div><p className="bg-slate-700/70 inline-block text-white p-2 rounded-lg rounded-bl-none">{modelTranscript}</p></div>}
                        </div>
                        <div className="flex-shrink-0 pt-6 text-center">
                            <button 
                                onClick={handleStartStop} 
                                className={`relative w-24 h-24 rounded-full transition-colors duration-300 ${isListening ? 'bg-green-500' : 'bg-brand-red'}`}
                                aria-label={isListening ? 'Stop listening' : 'Start listening'}
                                aria-pressed={isListening}
                             >
                                <MicrophoneIcon className="w-10 h-10 text-white mx-auto" />
                                {isListening && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>}
                            </button>
                            <p className="mt-4 text-slate-400" aria-live="polite">{isListening ? 'Listening... tap to stop' : 'Tap to start talking'}</p>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default VoiceAssistant;