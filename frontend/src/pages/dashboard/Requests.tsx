import { useState, useEffect } from 'react';
import * as React from 'react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { useAuth } from '../../context/AuthContext';
import { Plus, AlertCircle, Phone, MapPin } from 'lucide-react';
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
}

export function Requests() {
    const { user } = useAuth();
    const { addNotification } = useNotification();
    const [requests, setRequests] = useState<Request[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);

    const [newRequest, setNewRequest] = useState({
        patient_name: '',
        blood_type: '',
        units_needed: '',
        hospital_name: '',
        location: '',
        contact_number: '',
        urgency: 'NORMAL'
    });

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            const res = await fetch('http://localhost:8000/api/blood-requests');
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

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('http://localhost:8000/api/blood-requests', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ ...newRequest, requester_id: user?.id })
            });

            if (res.ok) {
                addNotification("Request posted successfully", "success");
                setIsCreating(false);
                fetchRequests();
                setNewRequest({ patient_name: '', blood_type: '', units_needed: '', hospital_name: '', location: '', contact_number: '', urgency: 'NORMAL' });
            } else {
                const data = await res.json();
                addNotification(data.error || "Failed to post request", "error");
            }
        } catch (error) {
            addNotification("Error connecting to server", "error");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Blood Requests</h1>
                    <p className="text-gray-500">Current blood needs and urgent cases.</p>
                </div>
                <Button onClick={() => setIsCreating(!isCreating)} className="bg-red-600 hover:bg-red-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Request Blood
                </Button>
            </div>

            {/* New Request Form */}
            {isCreating && (
                <Card className="bg-gray-50 border-red-100 animate-in slide-in-from-top-4">
                    <CardHeader>
                        <CardTitle>Create New Blood Request</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input placeholder="Patient Name" required value={newRequest.patient_name} onChange={e => setNewRequest({ ...newRequest, patient_name: e.target.value })} />
                            <select
                                className="w-full p-2 border border-gray-300 rounded-md"
                                value={newRequest.blood_type}
                                onChange={(e) => setNewRequest({ ...newRequest, blood_type: e.target.value })}
                                required
                            >
                                <option value="">Select Blood Type</option>
                                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(type => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </select>
                            <Input placeholder="Units Needed" type="number" required value={newRequest.units_needed} onChange={e => setNewRequest({ ...newRequest, units_needed: e.target.value })} />
                            <Input placeholder="Hospital Name" required value={newRequest.hospital_name} onChange={e => setNewRequest({ ...newRequest, hospital_name: e.target.value })} />
                            <Input placeholder="Location / City" required value={newRequest.location} onChange={e => setNewRequest({ ...newRequest, location: e.target.value })} />
                            <Input placeholder="Contact Number" required value={newRequest.contact_number} onChange={e => setNewRequest({ ...newRequest, contact_number: e.target.value })} />
                            <select
                                className="w-full p-2 border border-gray-300 rounded-md"
                                value={newRequest.urgency}
                                onChange={(e) => setNewRequest({ ...newRequest, urgency: e.target.value })}
                            >
                                <option value="NORMAL">Normal</option>
                                <option value="HIGH">High</option>
                                <option value="CRITICAL">Critical</option>
                            </select>

                            <div className="col-span-full flex justify-end gap-2 mt-2">
                                <Button type="button" variant="outline" onClick={() => setIsCreating(false)}>Cancel</Button>
                                <Button type="submit" className="bg-red-600 text-white">Post Request</Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            {/* Requests List */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {loading ? (
                    <p className="text-gray-500">Loading requests...</p>
                ) : requests.length === 0 ? (
                    <p className="text-gray-500 col-span-full text-center py-10">No active blood requests.</p>
                ) : (
                    requests.map(req => (
                        <Card key={req.id} className="hover:shadow-md transition-shadow relative overflow-hidden">
                            {req.urgency === 'CRITICAL' && (
                                <div className="absolute top-0 right-0 bg-red-600 text-white text-[10px] uppercase font-bold px-4 py-1">
                                    Critical
                                </div>
                            )}
                            <CardHeader className="pb-2">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle className="text-lg">{req.hospital_name}</CardTitle>
                                        <p className="text-sm text-gray-500">{req.patient_name}</p>
                                    </div>
                                    <div className="text-center">
                                        <span className="block text-xl font-black text-red-600">{req.blood_type}</span>
                                        <span className="text-xs text-gray-500">{req.units_needed} Unit(s)</span>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="text-sm space-y-2 text-gray-600">
                                <div className="flex items-center gap-2">
                                    <AlertCircle className={`h-4 w-4 ${req.urgency === 'CRITICAL' ? 'text-red-600' : 'text-orange-500'}`} />
                                    <span className="font-medium">{req.urgency} Urgency</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4 text-gray-400" />
                                    {req.location}
                                </div>
                                <div className="flex items-center gap-2">
                                    <Phone className="h-4 w-4 text-gray-400" />
                                    {req.contact_number}
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
