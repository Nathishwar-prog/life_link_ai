
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/Avatar';
import { Droplet, Heart, Activity } from 'lucide-react';

const activities = [
    {
        id: 1,
        user: "Sarah Wilson",
        action: "Donated",
        target: "450ml O+ Blood",
        time: "2 hours ago",
        icon: Droplet,
        iconColor: "text-red-500",
        bg: "bg-red-50"
    },
    {
        id: 2,
        user: "St. Mary's Hospital",
        action: "Requested",
        target: "5 Units A- Blood",
        time: "4 hours ago",
        icon: Activity,
        iconColor: "text-blue-500",
        bg: "bg-blue-50"
    },
    {
        id: 3,
        user: "John Doe",
        action: "Registered",
        target: "as new Donor",
        time: "5 hours ago",
        icon: Heart,
        iconColor: "text-rose-500",
        bg: "bg-rose-50"
    },
];

export function RecentActivity() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
        >
            <Card className="border-none shadow-md bg-white/50 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {activities.map((item, index) => (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 + (index * 0.1) }}
                                className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50/80 transition-colors"
                            >
                                <div className="flex items-center space-x-4">
                                    <Avatar className="h-9 w-9">
                                        <AvatarImage src={`https://ui-avatars.com/api/?name=${item.user}&background=random`} alt={item.user} />
                                        <AvatarFallback>{item.user.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">
                                            {item.user} <span className="text-gray-500 font-normal">{item.action}</span>
                                        </p>
                                        <p className="text-xs text-gray-500">{item.target}</p>
                                    </div>
                                </div>
                                <span className="text-xs text-gray-400 whitespace-nowrap">{item.time}</span>
                            </motion.div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}
