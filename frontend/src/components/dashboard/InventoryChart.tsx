
import Chart from 'react-apexcharts';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { motion } from 'framer-motion';
import { ApexOptions } from 'apexcharts';

interface InventoryItem {
    blood_type: string;
    units: number;
}

interface InventoryChartProps {
    data?: InventoryItem[];
}

export function InventoryChart({ data }: InventoryChartProps) {
    const chartData = data || [
        { blood_type: 'O+', units: 0 },
        { blood_type: 'A+', units: 0 },
        { blood_type: 'B+', units: 0 },
        { blood_type: 'AB+', units: 0 },
        { blood_type: 'O-', units: 0 }
    ];

    const labels = chartData.map(item => item.blood_type);
    const series = chartData.map(item => item.units);

    // Custom colors mapping (optional, or generate dynamically)
    const colorMap: Record<string, string> = {
        'O+': '#ef4444', 'A+': '#f87171', 'B+': '#b91c1c', 'AB+': '#991b1b',
        'O-': '#fee2e2', 'A-': '#fca5a5', 'B-': '#ef4444', 'AB-': '#7f1d1d'
    };
    const colors = labels.map(label => colorMap[label] || '#9ca3af');

    const options: ApexOptions = {
        chart: { type: 'donut' },
        labels: labels,
        colors: colors,
        plotOptions: {
            pie: {
                donut: {
                    size: '70%',
                    labels: {
                        show: true,
                        total: {
                            show: true,
                            label: 'Total Units',
                            color: '#374151',
                            formatter: (w) => {
                                return w.globals.seriesTotals.reduce((a: any, b: any) => a + b, 0).toLocaleString();
                            }
                        }
                    }
                }
            }
        },
        dataLabels: { enabled: false },
        legend: { position: 'bottom' },
        stroke: { show: false },
        tooltip: { theme: 'light' }
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="h-full"
        >
            <Card className="h-full border-none shadow-md bg-white/50 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle>Blood Availability</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-[300px] w-full flex items-center justify-center">
                        <Chart options={options} series={series} type="donut" width="100%" height={280} />
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}
