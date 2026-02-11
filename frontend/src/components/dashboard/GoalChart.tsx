
import Chart from 'react-apexcharts';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { motion } from 'framer-motion';
import { ApexOptions } from 'apexcharts';

export function GoalChart() {
    const options: ApexOptions = {
        chart: {
            height: 280,
            type: 'radialBar',
        },
        series: [75],
        colors: ['#20E647'],
        plotOptions: {
            radialBar: {
                hollow: {
                    margin: 0,
                    size: '70%',
                    background: '#fff',
                    image: undefined,
                    imageOffsetX: 0,
                    imageOffsetY: 0,
                    position: 'front',
                    dropShadow: {
                        enabled: true,
                        top: 3,
                        left: 0,
                        blur: 4,
                        opacity: 0.24
                    }
                },
                track: {
                    background: '#fff',
                    strokeWidth: '67%',
                    margin: 0, // margin is in pixels
                    dropShadow: {
                        enabled: true,
                        top: -3,
                        left: 0,
                        blur: 4,
                        opacity: 0.35
                    }
                },
                dataLabels: {
                    show: true,
                    name: {
                        offsetY: -10,
                        show: true,
                        color: '#888',
                        fontSize: '17px'
                    },
                    value: {
                        formatter: function (val) {
                            return parseInt(val.toString()) + "%";
                        },
                        color: '#111',
                        fontSize: '36px',
                        show: true,
                    }
                }
            }
        },
        fill: {
            type: 'gradient',
            gradient: {
                shade: 'dark',
                type: 'horizontal',
                shadeIntensity: 0.5,
                gradientToColors: ['#ABE5A1'],
                inverseColors: true,
                opacityFrom: 1,
                opacityTo: 1,
                stops: [0, 100]
            }
        },
        stroke: {
            lineCap: 'round'
        },
        labels: ['Daily Goal'],
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="h-full"
        >
            <Card className="h-full border-none shadow-md bg-white/50 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle>Daily Collection Goal</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex justify-center">
                        <Chart options={options} series={[75]} type="radialBar" height={300} />
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}
