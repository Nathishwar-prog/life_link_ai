import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Droplet, Users, Activity, ExternalLink } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export function Overview() {
    const stats = [
        {
            title: "Total Blood Units",
            value: "1,204",
            change: "+12%",
            icon: Droplet,
            color: "text-red-600",
            bg: "bg-red-100"
        },
        {
            title: "Active Donors",
            value: "3,402",
            change: "+5%",
            icon: Users,
            color: "text-blue-600",
            bg: "bg-blue-100"
        },
        {
            title: "Requests Pending",
            value: "42",
            change: "-2%",
            icon: Activity,
            color: "text-amber-600",
            bg: "bg-amber-100"
        }
    ];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
                <p className="text-gray-500">Welcome back to LifeLink.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {stats.map((stat) => (
                    <Card key={stat.title}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">
                                {stat.title}
                            </CardTitle>
                            <div className={`p-2 rounded-full ${stat.bg}`}>
                                <stat.icon className={`h-4 w-4 ${stat.color}`} />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stat.value}</div>
                            <p className="text-xs text-gray-500">
                                <span className={stat.change.startsWith('+') ? "text-green-600" : "text-red-600"}>
                                    {stat.change}
                                </span>{" "}
                                from last month
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex items-center justify-between border-b border-gray-100 pb-2 last:border-0 last:pb-0">
                                    <div className="flex items-center space-x-3">
                                        <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                                            <span className="text-xs font-bold text-gray-600">JD</span>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">John Doe donated 450ml</p>
                                            <p className="text-xs text-gray-500">2 hours ago</p>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="sm"><ExternalLink className="h-4 w-4" /></Button>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Urgent Requests</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {[1, 2].map((i) => (
                                <div key={i} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-100">
                                    <div>
                                        <div className="flex items-center space-x-2">
                                            <span className="px-2 py-0.5 rounded text-xs font-bold bg-red-200 text-red-800">O-Negative</span>
                                            <span className="text-sm font-medium text-gray-900">City Hospital</span>
                                        </div>
                                        <p className="text-xs text-red-600 mt-1">Needed within 4 hours</p>
                                    </div>
                                    <Button size="sm" variant="destructive">View</Button>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
