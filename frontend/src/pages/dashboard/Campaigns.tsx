import { useState, useEffect } from 'react';
import * as React from 'react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { useAuth } from '../../context/AuthContext';
import { Calendar, MapPin, Plus, Tent } from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';

interface Campaign {
    id: string;
    title: string;
    description: string;
    location: string;
    start_date: string;
    end_date: string;
}

export function Campaigns() {
    const { user } = useAuth();
    const { addNotification } = useNotification();
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [loading, setLoading] = useState(true);

    // Form State
    const [isCreating, setIsCreating] = useState(false);
    const [newCampaign, setNewCampaign] = useState({
        title: '',
        description: '',
        location: '',
        start_date: '',
        end_date: ''
    });

    useEffect(() => {
        fetchCampaigns();
    }, []);

    const fetchCampaigns = async () => {
        try {
            const res = await fetch('http://localhost:8000/api/campaigns');
            const data = await res.json();
            if (Array.isArray(data)) {
                setCampaigns(data);
            } else {
                setCampaigns([]);
                console.error("Fetched campaigns data is not an array:", data);
            }
        } catch (error) {
            console.error("Failed to fetch campaigns", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('http://localhost:8000/api/campaigns', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ ...newCampaign, organizer_id: user?.id })
            });

            if (res.ok) {
                addNotification("Campaign created successfully", "success");
                setIsCreating(false);
                fetchCampaigns();
                setNewCampaign({ title: '', description: '', location: '', start_date: '', end_date: '' });
            } else {
                addNotification("Failed to create campaign", "error");
            }
        } catch (error) {
            addNotification("Error connecting to server", "error");
        }
    };

    const canCreate = user?.role === 'STAFF' || user?.role === 'ADMIN';

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Blood Donation Campaigns</h1>
                    <p className="text-gray-500">Upcoming blood drives and community events.</p>
                </div>
                {canCreate && (
                    <Button onClick={() => setIsCreating(!isCreating)} className="bg-red-600 hover:bg-red-700">
                        <Plus className="h-4 w-4 mr-2" />
                        Organize Drive
                    </Button>
                )}
            </div>

            {isCreating && (
                <Card className="bg-gray-50 border-red-100 animate-in slide-in-from-top-4">
                    <CardHeader>
                        <CardTitle>Organize New Campaign</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <Input
                                placeholder="Campaign Title"
                                value={newCampaign.title}
                                onChange={e => setNewCampaign({ ...newCampaign, title: e.target.value })}
                                required
                            />
                            <Input
                                placeholder="Location"
                                value={newCampaign.location}
                                onChange={e => setNewCampaign({ ...newCampaign, location: e.target.value })}
                                required
                            />
                            <textarea
                                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                                placeholder="Description"
                                rows={3}
                                value={newCampaign.description}
                                onChange={e => setNewCampaign({ ...newCampaign, description: e.target.value })}
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm text-gray-500 block mb-1">Start Date</label>
                                    <Input
                                        type="datetime-local"
                                        value={newCampaign.start_date}
                                        onChange={e => setNewCampaign({ ...newCampaign, start_date: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="text-sm text-gray-500 block mb-1">End Date</label>
                                    <Input
                                        type="datetime-local"
                                        value={newCampaign.end_date}
                                        onChange={e => setNewCampaign({ ...newCampaign, end_date: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end gap-2">
                                <Button type="button" variant="outline" onClick={() => setIsCreating(false)}>Cancel</Button>
                                <Button type="submit" className="bg-red-600 text-white">Publish Campaign</Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {loading ? (
                    <p className="text-gray-500">Loading campaigns...</p>
                ) : campaigns.length === 0 ? (
                    <p className="text-gray-500 col-span-full text-center py-10">No upcoming campaigns found.</p>
                ) : (
                    campaigns.map(camp => (
                        <Card key={camp.id} className="hover:shadow-md transition-shadow">
                            <CardHeader className="pb-2">
                                <div className="flex justify-between items-start">
                                    <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 mb-2">
                                        <Tent className="h-5 w-5" />
                                    </div>
                                    <span className="text-xs font-medium px-2 py-1 bg-green-100 text-green-700 rounded-full">
                                        Upcoming
                                    </span>
                                </div>
                                <CardTitle className="text-lg">{camp.title}</CardTitle>
                                <CardDescription className="line-clamp-2">
                                    {camp.description || "Join us to save lives!"}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="text-sm space-y-2 text-gray-600">
                                <div className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4 text-gray-400" />
                                    {camp.location}
                                </div>
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-gray-400" />
                                    {new Date(camp.start_date).toLocaleDateString()}
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
