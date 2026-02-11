import { useState, useEffect } from 'react';
import * as React from 'react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { useAuth } from '../../context/AuthContext';
import { Plus, User, MapPin, Phone, Filter } from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';

interface Donor {
    id: string;
    full_name: string;
    blood_type: string;
    city: string;
    phone_number: string;
    is_available: boolean;
}

export function Donors() {
    const { user } = useAuth();
    const { addNotification } = useNotification();
    const [donors, setDonors] = useState<Donor[]>([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const [bloodFilter, setBloodFilter] = useState('');
    const [cityFilter, setCityFilter] = useState('');

    // Add Donor Form
    const [isAdding, setIsAdding] = useState(false);
    const [newDonor, setNewDonor] = useState({
        full_name: '',
        blood_type: '',
        phone_number: '',
        city: '',
        email: '',
        address: ''
    });

    useEffect(() => {
        fetchDonors();
    }, [bloodFilter, cityFilter]);

    const fetchDonors = async () => {
        try {
            const query = new URLSearchParams();
            if (bloodFilter) query.append('blood_type', bloodFilter);
            if (cityFilter) query.append('city', cityFilter);

            const res = await fetch(`http://localhost:8000/api/donors?${query.toString()}`);
            const data = await res.json();
            if (Array.isArray(data)) {
                setDonors(data);
            } else {
                setDonors([]);
            }
        } catch (error) {
            console.error("Failed to fetch donors", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddDonor = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('http://localhost:8000/api/donors', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(newDonor)
            });

            if (res.ok) {
                addNotification("Donor added successfully", "success");
                setIsAdding(false);
                fetchDonors();
                setNewDonor({ full_name: '', blood_type: '', phone_number: '', city: '', email: '', address: '' });
            } else {
                addNotification("Failed to add donor", "error");
            }
        } catch (error) {
            addNotification("Error connecting to server", "error");
        }
    };

    const isAdmin = user?.role === 'ADMIN';

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Donor Registry</h1>
                    <p className="text-gray-500">Find and manage blood donors.</p>
                </div>
                {isAdmin && (
                    <Button onClick={() => setIsAdding(!isAdding)} className="bg-red-600 hover:bg-red-700">
                        <Plus className="h-4 w-4 mr-2" />
                        Add New Donor
                    </Button>
                )}
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="p-4 flex gap-4 items-end">
                    <div className="flex-1">
                        <label className="text-xs font-medium text-gray-500 mb-1 block">Blood Type</label>
                        <select
                            className="w-full p-2 border border-gray-300 rounded-md"
                            value={bloodFilter}
                            onChange={(e) => setBloodFilter(e.target.value)}
                        >
                            <option value="">All Blood Types</option>
                            {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(type => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex-1">
                        <label className="text-xs font-medium text-gray-500 mb-1 block">City</label>
                        <Input
                            placeholder="Filter by City"
                            value={cityFilter}
                            onChange={(e) => setCityFilter(e.target.value)}
                        />
                    </div>
                    <Button variant="outline" onClick={fetchDonors}>
                        <Filter className="h-4 w-4 mr-2" />
                        Apply Filters
                    </Button>
                </CardContent>
            </Card>

            {/* Add Donor Form */}
            {isAdding && (
                <Card className="bg-red-50 border-red-100 animate-in slide-in-from-top-4">
                    <CardHeader>
                        <CardTitle>Register New Donor</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleAddDonor} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input placeholder="Full Name" required value={newDonor.full_name} onChange={e => setNewDonor({ ...newDonor, full_name: e.target.value })} />
                            <select
                                className="w-full p-2 border border-gray-300 rounded-md"
                                value={newDonor.blood_type}
                                onChange={(e) => setNewDonor({ ...newDonor, blood_type: e.target.value })}
                                required
                            >
                                <option value="">Select Blood Type</option>
                                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(type => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </select>
                            <Input placeholder="Phone Number" required value={newDonor.phone_number} onChange={e => setNewDonor({ ...newDonor, phone_number: e.target.value })} />
                            <Input placeholder="City" required value={newDonor.city} onChange={e => setNewDonor({ ...newDonor, city: e.target.value })} />
                            <Input placeholder="Email (Optional)" type="email" value={newDonor.email} onChange={e => setNewDonor({ ...newDonor, email: e.target.value })} />
                            <Input placeholder="Address (Optional)" value={newDonor.address} onChange={e => setNewDonor({ ...newDonor, address: e.target.value })} />

                            <div className="col-span-full flex justify-end gap-2 mt-2">
                                <Button type="button" variant="outline" onClick={() => setIsAdding(false)}>Cancel</Button>
                                <Button type="submit" className="bg-red-600 text-white">Save Donor</Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            {/* Donors List */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {loading ? (
                    <p className="text-gray-500">Loading donors...</p>
                ) : donors.length === 0 ? (
                    <p className="text-gray-500 col-span-full text-center py-10">No donors found matching criteria.</p>
                ) : (
                    donors.map(donor => (
                        <Card key={donor.id} className="hover:shadow-md transition-shadow">
                            <CardHeader className="pb-2">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600">
                                            <User className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-lg">{donor.full_name}</CardTitle>
                                            <p className="text-xs text-gray-500">{donor.is_available ? 'Available' : 'Unavailable'}</p>
                                        </div>
                                    </div>
                                    <span className="text-sm font-bold px-2 py-1 bg-red-100 text-red-700 rounded-md">
                                        {donor.blood_type}
                                    </span>
                                </div>
                            </CardHeader>
                            <CardContent className="text-sm space-y-2 text-gray-600">
                                <div className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4 text-gray-400" />
                                    {donor.city}
                                </div>
                                <div className="flex items-center gap-2">
                                    <Phone className="h-4 w-4 text-gray-400" />
                                    {donor.phone_number}
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
