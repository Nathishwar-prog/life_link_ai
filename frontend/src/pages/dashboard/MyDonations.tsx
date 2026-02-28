import { useState, useEffect } from 'react';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Calendar, Clock, MapPin, CheckCircle, Droplet, ArrowLeft, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';

export function MyDonations() {
    const [activeTab, setActiveTab] = useState<'history' | 'schedule'>('history');
    const [donations, setDonations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Form state
    const [formData, setFormData] = useState({ date: '', time: '', location: '' });
    const [submitting, setSubmitting] = useState(false);

    const { token } = useAuth();
    const { addNotification } = useNotification();

    const fetchDonations = async () => {
        setLoading(true);
        try {
            const res = await fetch('http://localhost:8000/api/donations/my-donations', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setDonations(data);
            }
        } catch (error) {
            console.error("Error fetching donations:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'history') {
            fetchDonations();
        }
    }, [activeTab]);

    const handleScheduleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const res = await fetch('http://localhost:8000/api/donations/schedule', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });
            if (res.ok) {
                addNotification("Donation scheduled successfully!", "success");
                setFormData({ date: '', time: '', location: '' });
                setActiveTab('history');
            } else {
                addNotification("Failed to schedule donation.", "error");
            }
        } catch (error) {
            console.error("Schedule error:", error);
            addNotification("Network error. Could not schedule.", "error");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">My Donations</h1>
                    <p className="text-gray-500">Track your life-saving journey.</p>
                </div>
                {activeTab === 'history' ? (
                    <Button onClick={() => setActiveTab('schedule')}>
                        <Calendar className="mr-2 h-4 w-4" />
                        Schedule Donation
                    </Button>
                ) : (
                    <Button variant="outline" onClick={() => setActiveTab('history')}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to History
                    </Button>
                )}
            </div>

            {activeTab === 'history' && (
                <>
                    <div className="grid gap-6 md:grid-cols-3">
                        {/* Stats Cards */}
                        <Card className="bg-red-50 border-red-100">
                            <CardContent className="p-6 flex items-center space-x-4">
                                <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center">
                                    <Droplet className="h-6 w-6 text-red-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Total Donated</p>
                                    <p className="text-2xl font-bold text-gray-900">{donations.filter(d => d.status === 'COMPLETED').length * 450} ml</p>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="bg-blue-50 border-blue-100">
                            <CardContent className="p-6 flex items-center space-x-4">
                                <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                                    <CheckCircle className="h-6 w-6 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Lives Saved</p>
                                    <p className="text-2xl font-bold text-gray-900">{donations.filter(d => d.status === 'COMPLETED').length * 3}</p>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="bg-green-50 border-green-100">
                            <CardContent className="p-6 flex items-center space-x-4">
                                <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                                    <Clock className="h-6 w-6 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Total Scheduled</p>
                                    <p className="text-2xl font-bold text-gray-900">{donations.filter(d => d.status === 'PENDING').length}</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Donation History</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {loading ? (
                                <div className="flex justify-center p-8">
                                    <Loader2 className="h-8 w-8 animate-spin text-red-600" />
                                </div>
                            ) : donations.length === 0 ? (
                                <p className="text-gray-500 text-center py-8">No donations found. Schedule your first one today!</p>
                            ) : (
                                <div className="space-y-4">
                                    {donations.map((donation) => (
                                        <div key={donation.id} className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-lg hover:border-red-100 transition-colors">
                                            <div className="flex items-start space-x-4">
                                                <div className="mt-1">
                                                    <div className={`h-2 w-2 rounded-full ${donation.status === 'COMPLETED' ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900">{donation.date} at {donation.time}</p>
                                                    <div className="flex items-center text-sm text-gray-500 mt-1">
                                                        <MapPin className="h-3 w-3 mr-1" />
                                                        {donation.location}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-gray-900">{donation.amount}</p>
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${donation.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                                    }`}>
                                                    {donation.status}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </>
            )}

            {activeTab === 'schedule' && (
                <Card className="max-w-2xl mx-auto">
                    <CardHeader>
                        <CardTitle>Schedule a Donation</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleScheduleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-900">Date</label>
                                <input
                                    type="date"
                                    required
                                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                                    value={formData.date}
                                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-900">Time</label>
                                <input
                                    type="time"
                                    required
                                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                                    value={formData.time}
                                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-900">Location</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Enter Blood Bank or Hospital Name"
                                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                                    value={formData.location}
                                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                />
                            </div>
                            <Button type="submit" className="w-full" disabled={submitting}>
                                {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                Confirm Appointment
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
