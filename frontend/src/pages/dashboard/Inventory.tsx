import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Droplet, Plus, Minus, AlertTriangle, Loader2 } from 'lucide-react';

// Mock data until backend is ready
const MOCK_INVENTORY = [
    { id: 1, blood_type: 'A+', units: 24, expiry_soon: 2 },
    { id: 2, blood_type: 'A-', units: 8, expiry_soon: 0 },
    { id: 3, blood_type: 'B+', units: 15, expiry_soon: 1 },
    { id: 4, blood_type: 'B-', units: 4, expiry_soon: 0 }, // Low stock
    { id: 5, blood_type: 'AB+', units: 12, expiry_soon: 0 },
    { id: 6, blood_type: 'AB-', units: 2, expiry_soon: 0 }, // Critical
    { id: 7, blood_type: 'O+', units: 30, expiry_soon: 5 },
    { id: 8, blood_type: 'O-', units: 5, expiry_soon: 0 },
];

const stockSchema = z.object({
    blood_type: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']),
    units: z.number().min(1),
    action: z.enum(['ADD', 'REMOVE'])
});

type StockValues = z.infer<typeof stockSchema>;

export function Inventory() {
    const [inventory, setInventory] = useState(MOCK_INVENTORY);
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);

    const { register, handleSubmit, reset } = useForm<StockValues>({
        resolver: zodResolver(stockSchema),
        defaultValues: {
            units: 1,
            action: 'ADD'
        }
    });

    const onSubmit = async (data: StockValues) => {
        setActionLoading(true);
        // Simulate API call
        setTimeout(() => {
            setInventory(prev => prev.map(item => {
                if (item.blood_type === data.blood_type) {
                    return {
                        ...item,
                        units: data.action === 'ADD'
                            ? item.units + data.units
                            : Math.max(0, item.units - data.units)
                    };
                }
                return item;
            }));
            setActionLoading(false);
            reset();
        }, 1000);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
                    <p className="text-gray-500">Manage blood units and monitor stock levels.</p>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {/* Quick Action Card */}
                <Card className="md:col-span-1 h-fit">
                    <CardHeader>
                        <CardTitle className="text-lg">Update Stock</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Action</label>
                                <select
                                    {...register('action')}
                                    className="mt-1 block w-full rounded-md border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 sm:text-sm"
                                >
                                    <option value="ADD">Add Units</option>
                                    <option value="REMOVE">Issue/Remove Units</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Blood Type</label>
                                <select
                                    {...register('blood_type')}
                                    className="mt-1 block w-full rounded-md border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 sm:text-sm"
                                >
                                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(type => (
                                        <option key={type} value={type}>{type}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Units</label>
                                <Input
                                    type="number"
                                    min="1"
                                    {...register('units', { valueAsNumber: true })}
                                />
                            </div>

                            <Button type="submit" className="w-full" disabled={actionLoading}>
                                {actionLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Update Inventory'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Inventory Table/Grid */}
                <div className="md:col-span-2 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {inventory.map((item) => (
                        <Card key={item.id} className={`${item.units < 5 ? 'border-red-300 bg-red-50' : ''}`}>
                            <CardHeader className="pb-2">
                                <div className="flex justify-between items-start">
                                    <div className={`text-2xl font-bold bg-white w-12 h-12 rounded-full flex items-center justify-center border-2 ${item.units < 5 ? 'border-red-500 text-red-600' : 'border-gray-200 text-gray-700'}`}>
                                        {item.blood_type}
                                    </div>
                                    {item.units < 5 && (
                                        <AlertTriangle className="h-5 w-5 text-red-500" />
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-baseline space-x-1">
                                    <span className="text-3xl font-bold text-gray-900">{item.units}</span>
                                    <span className="text-sm text-gray-500">units</span>
                                </div>
                                {item.expiry_soon > 0 && (
                                    <p className="text-xs text-amber-600 mt-2 font-medium">
                                        ⚠️ {item.expiry_soon} expiring soon
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}
