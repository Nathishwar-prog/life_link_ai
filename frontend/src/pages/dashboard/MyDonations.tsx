import { useState } from 'react';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Calendar, Clock, MapPin, CheckCircle, ChevronRight } from 'lucide-react';

// Mock data
const DONATIONS = [
    { id: 1, date: '2023-10-15', location: 'City General Hospital', amount: '450ml', status: 'Completed' },
    { id: 2, date: '2023-06-10', location: 'Red Cross Mobile Unit', amount: '450ml', status: 'Completed' },
    { id: 3, date: '2023-02-22', location: 'City General Hospital', amount: '450ml', status: 'Completed' },
];

export function MyDonations() {
    const [activeTab, setActiveTab] = useState<'history' | 'schedule'>('history');

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">My Donations</h1>
                    <p className="text-gray-500">Track your life-saving journey.</p>
                </div>
                <Button onClick={() => setActiveTab('schedule')}>
                    <Calendar className="mr-2 h-4 w-4" />
                    Schedule Donation
                </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {/* Stats Cards */}
                <Card className="bg-red-50 border-red-100">
                    <CardContent className="p-6 flex items-center space-x-4">
                        <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center">
                            <DropletIcon className="h-6 w-6 text-red-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total Donated</p>
                            <p className="text-2xl font-bold text-gray-900">{DONATIONS.length * 450} ml</p>
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
                            <p className="text-2xl font-bold text-gray-900">{DONATIONS.length * 3}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-green-50 border-green-100">
                    <CardContent className="p-6 flex items-center space-x-4">
                        <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                            <Clock className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-600">Next Eligible</p>
                            <p className="text-2xl font-bold text-gray-900">Jan 15, 2024</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Donation History</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {DONATIONS.map((donation) => (
                            <div key={donation.id} className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-lg hover:border-red-100 transition-colors">
                                <div className="flex items-start space-x-4">
                                    <div className="mt-1">
                                        <div className="h-2 w-2 rounded-full bg-green-500"></div>
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">{donation.date}</p>
                                        <div className="flex items-center text-sm text-gray-500 mt-1">
                                            <MapPin className="h-3 w-3 mr-1" />
                                            {donation.location}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-gray-900">{donation.amount}</p>
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                        {donation.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

// Icon helper
function DropletIcon({ className }: { className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
        </svg>
    )
}
