
import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    LayoutDashboard,
    Users,
    Droplet,
    FileText,
    LogOut,
    Menu,
    X,
    UserCircle,
    Search,
    History,
    Bot,
    Siren,
    Tent,
    CreditCard
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { FloatingChat } from '../FloatingChat';

export function DashboardLayout() {
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const getNavigation = () => {
        const role = user?.role;

        const common = [
            { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
        ];

        if (role === 'STAFF' || role === 'ADMIN') {
            return [
                ...common,
                { name: 'Inventory', href: '/dashboard/inventory', icon: Droplet },
                { name: 'Donors', href: '/dashboard/donors', icon: Users },
                { name: 'Requests', href: '/dashboard/requests', icon: FileText },
                { name: 'Search Blood', href: '/dashboard/search', icon: Search },
                { name: 'AI Assistant', href: '/dashboard/ai-assistant', icon: Bot }, // Added for STAFF/ADMIN
                { name: 'SOS Emergency', href: '/dashboard/sos', icon: Siren },
                { name: 'Campaigns', href: '/dashboard/campaigns', icon: Tent },
            ];
        }

        // Donor navigation
        return [
            { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
            { name: 'Search Blood', href: '/dashboard/search', icon: Search },
            { name: 'Campaigns', href: '/dashboard/campaigns', icon: Tent },
            { name: 'My Donations', href: '/dashboard/my-donations', icon: History },
            { name: 'Donor Card', href: '/dashboard/donor-card', icon: CreditCard },
            { name: 'Requests', href: '/dashboard/requests', icon: FileText },
            { name: 'AI Assistant', href: '/dashboard/ai-assistant', icon: Bot },
            { name: 'SOS', href: '/dashboard/sos', icon: Siren },
        ];
    };

    const navigation = getNavigation();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar - Desktop */}
            <aside className="hidden md:flex w-64 flex-col bg-white border-r border-gray-200 fixed h-full z-10">
                <div className="h-16 flex items-center px-6 border-b border-gray-100">
                    <Droplet className="h-8 w-8 text-red-600 mr-2" />
                    <span className="text-xl font-bold text-gray-900">LifeLink</span>
                </div>

                <nav className="flex-1 px-4 py-6 space-y-1">
                    {navigation.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.href;
                        return (
                            <Link
                                key={item.name}
                                to={item.href}
                                className={cn(
                                    "flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors",
                                    isActive
                                        ? "bg-red-50 text-red-700"
                                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                )}
                            >
                                <Icon className={cn("mr-3 h-5 w-5", isActive ? "text-red-600" : "text-gray-400")} />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-gray-100">
                    <div className="flex items-center mb-4 px-2">
                        <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center text-red-600 mr-3">
                            <UserCircle className="h-5 w-5" />
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-medium text-gray-900 truncate">{user?.full_name}</p>
                            <p className="text-xs text-gray-500 truncate">{user?.role}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-2 py-2 text-sm font-medium text-gray-600 rounded-lg hover:bg-red-50 hover:text-red-700 transition-colors"
                    >
                        <LogOut className="mr-3 h-5 w-5 text-gray-400 group-hover:text-red-600" />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 md:ml-64 flex flex-col min-w-0">
                {/* Mobile Header */}
                <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-8">
                    <div className="flex items-center md:hidden">
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="text-gray-500 hover:text-gray-700 focus:outline-none"
                        >
                            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                        <span className="ml-3 text-lg font-semibold text-gray-900">LifeLink</span>
                    </div>

                    <div className="flex items-center justify-end w-full">
                        {/* Header Right Side (Notifications, etc.) */}
                    </div>
                </header>

                <main className="flex-1 p-4 md:p-8 overflow-y-auto">
                    <Outlet />
                </main>
            </div>

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div className="md:hidden fixed inset-0 z-40 flex">
                    <div
                        className="fixed inset-0 bg-gray-600 bg-opacity-75"
                        onClick={() => setIsMobileMenuOpen(false)}
                    ></div>

                    <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
                        <div className="absolute top-0 right-0 -mr-12 pt-2">
                            <button
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                            >
                                <X className="h-6 w-6 text-white" />
                            </button>
                        </div>

                        <div className="h-16 flex items-center px-6 border-b border-gray-100">
                            <Droplet className="h-8 w-8 text-red-600 mr-2" />
                            <span className="text-xl font-bold text-gray-900">LifeLink</span>
                        </div>

                        <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
                            <nav className="mt-5 px-2 space-y-1">
                                {navigation.map((item) => (
                                    <Link
                                        key={item.name}
                                        to={item.href}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className={cn(
                                            "group flex items-center px-2 py-2 text-base font-medium rounded-md",
                                            location.pathname === item.href
                                                ? "bg-red-50 text-red-700"
                                                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                        )}
                                    >
                                        <item.icon className={cn("mr-4 h-6 w-6", location.pathname === item.href ? "text-red-600" : "text-gray-400")} />
                                        {item.name}
                                    </Link>
                                ))}
                            </nav>
                        </div>

                        <div className="border-t border-gray-200 p-4">
                            <div className="flex items-center mb-4 px-2">
                                <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center text-red-600 mr-3">
                                    <UserCircle className="h-5 w-5" />
                                </div>
                                <div className="overflow-hidden">
                                    <p className="text-sm font-medium text-gray-900 truncate">{user?.full_name}</p>
                                    <p className="text-xs text-gray-500 truncate">{user?.role}</p>
                                </div>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="flex items-center w-full px-2 py-2 text-base font-medium text-gray-600 rounded-md hover:bg-red-50 hover:text-red-700"
                            >
                                <LogOut className="mr-4 h-6 w-6 text-gray-400" />
                                Sign Out
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Global AI Chatbot Widget */}
            <FloatingChat />
        </div>
    );
}
