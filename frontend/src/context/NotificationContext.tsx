import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';

interface Notification {
    id: string;
    message: string;
    type: 'info' | 'warning' | 'success' | 'error';
    timestamp: Date;
}

interface NotificationContextType {
    notifications: Notification[];
    addNotification: (message: string, type?: 'info' | 'warning' | 'success' | 'error') => void;
    clearNotification: (id: string) => void;
    unreadCount: number;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const { user } = useAuth();

    const addNotification = (message: string, type: 'info' | 'warning' | 'success' | 'error' = 'info') => {
        const newNotification = {
            id: Date.now().toString(),
            message,
            type,
            timestamp: new Date()
        };
        setNotifications(prev => [newNotification, ...prev]);

        // Auto-dismiss after 5 seconds
        setTimeout(() => {
            clearNotification(newNotification.id);
        }, 5000);
    };

    const clearNotification = (id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    // Mock polling for new requests/alerts
    useEffect(() => {
        if (!user) return;

        const interval = setInterval(() => {
            // 10% chance to get a new notification every 30s
            if (Math.random() > 0.9) {
                if (user.role === 'STAFF') {
                    addNotification("New Urgent Blood Request: O+ needed at City Hospital", "warning");
                } else if (user.role === 'DONOR') {
                    addNotification("Urgent need for O+ blood near your location!", "warning");
                }
            }
        }, 30000);

        return () => clearInterval(interval);
    }, [user]);

    return (
        <NotificationContext.Provider value={{
            notifications,
            addNotification,
            clearNotification,
            unreadCount: notifications.length
        }}>
            {children}

            {/* Toast Container */}
            <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
                {notifications.map(n => (
                    <div
                        key={n.id}
                        className={`
                    p-4 rounded-lg shadow-lg text-white max-w-sm animate-in slide-in-from-right-full
                    ${n.type === 'warning' ? 'bg-orange-500' :
                                n.type === 'error' ? 'bg-red-600' :
                                    n.type === 'success' ? 'bg-green-600' : 'bg-blue-600'}
                `}
                    >
                        <div className="flex justify-between items-start">
                            <p className="text-sm font-medium">{n.message}</p>
                            <button onClick={() => clearNotification(n.id)} className="ml-4 text-white/80 hover:text-white">×</button>
                        </div>
                    </div>
                ))}
            </div>
        </NotificationContext.Provider>
    );
}

export function useNotification() {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
}
