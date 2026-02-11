
import { motion } from 'framer-motion';
import { LucideIcon, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import { Card, CardContent } from '../ui/Card';

interface StatCardProps {
    title: string;
    value: string;
    change: string;
    icon: LucideIcon;
    color: string;
    bg: string;
    trend: 'up' | 'down' | 'neutral';
}

export function StatCard({ title, value, change, icon: Icon, color, bg, trend }: StatCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <Card className="hover:shadow-lg transition-shadow duration-300 border-none bg-white/50 backdrop-blur-sm">
                <CardContent className="p-6 relative overflow-hidden group">
                    <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity duration-300`}>
                        <Icon className={`h-24 w-24 ${color}`} />
                    </div>
                    <div className="flex items-center justify-between relative z-10">
                        <div className={`p-3 rounded-2xl ${bg} ${color} shadow-lg shadow-${color.split('-')[1]}-100`}>
                            <Icon className="h-6 w-6" />
                        </div>
                        <div className={`flex items-center space-x-1 text-sm font-medium ${trend === 'up' ? 'text-emerald-600' :
                            trend === 'down' ? 'text-rose-600' : 'text-gray-500'
                            }`}>
                            {trend === 'up' && <ArrowUpRight className="h-4 w-4" />}
                            {trend === 'down' && <ArrowDownRight className="h-4 w-4" />}
                            {trend === 'neutral' && <Minus className="h-4 w-4" />}
                            <span>{change}</span>
                        </div>
                    </div>
                    <div className="mt-4">
                        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
                        <div className="text-3xl font-bold text-gray-900 mt-1">
                            {value}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}
