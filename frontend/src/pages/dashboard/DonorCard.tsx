import { useAuth } from '../../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Droplet, QrCode, Share2, Download, Heart } from 'lucide-react';

export function DonorCard() {
    const { user } = useAuth();

    if (!user) return null;

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="max-w-md mx-auto py-8">
            <div className="text-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Digital Donor Card</h1>
                <p className="text-gray-500">Your life-saving identity.</p>
            </div>

            <div id="donor-card" className="bg-gradient-to-br from-red-600 to-red-800 rounded-xl overflow-hidden shadow-2xl text-white relative">
                {/* Background Pattern */}
                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white opacity-10 rounded-full blur-2xl"></div>
                <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-black opacity-10 rounded-full blur-2xl"></div>

                <div className="p-6 relative z-10">
                    <div className="flex justify-between items-start mb-6">
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                                <Droplet className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h2 className="font-bold text-lg tracking-wide">LifeLink</h2>
                                <p className="text-xs text-red-100 uppercase tracking-wider">Official Donor</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-red-200">BLOOD GROUP</p>
                            <p className="text-3xl font-black">{user.role === 'DONOR' ? 'O+' : 'N/A'}</p> {/* Mocking Blood Type */}
                        </div>
                    </div>

                    <div className="space-y-4 mb-6">
                        <div>
                            <p className="text-xs text-red-200 uppercase">Donor Name</p>
                            <p className="text-xl font-bold tracking-wide">{user.full_name}</p>
                        </div>
                        <div className="flex justify-between">
                            <div>
                                <p className="text-xs text-red-200 uppercase">Donor ID</p>
                                <p className="font-mono text-sm">{user.id.slice(0, 8).toUpperCase()}</p>
                            </div>
                            <div>
                                <p className="text-xs text-red-200 uppercase">Joined</p>
                                <p className="text-sm">{new Date().toLocaleDateString()}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg p-4 flex items-center justify-between">
                        <div className="text-center">
                            <QrCode className="h-16 w-16 text-gray-900" />
                        </div>
                        <div className="flex-1 pl-4 text-gray-800">
                            <div className="flex items-center gap-1 text-red-600 font-bold text-sm mb-1">
                                <Heart className="h-4 w-4 fill-current" />
                                <span>Life Saver</span>
                            </div>
                            <p className="text-xs text-gray-500 leading-tight">
                                Scan this code at any LifeLink authorized blood bank or camp.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex gap-4 mt-8 justify-center print:hidden">
                <Button onClick={handlePrint} variant="outline" className="flex-1">
                    <Download className="h-4 w-4 mr-2" />
                    Save / Print
                </Button>
                <Button className="flex-1 bg-red-600 hover:bg-red-700">
                    <Share2 className="h-4 w-4 mr-2" />
                    Share Profile
                </Button>
            </div>

            <div className="mt-8 text-center print:hidden">
                <p className="text-sm text-gray-500">
                    Present this card at blood donation camps for quick registration.
                </p>
            </div>
        </div>
    );
}
