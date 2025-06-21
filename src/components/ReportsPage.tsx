import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useInventory } from '@/hooks/useInventory';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, Package, AlertTriangle } from 'lucide-react';

export const ReportsPage = () => {
  const { rawMaterials, productionLogs, transactions, products, getLowStockItems, getStockStatus } = useInventory();
  
  // Stock value data for bar chart
  const stockValueData = rawMaterials.map(material => ({
    name: material.name.split(' ')[0], // Shortened name
    value: material.currentStock * material.costPerUnit,
    stock: material.currentStock,
    unit: material.unit
  }));

  // Production data for the last 7 days
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return date;
  }).reverse();

  const productionData = last7Days.map(date => {
    const dayProduction = productionLogs.filter(log => 
      new Date(log.timestamp).toDateString() === date.toDateString()
    ).length;
    
    return {
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      production: dayProduction
    };
  });

  // Fixed Stock status distribution
  const stockStatusData = [
    { 
      name: 'Good Stock', 
      value: rawMaterials.filter(m => getStockStatus(m) === 'good').length,
      color: '#10B981'
    },
    { 
      name: 'Warning', 
      value: rawMaterials.filter(m => getStockStatus(m) === 'warning').length,
      color: '#F59E0B'
    },
    { 
      name: 'Critical', 
      value: rawMaterials.filter(m => getStockStatus(m) === 'critical').length,
      color: '#EF4444'
    }
  ];

  const totalValue = rawMaterials.reduce((sum, m) => sum + (m.currentStock * m.costPerUnit), 0);
  const lowStockItems = getLowStockItems();
  const totalProduction = productionLogs.length;
  const todayTransactions = transactions.filter(t => 
    new Date(t.timestamp).toDateString() === new Date().toDateString()
  ).length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
        <Badge variant="outline" className="text-lg px-3 py-1">
          Generated: {new Date().toLocaleDateString()}
        </Badge>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Inventory Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">₹{totalValue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Across {rawMaterials.length} materials</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Items at Risk</CardTitle>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{lowStockItems.length}</div>
            <p className="text-xs text-muted-foreground">Below minimum levels</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Production</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{totalProduction}</div>
            <p className="text-xs text-muted-foreground">All time production logs</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Activity</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{todayTransactions}</div>
            <p className="text-xs text-muted-foreground">Transactions today</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Inventory Value by Material</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stockValueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [`₹${Number(value).toFixed(2)}`, 'Value']}
                  labelFormatter={(label) => {
                    const item = stockValueData.find(d => d.name === label);
                    return `${label} (${item?.stock}${item?.unit})`;
                  }}
                />
                <Bar dataKey="value" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Stock Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stockStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {stockStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Production Trend */}
      <Card>
        <CardHeader>
          <CardTitle>Production Trend (Last 7 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={productionData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="production" fill="#10B981" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Detailed Stock Report */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Stock Report</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-200">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-200 px-4 py-2 text-left">Material</th>
                  <th className="border border-gray-200 px-4 py-2 text-right">Current Stock</th>
                  <th className="border border-gray-200 px-4 py-2 text-right">Min Level</th>
                  <th className="border border-gray-200 px-4 py-2 text-right">Cost/Unit</th>
                  <th className="border border-gray-200 px-4 py-2 text-right">Total Value</th>
                  <th className="border border-gray-200 px-4 py-2 text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {rawMaterials.map((material) => {
                  const stockValue = material.currentStock * material.costPerUnit;
                  const status = getStockStatus(material);
                  
                  return (
                    <tr key={material.id} className="hover:bg-gray-50">
                      <td className="border border-gray-200 px-4 py-2 font-medium">{material.name}</td>
                      <td className="border border-gray-200 px-4 py-2 text-right">
                        {material.currentStock.toLocaleString()}{material.unit}
                      </td>
                      <td className="border border-gray-200 px-4 py-2 text-right">
                        {material.minStockLevel.toLocaleString()}{material.unit}
                      </td>
                      <td className="border border-gray-200 px-4 py-2 text-right">
                        ₹{material.costPerUnit.toFixed(2)}
                      </td>
                      <td className="border border-gray-200 px-4 py-2 text-right font-medium">
                        ₹{stockValue.toFixed(2)}
                      </td>
                      <td className="border border-gray-200 px-4 py-2 text-center">
                        <Badge variant={status === 'critical' ? 'destructive' : status === 'warning' ? 'secondary' : 'default'}>
                          {status}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
