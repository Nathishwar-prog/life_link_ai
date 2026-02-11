
import { useState, useEffect } from 'react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { useAuth } from '../../context/AuthContext';
import { Plus, User, MapPin, Phone, Filter, Trash2, Edit2, X, Loader2 } from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';
// Using inline Dialog for simplicity or custom implementation if shadcn/ui Dialog not present
// Assuming we can build a simple modal here using Tailwind

interface Donor {
    id: string;
    full_name: string;
    blood_type: string;
    city: string;
    phone_number: string;
    email?: string;
    address?: string;
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

    // Modal State
    const [ismodalOpen, setIsModalOpen] = useState(false);
    const [currentDonor, setCurrentDonor] = useState<Partial<Donor>>({});
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        fetchDonors();
    }, [bloodFilter, cityFilter]);

    const fetchDonors = async () => {
        try {
            const query = new URLSearchParams();
            if (bloodFilter) query.append('blood_type', bloodFilter);
            if (cityFilter) query.append('city', cityFilter);

            const res = await fetch(`/api/donors?${query.toString()}`);
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

    const handleOpenAdd = () => {
        setCurrentDonor({
            full_name: '',
            blood_type: '',
            phone_number: '',
            city: '',
            email: '',
            address: '',
            is_available: true
        });
        setIsEditing(false);
        setIsModalOpen(true);
    };

    const handleOpenEdit = (donor: Donor) => {
        setCurrentDonor({ ...donor });
        setIsEditing(true);
        setIsModalOpen(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const url = isEditing
                ? `/api/donors/${currentDonor.id}`
                : '/api/donors';

            const method = isEditing ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(currentDonor)
            });

            if (res.ok) {
                addNotification(isEditing ? "Donor updated" : "Donor created", "success");
                setIsModalOpen(false);
                fetchDonors();
            } else {
                addNotification("Failed to save donor", "error");
            }
        } catch (error) {
            addNotification("Error saving donor", "error");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("Are you sure you want to delete this donor?")) return;

        try {
            const res = await fetch(`/api/donors/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (res.ok) {
                addNotification("Donor deleted", "success");
                fetchDonors();
            } else {
                addNotification("Failed to delete donor", "error");
            }
        } catch (error) {
            addNotification("Error deleting donor", "error");
        }
    };

    const isAdmin = user?.role === 'ADMIN' || user?.role === 'STAFF'; // Allow STAFF too for edits

    return (
        <div className="space-y-6 relative">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Donor Registry</h1>
                    <p className="text-gray-500">Find and manage blood donors.</p>
                </div>
                {isAdmin && (
                    <Button onClick={handleOpenAdd} className="bg-red-600 hover:bg-red-700 text-white">
                        <Plus className="h-4 w-4 mr-2" />
                        Add New Donor
                    </Button>
                )}
            </div>

            {/* Filters */}
            <Card className="border-none shadow-sm bg-white/50 backdrop-blur-sm">
                <CardContent className="p-4 flex flex-col md:flex-row gap-4 items-end">
                    <div className="flex-1 w-full">
                        <label className="text-xs font-medium text-gray-500 mb-1 block">Blood Type</label>
                        <select
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                            value={bloodFilter}
                            onChange={(e) => setBloodFilter(e.target.value)}
                        >
                            <option value="">All Blood Types</option>
                            {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(type => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex-1 w-full">
                        <label className="text-xs font-medium text-gray-500 mb-1 block">City</label>
                        <Input
                            placeholder="Filter by City"
                            value={cityFilter}
                            onChange={(e) => setCityFilter(e.target.value)}
                        />
                    </div>
                    <Button variant="outline" onClick={fetchDonors} className="w-full md:w-auto">
                        <Filter className="h-4 w-4 mr-2" />
                        Apply Filters
                    </Button>
                </CardContent>
            </Card>

            {/* Donors List */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {loading ? (
                    <div className="col-span-full flex justify-center py-20">
                        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                    </div>
                ) : donors.length === 0 ? (
                    <p className="text-gray-500 col-span-full text-center py-10">No donors found matching criteria.</p>
                ) : (
                    donors.map(donor => (
                        <Card key={donor.id} className="hover:shadow-lg transition-all duration-300 border-none shadow-sm bg-white group relative overflow-hidden">
                            <div className={`absolute top-0 left-0 w-1 h-full ${donor.is_available ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                            <CardHeader className="pb-2 pl-6">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-3">
                                        <div className={`h-12 w-12 rounded-full flex items-center justify-center text-white font-bold shadow-md ${['O+', 'O-'].includes(donor.blood_type) ? 'bg-gradient-to-br from-red-500 to-rose-600' :
                                                ['A+', 'A-'].includes(donor.blood_type) ? 'bg-gradient-to-br from-blue-500 to-indigo-600' :
                                                    'bg-gradient-to-br from-purple-500 to-violet-600'
                                            }`}>
                                            {donor.blood_type}
                                        </div>
                                        <div>
                                            <CardTitle className="text-lg text-gray-900">{donor.full_name}</CardTitle>
                                            <span className={`text-xs px-2 py-0.5 rounded-full ${donor.is_available ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>
                                                {donor.is_available ? 'Available' : 'Unavailable'}
                                            </span>
                                        </div>
                                    </div>
                                    {isAdmin && (
                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:bg-blue-50" onClick={() => handleOpenEdit(donor)}>
                                                <Edit2 className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:bg-red-50" onClick={() => handleDelete(donor.id)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent className="text-sm space-y-3 text-gray-600 pl-6">
                                <div className="flex items-center gap-3">
                                    <MapPin className="h-4 w-4 text-gray-400" />
                                    {donor.city}
                                </div>
                                <div className="flex items-center gap-3">
                                    <Phone className="h-4 w-4 text-gray-400" />
                                    {donor.phone_number}
                                </div>
                                {donor.email && (
                                    <div className="flex items-center gap-3 truncate">
                                        <User className="h-4 w-4 text-gray-400" />
                                        {donor.email}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            {/* Edit/Add Modal Overlay */}
            {ismodalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
                    <Card className="w-full max-w-lg bg-white shadow-2xl animate-in zoom-in-95">
                        <CardHeader className="border-b relative">
                            <CardTitle>{isEditing ? 'Edit Donor Details' : 'Register New Donor'}</CardTitle>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
                                onClick={() => setIsModalOpen(false)}
                            >
                                <X className="h-5 w-5" />
                            </Button>
                        </CardHeader>
                        <CardContent className="p-6">
                            <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input
                                    placeholder="Full Name"
                                    required
                                    value={currentDonor.full_name || ''}
                                    onChange={e => setCurrentDonor({ ...currentDonor, full_name: e.target.value })}
                                    className="col-span-2"
                                />
                                <div className="col-span-1">
                                    <label className="text-xs font-semibold text-gray-500 mb-1 block">Blood Type</label>
                                    <select
                                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                                        value={currentDonor.blood_type || ''}
                                        onChange={(e) => setCurrentDonor({ ...currentDonor, blood_type: e.target.value })}
                                        required
                                    >
                                        <option value="">Select</option>
                                        {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(type => (
                                            <option key={type} value={type}>{type}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="col-span-1">
                                    <label className="text-xs font-semibold text-gray-500 mb-1 block">Status</label>
                                    <select
                                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                                        value={currentDonor.is_available ? 'true' : 'false'}
                                        onChange={(e) => setCurrentDonor({ ...currentDonor, is_available: e.target.value === 'true' })}
                                    >
                                        <option value="true">Available</option>
                                        <option value="false">Unavailable</option>
                                    </select>
                                </div>

                                <Input
                                    placeholder="Phone Number"
                                    required
                                    value={currentDonor.phone_number || ''}
                                    onChange={e => setCurrentDonor({ ...currentDonor, phone_number: e.target.value })}
                                />
                                <Input
                                    placeholder="City"
                                    required
                                    value={currentDonor.city || ''}
                                    onChange={e => setCurrentDonor({ ...currentDonor, city: e.target.value })}
                                />
                                <Input
                                    placeholder="Email (Optional)"
                                    type="email"
                                    value={currentDonor.email || ''}
                                    onChange={e => setCurrentDonor({ ...currentDonor, email: e.target.value })}
                                    className="col-span-2"
                                />
                                <Input
                                    placeholder="Address (Optional)"
                                    value={currentDonor.address || ''}
                                    onChange={e => setCurrentDonor({ ...currentDonor, address: e.target.value })}
                                    className="col-span-2"
                                />

                                <div className="col-span-2 flex justify-end gap-3 mt-4 pt-4 border-t">
                                    <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                                    <Button type="submit" className="bg-red-600 hover:bg-red-700 text-white min-w-[120px]" disabled={isSaving}>
                                        {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : (isEditing ? 'Update Donor' : 'Save Donor')}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
