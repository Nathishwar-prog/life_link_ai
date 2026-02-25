import React, { useState, useRef, useEffect } from 'react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Bot, User, Send, Loader2, Sparkles, MessageCircle, X } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../context/AuthContext';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
}

export function FloatingChat() {
    const { user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            role: 'assistant',
            content: `Hello ${user?.full_name || 'there'}! I'm your AI health assistant. Ask me anything about blood donation eligibility, the process, or health tips.`
        }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
        }
    }, [messages, isOpen]);

    const handleSendMessage = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!inputValue.trim() || isLoading) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: inputValue
        };

        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setIsLoading(true);

        try {
            const response = await fetch('http://localhost:8000/api/ai/donor-chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    message: userMessage.content,
                    history: messages.slice(1) // exclude the system greeting message
                })
            });

            const data = await response.json();

            const assistantMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: data.reply || "I'm sorry, I couldn't process that request right now."
            };

            setMessages(prev => [...prev, assistantMessage]);
        } catch (error) {
            console.error("Chat error:", error);
            setMessages(prev => [...prev, {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: "Sorry, I'm having trouble connecting to the server. Please try again later."
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end">
            {/* Chat Window */}
            {isOpen && (
                <Card className="w-[350px] sm:w-[400px] h-[500px] shadow-2xl mb-4 flex flex-col overflow-hidden border-purple-100 bg-white animate-in slide-in-from-bottom-5 fade-in duration-300">
                    <CardHeader className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-4 flex flex-row items-center justify-between shadow-sm rounded-t-xl">
                        <div className="flex items-center gap-2">
                            <Sparkles className="h-5 w-5 text-purple-200" />
                            <CardTitle className="text-lg font-semibold tracking-wide">AI Assistant</CardTitle>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-white hover:bg-white/20 hover:text-white h-8 w-8 rounded-full"
                            onClick={() => setIsOpen(false)}
                        >
                            <X className="h-5 w-5" />
                        </Button>
                    </CardHeader>

                    <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/80">
                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={cn(
                                    "flex items-start gap-3 max-w-[85%]",
                                    msg.role === 'user' ? "ml-auto flex-row-reverse" : "mr-auto"
                                )}
                            >
                                <div className={cn(
                                    "h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm transition-transform hover:scale-105",
                                    msg.role === 'user' ? "bg-red-100" : "bg-purple-100"
                                )}>
                                    {msg.role === 'user' ? <User className="h-5 w-5 text-red-600" /> : <Bot className="h-5 w-5 text-purple-600" />}
                                </div>

                                <div className={cn(
                                    "p-3 rounded-2xl text-sm shadow-sm",
                                    msg.role === 'user'
                                        ? "bg-gradient-to-br from-red-500 to-red-600 text-white rounded-tr-none shadow-md"
                                        : "bg-white text-gray-800 border border-gray-100 rounded-tl-none shadow-md"
                                )}>
                                    {msg.content}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex items-center gap-2 text-gray-400 text-sm ml-12 animate-pulse">
                                <Loader2 className="h-4 w-4 animate-spin text-purple-500" />
                                <span className="font-medium">Thinking...</span>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </CardContent>

                    <div className="p-3 bg-white border-t border-gray-100 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                        <form onSubmit={handleSendMessage} className="flex gap-2">
                            <Input
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                placeholder="Type a message..."
                                className="flex-1 text-sm bg-gray-50 border-gray-200 focus-visible:ring-purple-500 rounded-full px-4"
                                disabled={isLoading}
                            />
                            <Button
                                type="submit"
                                size="icon"
                                disabled={isLoading || !inputValue.trim()}
                                className="bg-purple-600 hover:bg-purple-700 h-10 w-10 flex-shrink-0 rounded-full shadow-md transition-transform hover:scale-105"
                            >
                                <Send className="h-4 w-4" />
                            </Button>
                        </form>
                    </div>
                </Card>
            )}

            {/* Floating Toggle Button */}
            <Button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "h-14 w-14 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all duration-300 flex items-center justify-center transform hover:-translate-y-1",
                    isOpen
                        ? "bg-gray-800 hover:bg-gray-900 border-2 border-transparent scale-90 shadow-none"
                        : "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 hover:scale-110 ring-4 ring-purple-100"
                )}
            >
                {isOpen ? (
                    <X className="h-6 w-6 text-white" />
                ) : (
                    <MessageCircle className="h-7 w-7 text-white animate-in" />
                )}
            </Button>
        </div>
    );
}
