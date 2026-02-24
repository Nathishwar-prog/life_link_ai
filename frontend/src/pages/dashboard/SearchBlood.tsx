import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, ZoomControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { Search, MapPin, Navigation, Phone, ArrowRight, Loader2, RefreshCw, Droplet, Clock } from 'lucide-react';
import { cn } from '../../lib/utils';
import { renderToStaticMarkup } from 'react-dom/server';

// Custom Marker Component for rendering logic
const CustomMarker = ({ type, count }: { type: string, count: number }) => (
    <div className={cn(
        "relative flex items-center justify-center w-10 h-10 rounded-full border-2 shadow-lg transform transition-transform hover:scale-110",
        count > 0 ? "bg-red-600 border-white text-white" : "bg-gray-200 border-gray-400 text-gray-500"
    )}>
        <Droplet className="w-5 h-5 fill-current" />
        <span className="absolute -top-1 -right-1 bg-white text-xs font-bold px-1.5 py-0.5 rounded-full border border-gray-200 shadow-sm text-gray-800">
            {count}
        </span>
    </div>
);

// Function to create Leaflet icon from React component
const createCustomIcon = (type: string, count: number) => {
    const markup = renderToStaticMarkup(<CustomMarker type={type} count={count} />);
    return L.divIcon({
        html: markup,
        className: 'custom-leaflet-marker',
        iconSize: [40, 40],
        iconAnchor: [20, 20],
        popupAnchor: [0, -20]
    });
};

const UserLocationIcon = L.divIcon({
    html: renderToStaticMarkup(
        <div className="w-4 h-4 bg-blue-500 rounded-full border-4 border-white shadow-lg pulse-ring"></div>
    ),
    className: 'user-location-marker',
    iconSize: [20, 20],
    iconAnchor: [10, 10]
});


// Sub-component to handle map view updates
function MapUpdater({ center, zoom }: { center: [number, number], zoom?: number }) {
    const map = useMap();
    useEffect(() => {
        if (center) {
            map.flyTo(center, zoom || 14, {
                animate: true,
                duration: 1.5
            });
        }
    }, [center, zoom, map]);
    return null;
}

interface BloodBankResult {
    id: string;
    name: string;
    address: string;
    latitude: number;
    longitude: number;
    distance_km: number;
    units_available: number;
    contact_phone?: string;
    is_active?: boolean;
    updated_at?: string;
}

export function SearchBlood() {
    const [bloodType, setBloodType] = useState('O+');
    const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [results, setResults] = useState<BloodBankResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedBankId, setSelectedBankId] = useState<string | null>(null);
    const [autoRefresh, setAutoRefresh] = useState(false);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    // Initial location fetch
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });
                },
                (error) => {
                    console.error("Error getting location:", error);
                    // Default to New York if denied, or handle gracefully
                    setLocation({ lat: 40.7128, lng: -74.0060 });
                }
            );
        }
    }, []);

    const fetchBloodBanks = async () => {
        if (!location) return;
        setLoading(true);
        try {
            const res = await fetch('http://localhost:8000/api/search-blood', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    latitude: location.lat,
                    longitude: location.lng,
                    blood_type: bloodType,
                    // Optional: radius or other params
                })
            });
            const data = await res.json();
            setResults(data.results || []);
            setLastUpdated(new Date());
        } catch (error) {
            console.error("Search failed:", error);
        } finally {
            setLoading(false);
        }
    };

    // Manual search trigger
    const handleSearch = () => {
        fetchBloodBanks();
    };

    // Auto-refresh logic
    useEffect(() => {
        if (autoRefresh) {
            fetchBloodBanks(); // Initial fetch on enable
            intervalRef.current = setInterval(fetchBloodBanks, 30000); // 30s poll
        } else {
            if (intervalRef.current) clearInterval(intervalRef.current);
        }
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [autoRefresh, location, bloodType]);


    const handleNavigate = (lat: number, lng: number) => {
        window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
    };

    const handleCall = (phone?: string) => {
        if (phone) window.open(`tel:${phone}`);
    };

    const selectedBank = results.find(r => r.id === selectedBankId);

    return (
        <div className="h-[calc(100vh-6rem)] flex flex-col md:flex-row gap-6 p-2 md:p-4">
            {/* Sidebar Controls */}
            <div className="w-full md:w-[420px] flex flex-col gap-4 h-full">
                {/* Search Card */}
                <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm rounded-2xl overflow-hidden">
                    <CardContent className="p-6 space-y-5">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                <span className="bg-red-100 p-2 rounded-lg text-red-600">
                                    <Search className="h-5 w-5" />
                                </span>
                                Find Blood
                            </h2>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setAutoRefresh(!autoRefresh)}
                                    className={cn(
                                        "p-2 rounded-full transition-all duration-300",
                                        autoRefresh ? "bg-green-100 text-green-700 animate-pulse" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                                    )}
                                    title={autoRefresh ? "Live updates on" : "Enable live updates"}
                                >
                                    <RefreshCw className={cn("h-4 w-4", autoRefresh && "animate-spin")} />
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700 ml-1">Select Blood Type</label>
                            <div className="grid grid-cols-4 gap-2">
                                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(type => (
                                    <button
                                        key={type}
                                        onClick={() => setBloodType(type)}
                                        className={cn(
                                            "py-2 px-1 rounded-lg text-sm font-bold transition-all duration-200 border",
                                            bloodType === type
                                                ? "bg-red-600 text-white border-red-600 shadow-lg shadow-red-200 scale-105"
                                                : "bg-white text-gray-600 border-gray-200 hover:border-red-300 hover:bg-red-50"
                                        )}
                                    >
                                        {type}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <Button
                            onClick={handleSearch}
                            disabled={loading || !location}
                            className="w-full h-12 text-base bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white shadow-xl shadow-red-200 rounded-xl transition-all duration-300 transform hover:translate-y-[-1px]"
                        >
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <Loader2 className="h-4 w-4 animate-spin" /> Scanning Network...
                                </span>
                            ) : (
                                'Search Nearby Banks'
                            )}
                        </Button>

                        {lastUpdated && (
                            <div className="text-xs text-center text-gray-400 flex items-center justify-center gap-1">
                                <Clock className="h-3 w-3" />
                                Updated: {lastUpdated.toLocaleTimeString()}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Results List */}
                <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                    {results.map((bank) => (
                        <div
                            key={bank.id}
                            onClick={() => setSelectedBankId(bank.id)}
                            className={cn(
                                "group bg-white p-4 rounded-xl border transition-all duration-300 cursor-pointer relative overflow-hidden",
                                selectedBankId === bank.id
                                    ? "border-red-500 ring-4 ring-red-50 shadow-lg z-10"
                                    : "border-gray-100 hover:border-red-200 hover:shadow-md"
                            )}
                        >
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-bold text-gray-900 group-hover:text-red-700 transition-colors">
                                        {bank.name}
                                    </h3>
                                    <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                                        <MapPin className="h-3 w-3 shrink-0" />
                                        <span className="truncate max-w-[200px]">{bank.address}</span>
                                    </div>
                                </div>
                                <div className={cn(
                                    "flex flex-col items-center justify-center p-2 rounded-lg min-w-[60px]",
                                    bank.units_available > 0 ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                                )}>
                                    <span className="text-xl font-bold">{bank.units_available}</span>
                                    <span className="text-[10px] font-medium uppercase">Units</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 mt-4 pt-3 border-t border-dashed border-gray-100">
                                <div className="text-xs font-medium text-gray-500 bg-gray-50 px-2 py-1 rounded-md">
                                    <Navigation className="h-3 w-3 inline mr-1" />
                                    {bank.distance_km} km away
                                </div>
                                {selectedBankId === bank.id && (
                                    <div className="flex gap-2 ml-auto animate-in fade-in slide-in-from-right-4 duration-300">
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="h-7 text-xs hover:bg-red-50 hover:text-red-600"
                                            onClick={(e) => { e.stopPropagation(); handleCall(bank.contact_phone); }}
                                        >
                                            <Phone className="h-3 w-3" />
                                        </Button>
                                        <Button
                                            size="sm"
                                            className="h-7 text-xs bg-gray-900 text-white hover:bg-black"
                                            onClick={(e) => { e.stopPropagation(); handleNavigate(bank.latitude, bank.longitude); }}
                                        >
                                            Directions
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}

                    {results.length === 0 && !loading && (
                        <div className="flex flex-col items-center justify-center h-48 text-gray-400 bg-gray-50/50 rounded-2xl border-2 border-dashed border-gray-200">
                            <Search className="h-8 w-8 mb-2 opacity-20" />
                            <p className="text-sm font-medium">Ready to search</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Map Container */}
            <div className="flex-1 rounded-3xl overflow-hidden shadow-2xl relative z-0 border border-gray-200/50 bg-gray-100">
                {location ? (
                    <MapContainer
                        center={[location.lat, location.lng]}
                        zoom={13}
                        className="h-full w-full"
                        zoomControl={false}
                    >
                        <ZoomControl position="bottomright" />
                        {/* CartoDB Voyager Tiles - Free, No API Key, Beautiful */}
                        <TileLayer
                            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                        />

                        <MapUpdater
                            center={selectedBank ? [selectedBank.latitude, selectedBank.longitude] : [location.lat, location.lng]}
                            zoom={selectedBank ? 16 : 13}
                        />

                        {/* User Location */}
                        <Marker position={[location.lat, location.lng]} icon={UserLocationIcon}>
                            <Popup>
                                <span className="font-bold text-gray-700">You are here</span>
                            </Popup>
                        </Marker>

                        {/* Blood Bank Markers */}
                        {results.map((bank) => (
                            <Marker
                                key={bank.id}
                                position={[bank.latitude, bank.longitude]}
                                icon={createCustomIcon(bloodType, bank.units_available)}
                                eventHandlers={{
                                    click: () => setSelectedBankId(bank.id),
                                }}
                            >
                                <Popup className="custom-popup" closeButton={false}>
                                    <div className="p-1 min-w-[180px]">
                                        <h3 className="font-bold text-gray-900 text-sm mb-1">{bank.name}</h3>
                                        <div className="flex items-center justify-between mt-2">
                                            <span className={cn(
                                                "text-xs font-bold px-2 py-1 rounded-full",
                                                bank.units_available > 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                                            )}>
                                                {bank.units_available} Units Available
                                            </span>
                                        </div>
                                    </div>
                                </Popup>
                            </Marker>
                        ))}
                    </MapContainer>
                ) : (
                    <div className="h-full w-full flex flex-col items-center justify-center bg-gray-50">
                        <Loader2 className="h-10 w-10 animate-spin text-red-600 mb-4" />
                        <h3 className="text-lg font-bold text-gray-800">Locating you...</h3>
                        <p className="text-gray-500">Please allow location access to find nearest banks.</p>
                    </div>
                )}
            </div>
            <style>{`
                .custom-leaflet-marker {
                    background: transparent;
                    border: none;
                }
                .pulse-ring {
                    box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7);
                    animation: pulse-blue 2s infinite;
                }
                @keyframes pulse-blue {
                    0% {
                        transform: scale(0.95);
                        box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7);
                    }
                    70% {
                        transform: scale(1);
                        box-shadow: 0 0 0 10px rgba(59, 130, 246, 0);
                    }
                    100% {
                        transform: scale(0.95);
                        box-shadow: 0 0 0 0 rgba(59, 130, 246, 0);
                    }
                }
            `}</style>
        </div>
    );
}

