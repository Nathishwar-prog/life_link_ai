
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Droplet, Users, Activity, HeartPulse } from 'lucide-react';
import { StatCard } from '../../components/dashboard/StatCard';
import { ActivityChart } from '../../components/dashboard/ActivityChart';
import { InventoryChart } from '../../components/dashboard/InventoryChart';
import { GoalChart } from '../../components/dashboard/GoalChart';
import { RecentActivity } from '../../components/dashboard/RecentActivity';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';

export function Overview() {
    const { user } = useAuth();
    const [inventoryData, setInventoryData] = useState<{ blood_type: string; units: number }[]>([]);
    const [totalUnits, setTotalUnits] = useState(0);
    const [activeDonors, setActiveDonors] = useState(0);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch Inventory
                const invRes = await fetch('/api/inventory');
                if (invRes.ok) {
                    const data = await invRes.json();
                    setInventoryData(data);
                    const total = data.reduce((acc: number, item: any) => acc + item.units, 0);
                    setTotalUnits(total);
                }

                // Fetch Donor Count
                const donorRes = await fetch('/api/donors/count');
                if (donorRes.ok) {
                    const data = await donorRes.json();
                    setActiveDonors(data.count);
                }
            } catch (error) {
                console.error("Failed to fetch dashboard data", error);
            }
        };
        fetchData();
    }, []);

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    return (
        <div className="space-y-8 p-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <motion.h1
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-600 to-rose-400"
                    >
                        Welcome Back, {user?.full_name || user?.role || 'Admin'}
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-gray-500 mt-1"
                    >
                        Here's what's happening in your blood bank today.
                    </motion.p>
                </div>
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex gap-2"
                >
                    <Button variant="outline">Download Report</Button>
                    <Button className="bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-200">
                        + Add Donor
                    </Button>
                </motion.div>
            </div>

            <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
            >
                <StatCard
                    title="Total Blood Units"
                    value={totalUnits.toLocaleString()}
                    change="+12.5%"
                    trend="up"
                    icon={Droplet}
                    color="text-red-600"
                    bg="bg-red-100"
                />
                <StatCard
                    title="Active Donors"
                    value={activeDonors.toLocaleString()}
                    change="+5.2%"
                    trend="up"
                    icon={Users}
                    color="text-blue-600"
                    bg="bg-blue-100"
                />
                <StatCard
                    title="Urgent Requests"
                    value="12"
                    change="-2.4%"
                    trend="down"
                    icon={Activity}
                    color="text-amber-600"
                    bg="bg-amber-100"
                />
                <StatCard
                    title="Lives Saved"
                    value="892"
                    change="+18%"
                    trend="up"
                    icon={HeartPulse}
                    color="text-rose-600"
                    bg="bg-rose-100"
                />
            </motion.div>

            <div className="grid gap-6 md:grid-cols-7">
                <div className="md:col-span-4 lg:col-span-4">
                    <ActivityChart />
                </div>
                <div className="md:col-span-3 lg:col-span-2">
                    <InventoryChart data={inventoryData} />
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <RecentActivity />
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="h-full"
                >
                    {/* Placeholder for Map or other widget */}
                </motion.div>
            </div>
        </div>
    );
}
