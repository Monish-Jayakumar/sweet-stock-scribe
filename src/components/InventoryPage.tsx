import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useInventory } from '@/hooks/useInventory';
import { Plus, Package, TrendingUp, TrendingDown, Edit, Trash2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { AddMaterialForm } from './AddMaterialForm';

export const InventoryPage = () => {
  const { rawMaterials, addStock, getStockStatus, transactions, addNewMaterial, updateMaterialCost, renameMaterial, deleteMaterial } = useInventory();
  const [selectedMaterial, setSelectedMaterial] = useState<string>('');
  const [addQuantity, setAddQuantity] = useState<number>(0);
  const [notes, setNotes] = useState<string>('');
  const [showAddMaterial, setShowAddMaterial] = useState<boolean>(false);
  const [editingCost, setEditingCost] = useState<string>('');
  const [newCost, setNewCost] = useState<number>(0);
  const [editingName, setEditingName] = useState<string>('');
  const [newName, setNewName] = useState<string>('');

  const handleAddStock = () => {
    if (!selectedMaterial || addQuantity <= 0) {
      toast({
        title: "Invalid Input",
        description: "Please select a material and enter a valid quantity",
        variant: "destructive"
      });
      return;
    }
    
    addStock(selectedMaterial, addQuantity, notes);
    setAddQuantity(0);
    setNotes('');
    setSelectedMaterial('');
  };

  const handleMaterialSelection = (value: string) => {
    if (value === 'add_new') {
      setShowAddMaterial(true);
      setSelectedMaterial('');
    } else {
      setSelectedMaterial(value);
      setShowAddMaterial(false);
    }
  };

  const handleAddNewMaterial = (materialData: {
    name: string;
    unit: string;
    costPerUnit: number;
    minStockLevel: number;
    currentStock: number;
  }) => {
    const success = addNewMaterial(materialData);
    if (success) {
      setShowAddMaterial(false);
    }
    return success;
  };

  const handleUpdateCost = (materialId: string) => {
    if (newCost <= 0) {
      toast({
        title: "Invalid Input",
        description: "Cost must be greater than 0",
        variant: "destructive"
      });
      return;
    }
    
    updateMaterialCost(materialId, newCost);
    setEditingCost('');
    setNewCost(0);
  };

  const handleRenameMaterial = (materialId: string) => {
    if (!newName.trim()) {
      toast({
        title: "Invalid Input",
        description: "Name cannot be empty",
        variant: "destructive"
      });
      return;
    }
    
    const success = renameMaterial(materialId, newName.trim());
    if (success) {
      setEditingName('');
      setNewName('');
    }
  };

  const handleDeleteMaterial = (materialId: string) => {
    if (window.confirm('Are you sure you want to delete this material? This action cannot be undone.')) {
      deleteMaterial(materialId);
    }
  };

  const materialTransactions = transactions.filter(t => t.materialId).slice(0, 20);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Inventory Management</h1>
        <Badge variant="outline" className="text-lg px-3 py-1">
          {rawMaterials.length} materials tracked
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Add Material Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Plus className="mr-2 h-5 w-5" />
              Add Material
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Add Material</label>
              <select 
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={selectedMaterial}
                onChange={(e) => handleMaterialSelection(e.target.value)}
              >
                <option value="">Choose material...</option>
                {rawMaterials.map(material => (
                  <option key={material.id} value={material.id}>
                    {material.name} (Current: {material.currentStock.toLocaleString()}{material.unit})
                  </option>
                ))}
                <option value="add_new" className="font-medium text-blue-600">
                  + Add New Material
                </option>
              </select>
            </div>

            {showAddMaterial && (
              <AddMaterialForm
                onAddMaterial={handleAddNewMaterial}
                onCancel={() => setShowAddMaterial(false)}
              />
            )}

            {!showAddMaterial && (
              <>
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
                      Unit: {rawMaterials.find(m => m.id === selectedMaterial)?.unit}
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
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-sm font-medium">Stock Update Preview:</p>
                    <p className="text-sm text-gray-600">
                      {rawMaterials.find(m => m.id === selectedMaterial)?.name}
                    </p>
                    <p className="text-sm">
                      {rawMaterials.find(m => m.id === selectedMaterial)?.currentStock.toLocaleString()} 
                      → {((rawMaterials.find(m => m.id === selectedMaterial)?.currentStock || 0) + addQuantity).toLocaleString()}
                      {rawMaterials.find(m => m.id === selectedMaterial)?.unit}
                    </p>
                    <p className="text-sm text-green-600 font-medium">
                      Cost: ₹{((rawMaterials.find(m => m.id === selectedMaterial)?.costPerUnit || 0) * addQuantity).toFixed(2)}
                    </p>
                  </div>
                )}

                <Button 
                  onClick={handleAddStock}
                  disabled={!selectedMaterial || addQuantity <= 0}
                  className="w-full"
                >
                  Add to Inventory
                </Button>
              </>
            )}
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
                      <div className="flex items-center gap-2">
                        {editingName === material.id ? (
                          <div className="flex gap-1">
                            <Input 
                              value={newName}
                              onChange={(e) => setNewName(e.target.value)}
                              className="h-8 text-lg font-semibold"
                              placeholder="Enter new name"
                            />
                            <Button 
                              size="sm" 
                              onClick={() => handleRenameMaterial(material.id)}
                              className="h-8 px-2 text-xs"
                            >
                              Save
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => {
                                setEditingName('');
                                setNewName('');
                              }}
                              className="h-8 px-2 text-xs"
                            >
                              Cancel
                            </Button>
                          </div>
                        ) : (
                          <>
                            <h3 className="font-semibold text-lg">{material.name}</h3>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => {
                                setEditingName(material.id);
                                setNewName(material.name);
                              }}
                              className="h-6 w-6 p-0"
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleDeleteMaterial(material.id)}
                              className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </>
                        )}
                      </div>
                      <Badge variant={status === 'critical' ? 'destructive' : status === 'warning' ? 'secondary' : 'default'}>
                        {status}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
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
                        <p className="text-gray-600">Cost/Unit</p>
                        <div className="flex items-center gap-2">
                          {editingCost === material.id ? (
                            <div className="flex gap-1">
                              <Input 
                                type="number"
                                step="0.01"
                                value={newCost || ''}
                                onChange={(e) => setNewCost(parseFloat(e.target.value) || 0)}
                                className="w-20 h-6 text-xs"
                              />
                              <Button 
                                size="sm" 
                                onClick={() => handleUpdateCost(material.id)}
                                className="h-6 px-2 text-xs"
                              >
                                Save
                              </Button>
                            </div>
                          ) : (
                            <>
                              <p className="font-medium">₹{material.costPerUnit.toFixed(2)}</p>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => {
                                  setEditingCost(material.id);
                                  setNewCost(material.costPerUnit);
                                }}
                                className="h-6 w-6 p-0"
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                            </>
                          )}
                        </div>
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
