import { useState, useEffect } from 'react';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { AlertTriangle, MapPin, Loader2, Megaphone } from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext'; // Added import

export function SOS() {
    const [loading, setLoading] = useState(false);
    const [countdown, setCountdown] = useState(0);
    const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
    const { addNotification } = useNotification();
    const { token } = useAuth(); // Get token from context

    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });
                },
                (err) => console.error(err)
            );
        }
    }, []);

    const handleSOSClick = async () => {
        if (!location) {
            addNotification("Location required for SOS", "error");
            return;
        }

        setLoading(true);
        // 3 second safety countdown
        let count = 3;
        setCountdown(count);

        const interval = setInterval(async () => {
            count--;
            setCountdown(count);
            if (count === 0) {
                clearInterval(interval);
                await triggerSOS();
            }
        }, 1000);
    };



    const triggerSOS = async () => {
        if (!location) return;

        console.log("SOS: Triggering with token:", token ? "Token exists" : "Token is MISSING");

        try {
            const res = await fetch('http://localhost:8000/api/sos', { // Fixed endpoint
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` // Added Auth
                },
                body: JSON.stringify({
                    latitude: location.lat,
                    longitude: location.lng,
                    message: "Emergency SOS triggered by user" // Changed key to 'message' to match backend
                })
            });
            const data = await res.json();
            if (res.ok) {
                addNotification(data.message, "success");
            } else {
                addNotification(data.message || "Failed to send SOS", "error");
            }
        } catch (error) {
            addNotification("Failed to send SOS", "error");
        } finally {
            setLoading(false);
            setCountdown(0);
        }
    };

    return (
        <div className="max-w-2xl mx-auto text-center space-y-8 py-10">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold text-gray-900 flex items-center justify-center gap-3">
                    <AlertTriangle className="h-10 w-10 text-red-600" />
                    Emergency SOS
                </h1>
                <p className="text-gray-600">
                    Press the button below to instantly broadcast a request to all donors within 10km.
                    <br />
                    <span className="font-bold text-red-600">Only use this in critical life-threatening situations.</span>
                </p>
            </div>

            <div className="flex justify-center">
                <button
                    onClick={handleSOSClick}
                    disabled={loading || !location}
                    className={`
                relative w-64 h-64 rounded-full border-8 border-red-100 shadow-2xl flex flex-col items-center justify-center
                transition-all duration-300 transform
                ${loading ? 'bg-red-500 scale-95' : 'bg-red-600 hover:bg-red-700 hover:scale-105 active:scale-95'}
            `}
                >
                    {loading ? (
                        <div className="flex flex-col items-center animate-pulse text-white">
                            <span className="text-6xl font-black">{countdown > 0 ? countdown : '...'}</span>
                            <span className="text-sm font-medium uppercase tracking-wider mt-2">Broadcasting</span>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center text-white">
                            <Megaphone className="h-16 w-16 mb-2" />
                            <span className="text-4xl font-black tracking-widest">SOS</span>
                            <span className="text-xs font-medium opacity-80 mt-1">TAP TO BROADCAST</span>
                        </div>
                    )}

                    {/* Ripple Effect Animation */}
                    {!loading && (
                        <span className="absolute inset-0 rounded-full animate-ping bg-red-400 opacity-20"></span>
                    )}
                </button>
            </div>

            <Card className="bg-red-50 border-red-100">
                <CardContent className="p-4 flex items-center justify-center gap-2 text-red-800">
                    {location ? (
                        <>
                            <MapPin className="h-4 w-4" />
                            <span className="text-sm font-medium">
                                Location Locked: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                            </span>
                        </>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span className="text-sm">Acquiring GPS Signal...</span>
                        </div>
                    )}
                </CardContent>
            </Card>

            <p className="text-xs text-gray-400 max-w-md mx-auto">
                By acting, you agree that this is a genuine emergency. False alarms may result in account suspension.
            </p>
        </div>
    );
}
