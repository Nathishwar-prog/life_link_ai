import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { Search, MapPin, Navigation, Phone, ArrowRight, Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

// Fix Leaflet default icon issue
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Sub-component to handle map view updates
function MapUpdater({ center }: { center: [number, number] }) {
    const map = useMap();
    useEffect(() => {
        map.setView(center, 13);
    }, [center, map]);
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
}

export function SearchBlood() {
    const [bloodType, setBloodType] = useState('O+');
    const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [results, setResults] = useState<BloodBankResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedBank, setSelectedBank] = useState<string | null>(null);

    useEffect(() => {
        // Get user's current location on mount
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
                    // Default location (e.g., New York) if permission denied
                    setLocation({ lat: 40.7128, lng: -74.0060 });
                }
            );
        }
    }, []);

    const handleSearch = async () => {
        if (!location) return;
        setLoading(true);
        try {
            const res = await fetch('http://localhost:8000/api/search-blood', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    latitude: location.lat,
                    longitude: location.lng,
                    blood_type: bloodType
                })
            });
            const data = await res.json();
            setResults(data.results || []);
        } catch (error) {
            console.error("Search failed:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleNavigate = (lat: number, lng: number) => {
        window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
    };

    const handleCall = (phone?: string) => {
        if (phone) window.open(`tel:${phone}`);
    };

    return (
        <div className="h-[calc(100vh-8rem)] flex flex-col md:flex-row gap-4">
            {/* Left Sidebar: Search & Results */}
            <div className="w-full md:w-[400px] flex flex-col gap-4">
                <Card className="border-red-100 shadow-md">
                    <CardContent className="p-5 space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <Search className="h-5 w-5 text-red-600" />
                                Find Blood
                            </h2>
                            {location && (
                                <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full font-medium flex items-center">
                                    <MapPin className="h-3 w-3 mr-1" /> Located
                                </span>
                            )}
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-700">Select Blood Type</label>
                            <div className="relative">
                                <select
                                    value={bloodType}
                                    onChange={(e) => setBloodType(e.target.value)}
                                    className="block w-full rounded-lg border-gray-200 bg-gray-50 py-2.5 px-4 pr-8 text-sm focus:border-red-500 focus:ring-red-500 appearance-none font-medium"
                                >
                                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(type => (
                                        <option key={type} value={type}>{type}</option>
                                    ))}
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                                    <ArrowRight className="h-4 w-4 rotate-90" />
                                </div>
                            </div>
                        </div>

                        <Button
                            onClick={handleSearch}
                            disabled={loading || !location}
                            className="w-full bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-100"
                        >
                            {loading ? 'Searching Nearby...' : 'Search Blood Banks'}
                        </Button>
                    </CardContent>
                </Card>

                <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                    {results.map((bank) => (
                        <Card
                            key={bank.id}
                            className={cn(
                                "transition-all duration-200 cursor-pointer border hover:border-red-300 hover:shadow-md",
                                selectedBank === bank.id ? "border-red-500 ring-1 ring-red-500 bg-red-50/30" : "border-gray-100"
                            )}
                            onClick={() => setSelectedBank(bank.id)}
                        >
                            <CardContent className="p-4">
                                <div className="flex justify-between items-start">
                                    <div className="space-y-1">
                                        <h3 className="font-bold text-gray-900">{bank.name}</h3>
                                        <p className="text-xs text-gray-500 line-clamp-1">{bank.address}</p>

                                        <div className="flex items-center gap-3 mt-3">
                                            <div className="flex items-center text-xs font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded">
                                                <Navigation className="h-3 w-3 mr-1" />
                                                {Number(bank.distance_km).toFixed(1)} km
                                            </div>
                                            <div className={cn(
                                                "flex items-center text-xs font-bold px-2 py-1 rounded",
                                                Number(bank.units_available) > 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                                            )}>
                                                <DropletIcon className="h-3 w-3 mr-1" />
                                                {bank.units_available || 0} units
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {selectedBank === bank.id && (
                                    <div className="mt-4 flex gap-2 pt-3 border-t border-gray-100">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="flex-1 h-8 text-xs"
                                            onClick={(e) => { e.stopPropagation(); handleCall(bank.contact_phone); }}
                                            disabled={!bank.contact_phone}
                                        >
                                            <Phone className="h-3 w-3 mr-2" /> Call
                                        </Button>
                                        <Button
                                            size="sm"
                                            className="flex-1 h-8 text-xs bg-red-600 hover:bg-red-700"
                                            onClick={(e) => { e.stopPropagation(); handleNavigate(bank.latitude, bank.longitude); }}
                                        >
                                            <Navigation className="h-3 w-3 mr-2" /> Directions
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}

                    {results.length === 0 && !loading && (
                        <div className="text-center py-10 px-4 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                            <div className="bg-white p-3 rounded-full inline-block mb-3 shadow-sm">
                                <Search className="h-6 w-6 text-gray-400" />
                            </div>
                            <p className="text-sm text-gray-500 font-medium">Select a blood type and search to find nearby donors.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Right: Map */}
            <div className="flex-1 rounded-xl overflow-hidden border border-gray-200 shadow-sm relative z-0 bg-gray-50">
                {location ? (
                    <MapContainer
                        center={[location.lat, location.lng]}
                        zoom={13}
                        className="h-full w-full"
                    >
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        />
                        <MapUpdater center={selectedBank && results.find(r => r.id === selectedBank)
                            ? [results.find(r => r.id === selectedBank)!.latitude, results.find(r => r.id === selectedBank)!.longitude]
                            : [location.lat, location.lng]}
                        />

                        {/* User Location Marker */}
                        <Marker position={[location.lat, location.lng]}>
                            <Popup className="font-sans">
                                <div className="text-center">
                                    <div className="font-bold text-gray-900">You are here</div>
                                </div>
                            </Popup>
                        </Marker>

                        {/* Result Markers */}
                        {results.map((bank) => (
                            <Marker
                                key={bank.id}
                                position={[bank.latitude, bank.longitude]}
                                eventHandlers={{
                                    click: () => setSelectedBank(bank.id),
                                }}
                            >
                                <Popup className="font-sans min-w-[200px]">
                                    <div className="space-y-2">
                                        <h3 className="font-bold text-sm">{bank.name}</h3>
                                        <p className="text-xs text-gray-500">{bank.address}</p>
                                        <div className="flex items-center gap-2">
                                            <span className={cn(
                                                "text-xs font-bold px-2 py-0.5 rounded",
                                                Number(bank.units_available) > 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                                            )}>
                                                {bank.units_available} units ({bloodType})
                                            </span>
                                        </div>
                                        <button
                                            onClick={() => handleNavigate(bank.latitude, bank.longitude)}
                                            className="text-xs text-blue-600 hover:underline flex items-center mt-1"
                                        >
                                            Get Directions <ArrowRight className="h-3 w-3 ml-1" />
                                        </button>
                                    </div>
                                </Popup>
                            </Marker>
                        ))}
                    </MapContainer>
                ) : (
                    <div className="h-full w-full flex flex-col items-center justify-center text-gray-500 gap-3">
                        <Loader2 className="h-8 w-8 animate-spin text-red-600" />
                        <p>Acquiring your location...</p>
                    </div>
                )}
            </div>
        </div>
    );
}

function DropletIcon({ className }: { className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className={className}
        >
            <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
        </svg>
    )
}
