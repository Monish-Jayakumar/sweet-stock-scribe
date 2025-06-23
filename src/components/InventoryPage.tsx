import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useInventory } from '@/hooks/useInventory';
import { Plus, Package, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export const InventoryPage = () => {
  const { rawMaterials, addStock, getStockStatus, transactions } = useInventory();
  const [selectedMaterial, setSelectedMaterial] = useState<string>('');
  const [addQuantity, setAddQuantity] = useState<number>(0);
  const [purchasePrice, setPurchasePrice] = useState<number>(0);
  const [notes, setNotes] = useState<string>('');

  const handleAddStock = () => {
    if (!selectedMaterial || addQuantity <= 0) {
      toast({
        title: "Invalid Input",
        description: "Please select a material and enter a valid quantity",
        variant: "destructive"
      });
      return;
    }
    
    addStock(selectedMaterial, addQuantity, purchasePrice > 0 ? purchasePrice : undefined, notes);
    setAddQuantity(0);
    setPurchasePrice(0);
    setNotes('');
    setSelectedMaterial('');
  };

  const selectedMaterialData = rawMaterials.find(m => m.id === selectedMaterial);
  const materialTransactions = transactions.filter(t => t.materialId).slice(0, 20);

  // Calculate new weighted average cost preview
  const calculateNewAverageCost = () => {
    if (!selectedMaterialData || addQuantity <= 0 || purchasePrice <= 0) return null;
    
    const currentValue = selectedMaterialData.currentStock * selectedMaterialData.costPerUnit;
    const newValue = addQuantity * purchasePrice;
    const totalStock = selectedMaterialData.currentStock + addQuantity;
    
    return totalStock > 0 ? (currentValue + newValue) / totalStock : purchasePrice;
  };

  const newAverageCost = calculateNewAverageCost();

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Inventory Management</h1>
        <Badge variant="outline" className="text-lg px-3 py-1">
          {rawMaterials.length} materials tracked
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Add Stock Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Plus className="mr-2 h-5 w-5" />
              Add Stock
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Select Material</label>
              <select 
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={selectedMaterial}
                onChange={(e) => setSelectedMaterial(e.target.value)}
              >
                <option value="">Choose material...</option>
                {rawMaterials.map(material => (
                  <option key={material.id} value={material.id}>
                    {material.name} (Stock: {material.currentStock.toLocaleString()}{material.unit})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Quantity to Add</label>
              <Input 
                type="number"
                step="0.01"
                min="0"
                value={addQuantity || ''}
                onChange={(e) => setAddQuantity(parseFloat(e.target.value) || 0)}
                placeholder="Enter quantity"
              />
              {selectedMaterial && (
                <p className="text-sm text-gray-500 mt-1">
                  Unit: {selectedMaterialData?.unit}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Purchase Price per Unit (Optional)
              </label>
              <Input 
                type="number"
                step="0.01"
                min="0"
                value={purchasePrice || ''}
                onChange={(e) => setPurchasePrice(parseFloat(e.target.value) || 0)}
                placeholder="Enter purchase price"
              />
              {selectedMaterialData && (
                <p className="text-sm text-gray-500 mt-1">
                  Current avg cost: ₹{selectedMaterialData.costPerUnit.toFixed(2)}/{selectedMaterialData.unit}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Notes (Optional)</label>
              <Input 
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Purchase notes, supplier, etc."
              />
            </div>

            {selectedMaterial && addQuantity > 0 && (
              <div className="bg-blue-50 p-3 rounded-lg space-y-2">
                <p className="text-sm font-medium">Stock Update Preview:</p>
                <p className="text-sm text-gray-600">
                  {selectedMaterialData?.name}
                </p>
                <div className="text-sm space-y-1">
                  <p>
                    Stock: {selectedMaterialData?.currentStock.toLocaleString()} 
                    → {((selectedMaterialData?.currentStock || 0) + addQuantity).toLocaleString()}
                    {selectedMaterialData?.unit}
                  </p>
                  {purchasePrice > 0 && newAverageCost && (
                    <p className="text-blue-600">
                      Avg Cost: ₹{selectedMaterialData?.costPerUnit.toFixed(2)} 
                      → ₹{newAverageCost.toFixed(2)}/{selectedMaterialData?.unit}
                    </p>
                  )}
                  <p className="text-green-600 font-medium">
                    Purchase Cost: ₹{(purchasePrice > 0 ? purchasePrice * addQuantity : (selectedMaterialData?.costPerUnit || 0) * addQuantity).toFixed(2)}
                  </p>
                </div>
              </div>
            )}

            <Button 
              onClick={handleAddStock}
              disabled={!selectedMaterial || addQuantity <= 0}
              className="w-full"
            >
              Add to Inventory
            </Button>
          </CardContent>
        </Card>

        {/* Current Stock Levels */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Package className="mr-2 h-5 w-5" />
              Current Stock Levels
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {rawMaterials.map((material) => {
                const status = getStockStatus(material);
                const stockValue = material.currentStock * material.costPerUnit;
                
                return (
                  <div key={material.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-lg">{material.name}</h3>
                      <Badge variant={status === 'critical' ? 'destructive' : status === 'warning' ? 'secondary' : 'default'}>
                        {status}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Current Stock</p>
                        <p className="font-bold text-lg">
                          {material.currentStock.toLocaleString()}{material.unit}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Min Level</p>
                        <p className="font-medium">
                          {material.minStockLevel.toLocaleString()}{material.unit}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Avg Cost/Unit</p>
                        <p className="font-medium">₹{material.costPerUnit.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Total Value</p>
                        <p className="font-bold text-green-600">₹{stockValue.toFixed(2)}</p>
                      </div>
                    </div>
                    
                    <div className="mt-3">
                      <div className="flex justify-between text-xs text-gray-600 mb-1">
                        <span>Stock Level</span>
                        <span>{Math.round((material.currentStock / material.minStockLevel) * 100)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${
                            status === 'critical' ? 'bg-red-500' : 
                            status === 'warning' ? 'bg-amber-500' : 'bg-green-500'
                          }`}
                          style={{ 
                            width: `${Math.min((material.currentStock / (material.minStockLevel * 3)) * 100, 100)}%` 
                          }}
                        />
                      </div>
                    </div>
                    
                    <p className="text-xs text-gray-500 mt-2">
                      Last updated: {new Date(material.lastUpdated).toLocaleString()}
                    </p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {materialTransactions.length > 0 ? (
              materialTransactions.map((transaction) => {
                const material = rawMaterials.find(m => m.id === transaction.materialId);
                return (
                  <div key={transaction.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-full ${
                        transaction.quantity > 0 ? 'bg-green-100' : 'bg-red-100'
                      }`}>
                        {transaction.quantity > 0 ? 
                          <TrendingUp className="h-4 w-4 text-green-600" /> : 
                          <TrendingDown className="h-4 w-4 text-red-600" />
                        }
                      </div>
                      <div>
                        <p className="font-medium">{material?.name || 'Unknown Material'}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(transaction.timestamp).toLocaleString()}
                        </p>
                        {transaction.notes && (
                          <p className="text-xs text-gray-500">{transaction.notes}</p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${transaction.quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {transaction.quantity > 0 ? '+' : ''}{transaction.quantity.toLocaleString()}{material?.unit}
                      </p>
                      {transaction.purchasePrice && transaction.type === 'purchase' && (
                        <p className="text-sm text-blue-600 flex items-center">
                          <DollarSign className="h-3 w-3 mr-1" />
                          ₹{transaction.purchasePrice.toFixed(2)}/{material?.unit}
                        </p>
                      )}
                      <Badge variant="outline" className="mt-1">
                        {transaction.type}
                      </Badge>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-gray-500 text-center py-8">No transactions recorded yet</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
