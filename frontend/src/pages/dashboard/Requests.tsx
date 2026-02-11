
import { useState, useEffect, FormEvent } from 'react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { useAuth } from '../../context/AuthContext';
import { Plus, AlertCircle, Phone, MapPin, Trash2, Edit2, X, Loader2 } from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';

interface Request {
    id: string;
    patient_name: string;
    blood_type: string;
    units_needed: number;
    hospital_name: string;
    urgency: string;
    status: string;
    contact_number: string;
    location: string;
    requester_id?: string;
}

export function Requests() {
    const { user } = useAuth();
    const { addNotification } = useNotification();
    const [requests, setRequests] = useState<Request[]>([]);
    const [loading, setLoading] = useState(true);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentRequest, setCurrentRequest] = useState<Partial<Request>>({});
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            const res = await fetch('/api/blood-requests');
            const data = await res.json();
            if (Array.isArray(data)) {
                setRequests(data);
            } else {
                setRequests([]);
            }
        } catch (error) {
            console.error("Failed to fetch requests", error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenAdd = () => {
        setCurrentRequest({
            patient_name: '',
            blood_type: '',
            units_needed: 1,
            hospital_name: '',
            location: '',
            contact_number: '',
            urgency: 'NORMAL',
            status: 'PENDING'
        });
        setIsEditing(false);
        setIsModalOpen(true);
    };

    const handleOpenEdit = (req: Request) => {
        setCurrentRequest({ ...req });
        setIsEditing(true);
        setIsModalOpen(true);
    };

    const handleSave = async (e: FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const url = isEditing
                ? `/api/blood-requests/${currentRequest.id}`
                : '/api/blood-requests';

            const method = isEditing ? 'PUT' : 'POST';

            // Fix: Create a clean body object
            const body: any = { ...currentRequest };

            // Only add requester_id if we have a valid user ID (UUID format) and it's a new request
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
            if (!isEditing && user?.id && uuidRegex.test(user.id)) {
                body.requester_id = user.id;
            } else if (!isEditing) {
                body.requester_id = null;
            }

            // Ensure units_needed is a number
            if (body.units_needed) {
                body.units_needed = Number(body.units_needed);
            }

            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(body)
            });

            if (res.ok) {
                addNotification(isEditing ? "Request updated" : "Request posted", "success");
                setIsModalOpen(false);
                fetchRequests();
            } else {
                const data = await res.json();
                addNotification(data.error || "Failed to save request", "error");
            }
        } catch (error) {
            addNotification("Error connecting to server", "error");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("Are you sure you want to delete this request?")) return;

        try {
            const res = await fetch(`/api/blood-requests/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (res.ok) {
                addNotification("Request deleted", "success");
                fetchRequests();
            } else {
                addNotification("Failed to delete request", "error");
            }
        } catch (error) {
            addNotification("Error deleting request", "error");
        }
    };

    const isAdmin = user?.role === 'ADMIN' || user?.role === 'STAFF';

    return (
        <div className="space-y-6 relative">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Blood Requests</h1>
                    <p className="text-gray-500">Current blood needs and urgent cases.</p>
                </div>
                <Button onClick={handleOpenAdd} className="bg-red-600 hover:bg-red-700 text-white">
                    <Plus className="h-4 w-4 mr-2" />
                    Request Blood
                </Button>
            </div>

            {/* Requests List */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {loading ? (
                    <div className="col-span-full flex justify-center py-20">
                        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                    </div>
                ) : requests.length === 0 ? (
                    <p className="text-gray-500 col-span-full text-center py-10">No active blood requests.</p>
                ) : (
                    requests.map(req => (
                        <Card key={req.id} className="hover:shadow-lg transition-all duration-300 relative overflow-hidden group">
                            {req.urgency === 'CRITICAL' && (
                                <div className="absolute top-0 right-0 bg-red-600 text-white text-[10px] uppercase font-bold px-4 py-1 z-10">
                                    Critical
                                </div>
                            )}
                            <div className={`absolute left-0 top-0 w-1 h-full ${req.status === 'FULFILLED' ? 'bg-green-500' :
                                req.urgency === 'CRITICAL' ? 'bg-red-600' : 'bg-orange-400'
                                }`} />

                            <CardHeader className="pb-2 pl-6">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle className="text-lg text-gray-900">{req.hospital_name}</CardTitle>
                                        <p className="text-sm text-gray-500">{req.patient_name}</p>
                                    </div>
                                    <div className="text-center bg-gray-50 rounded-lg p-2 min-w-[60px]">
                                        <span className="block text-xl font-black text-red-600">{req.blood_type}</span>
                                        <span className="text-xs text-gray-500">{req.units_needed} Unit(s)</span>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="text-sm space-y-3 text-gray-600 pl-6 pb-4">
                                <div className="flex items-center gap-2">
                                    <AlertCircle className={`h-4 w-4 ${req.urgency === 'CRITICAL' ? 'text-red-600' : 'text-orange-500'}`} />
                                    <span className={`font-medium ${req.urgency === 'CRITICAL' ? 'text-red-600' : 'text-orange-600'}`}>
                                        {req.urgency} Urgency
                                    </span>
                                    {req.status && (
                                        <span className={`ml-auto text-xs px-2 py-0.5 rounded-full border ${req.status === 'FULFILLED' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-gray-50 border-gray-200 text-gray-600'
                                            }`}>
                                            {req.status}
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4 text-gray-400" />
                                    {req.location}
                                </div>
                                <div className="flex items-center gap-2">
                                    <Phone className="h-4 w-4 text-gray-400" />
                                    {req.contact_number}
                                </div>

                                {isAdmin && (
                                    <div className="flex justify-end gap-2 pt-2 border-t mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button variant="ghost" size="sm" className="h-8 text-blue-600 hover:bg-blue-50" onClick={() => handleOpenEdit(req)}>
                                            <Edit2 className="h-4 w-4 mr-1" /> Edit
                                        </Button>
                                        <Button variant="ghost" size="sm" className="h-8 text-red-600 hover:bg-red-50" onClick={() => handleDelete(req.id)}>
                                            <Trash2 className="h-4 w-4 mr-1" /> Delete
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
                    <Card className="w-full max-w-lg bg-white shadow-2xl animate-in zoom-in-95">
                        <CardHeader className="border-b relative">
                            <CardTitle>{isEditing ? 'Edit Blood Request' : 'Create New Request'}</CardTitle>
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
                                    placeholder="Patient Name"
                                    required
                                    value={currentRequest.patient_name || ''}
                                    onChange={e => setCurrentRequest({ ...currentRequest, patient_name: e.target.value })}
                                    className="col-span-2"
                                />
                                <div className="col-span-1">
                                    <label className="text-xs font-semibold text-gray-500 mb-1 block">Blood Type</label>
                                    <select
                                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                                        value={currentRequest.blood_type || ''}
                                        onChange={(e) => setCurrentRequest({ ...currentRequest, blood_type: e.target.value })}
                                        required
                                    >
                                        <option value="">Select</option>
                                        {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(type => (
                                            <option key={type} value={type}>{type}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="col-span-1">
                                    <label className="text-xs font-semibold text-gray-500 mb-1 block">Units Needed</label>
                                    <Input
                                        type="number"
                                        min="1"
                                        required
                                        value={currentRequest.units_needed || ''}
                                        onChange={e => setCurrentRequest({ ...currentRequest, units_needed: Number(e.target.value) })}
                                    />
                                </div>

                                <Input
                                    placeholder="Hospital Name"
                                    required
                                    value={currentRequest.hospital_name || ''}
                                    onChange={e => setCurrentRequest({ ...currentRequest, hospital_name: e.target.value })}
                                    className="col-span-2"
                                />
                                <Input
                                    placeholder="Location / City"
                                    required
                                    value={currentRequest.location || ''}
                                    onChange={e => setCurrentRequest({ ...currentRequest, location: e.target.value })}
                                />
                                <Input
                                    placeholder="Contact Number"
                                    required
                                    value={currentRequest.contact_number || ''}
                                    onChange={e => setCurrentRequest({ ...currentRequest, contact_number: e.target.value })}
                                />
                                <div className="col-span-1">
                                    <label className="text-xs font-semibold text-gray-500 mb-1 block">Urgency</label>
                                    <select
                                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                                        value={currentRequest.urgency || 'NORMAL'}
                                        onChange={(e) => setCurrentRequest({ ...currentRequest, urgency: e.target.value })}
                                    >
                                        <option value="NORMAL">Normal</option>
                                        <option value="HIGH">High</option>
                                        <option value="CRITICAL">Critical</option>
                                    </select>
                                </div>
                                {isEditing && (
                                    <div className="col-span-1">
                                        <label className="text-xs font-semibold text-gray-500 mb-1 block">Status</label>
                                        <select
                                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                                            value={currentRequest.status || 'PENDING'}
                                            onChange={(e) => setCurrentRequest({ ...currentRequest, status: e.target.value })}
                                        >
                                            <option value="PENDING">Pending</option>
                                            <option value="FULFILLED">Fulfilled</option>
                                            <option value="CANCELLED">Cancelled</option>
                                        </select>
                                    </div>
                                )}

                                <div className="col-span-2 flex justify-end gap-3 mt-4 pt-4 border-t">
                                    <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                                    <Button type="submit" className="bg-red-600 hover:bg-red-700 text-white min-w-[120px]" disabled={isSaving}>
                                        {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : (isEditing ? 'Update Request' : 'Post Request')}
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
