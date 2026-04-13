import { useState, useRef, useEffect } from 'react';
import * as React from 'react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Bot, User, Send, Loader2, Sparkles, Mic, MicOff, Volume2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuth } from '../../context/AuthContext';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
}

export function AiAssistant() {
    const { user } = useAuth();
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            role: 'assistant',
            content: `Hello ${user?.full_name || 'there'}! I'm your AI health assistant. Ask me anything about blood donation eligibility, the process, or health tips.`
        }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async (e?: React.FormEvent, audioData?: string) => {
        e?.preventDefault();
        const content = audioData ? "(Voice Message)" : inputValue;
        if (!content.trim() && !audioData || isLoading) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: audioData ? "🎤 [Voice Message]" : inputValue
        };

        setMessages(prev => [...prev, userMessage]);
        if (!audioData) setInputValue('');
        setIsLoading(true);

        try {
            const endpoint = audioData ? '/api/ai/voice-chat' : '/api/ai/donor-chat';
            const payload = audioData 
                ? { audio: audioData } 
                : { message: userMessage.content, history: messages.slice(1) };

            const response = await fetch(`http://localhost:8000${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || "Failed to communicate with AI server");
            }

            const data = await response.json();
            const reply = data.reply || "I'm sorry, I couldn't process that request right now.";

            const assistantMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: reply
            };

            setMessages(prev => [...prev, assistantMessage]);

            if (audioData) {
                speakResponse(reply);
            }
        } catch (error: any) {
            console.error("Chat error:", error);
            setMessages(prev => [...prev, {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: error.message || "Sorry, I'm having trouble connecting to the server. Please try again later."
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                const reader = new FileReader();
                reader.readAsDataURL(audioBlob);
                reader.onloadend = () => {
                    const base64Audio = reader.result as string;
                    handleSendMessage(undefined, base64Audio);
                };
            };

            mediaRecorder.start();
            setIsRecording(true);
        } catch (error) {
            console.error("Error accessing microphone:", error);
            alert("Could not access microphone. Please check permissions.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
            setIsRecording(false);
        }
    };

    const speakResponse = (text: string) => {
        if (!window.speechSynthesis) return;

        // Cancel any ongoing speech
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        
        // Try to find a good voice (Tamil if text contains Tamil characters)
        const voices = window.speechSynthesis.getVoices();
        const isTamil = /[\u0B80-\u0BFF]/.test(text);
        
        if (isTamil) {
            utterance.lang = 'ta-IN';
            const tamilVoice = voices.find(v => v.lang.startsWith('ta'));
            if (tamilVoice) utterance.voice = tamilVoice;
        } else {
            utterance.lang = 'en-US';
            const englishVoice = voices.find(v => v.lang.startsWith('en') && v.name.includes('Google'));
            if (englishVoice) utterance.voice = englishVoice;
        }

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);

        window.speechSynthesis.speak(utterance);
    };

    return (
        <div className="max-w-4xl mx-auto h-[calc(100vh-8rem)] flex flex-col">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <Sparkles className="h-6 w-6 text-purple-600" />
                    AI Health Assistant
                </h1>
                <p className="text-gray-500">Powered by Gemini AI</p>
            </div>

            <Card className="flex-1 flex flex-col overflow-hidden border-purple-100 shadow-lg">
                <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
                    {messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={cn(
                                "flex items-start gap-3 max-w-[80%]",
                                msg.role === 'user' ? "ml-auto flex-row-reverse" : "mr-auto"
                            )}
                        >
                            <div className={cn(
                                "h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm",
                                msg.role === 'user' ? "bg-red-100" : "bg-purple-100"
                            )}>
                                {msg.role === 'user' ? <User className="h-5 w-5 text-red-600" /> : <Bot className="h-5 w-5 text-purple-600" />}
                            </div>

                            <div className={cn(
                                "p-3 rounded-2xl text-sm shadow-sm",
                                msg.role === 'user'
                                    ? "bg-red-600 text-white rounded-tr-none"
                                    : "bg-white text-gray-800 border border-gray-100 rounded-tl-none"
                            )}>
                                {msg.content}
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex items-center gap-2 text-gray-400 text-sm ml-12 animate-pulse">
                            <Loader2 className="h-4 w-4 animate-spin text-purple-500" />
                            <span className="font-medium">{isRecording ? "Listening..." : "Thinking..."}</span>
                        </div>
                    )}
                    {isSpeaking && (
                        <div className="flex items-center justify-between bg-purple-50 p-3 rounded-xl border border-purple-100 ml-12 animate-in fade-in slide-in-from-left-2">
                            <div className="flex items-center gap-2 text-purple-600 text-sm">
                                <Volume2 className="h-4 w-4 animate-bounce" />
                                <span className="font-medium italic text-purple-500">The assistant is speaking...</span>
                            </div>
                            <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => window.speechSynthesis.cancel()}
                                className="h-8 text-xs font-semibold text-purple-700 border-purple-200 hover:bg-purple-100"
                            >
                                Stop Speaking
                            </Button>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </CardContent>

                <div className="p-4 bg-white border-t border-gray-100">
                    <form onSubmit={handleSendMessage} className="flex gap-2">
                        <div className="relative flex-1 flex items-center">
                            <Input
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                placeholder={isRecording ? "Listening..." : "Ask about blood donation eligibility..."}
                                className={cn(
                                    "flex-1 focus-visible:ring-purple-500 transition-all duration-300",
                                    isRecording && "pl-12 ring-2 ring-red-400 border-transparent shadow-[0_0_15px_rgba(239,68,68,0.3)]"
                                )}
                                disabled={isLoading || isRecording}
                            />
                            {isRecording && (
                                <div className="absolute left-3 flex gap-1 items-center animate-in fade-in zoom-in duration-300">
                                    <div className="w-1 h-3 bg-red-400 rounded-full animate-bounce [animation-duration:0.6s]"></div>
                                    <div className="w-1 h-5 bg-red-500 rounded-full animate-bounce [animation-duration:0.6s] [animation-delay:0.2s]"></div>
                                    <div className="w-1 h-3 bg-red-400 rounded-full animate-bounce [animation-duration:0.6s] [animation-delay:0.4s]"></div>
                                </div>
                            )}
                        </div>
                        <Button
                            type="button"
                            size="icon"
                            variant="outline"
                            onClick={isRecording ? stopRecording : startRecording}
                            disabled={isLoading}
                            className={cn(
                                "h-10 w-10 flex-shrink-0 rounded-lg transition-all duration-300 relative overflow-hidden",
                                isRecording 
                                    ? "bg-red-500 hover:bg-red-600 text-white border-transparent shadow-lg scale-110" 
                                    : "border-gray-200 text-gray-600 hover:border-purple-300"
                            )}
                        >
                            {isRecording && (
                                <span className="absolute inset-0 bg-white/20 animate-ping rounded-full pointer-events-none"></span>
                            )}
                            {isRecording ? <MicOff className="h-4 w-4 relative z-10" /> : <Mic className="h-4 w-4 relative z-10" />}
                        </Button>
                        <Button
                            type="submit"
                            disabled={isLoading || !inputValue.trim() || isRecording}
                            className="bg-purple-600 hover:bg-purple-700 h-10 w-10 p-0"
                        >
                            <Send className="h-4 w-4" />
                        </Button>
                    </form>
                </div>
            </Card>
        </div>
    );
}
