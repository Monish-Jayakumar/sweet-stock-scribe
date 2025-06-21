
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useInventory } from '@/hooks/useInventory';
import { Plus, Package, Edit, Trash2, Lock } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { AddMaterialForm } from './AddMaterialForm';
import { AddProductForm } from './AddProductForm';

export const SettingsPage = () => {
  const { rawMaterials, products, getStockStatus, addNewMaterial, updateMaterialCost, renameMaterial, deleteMaterial, addNewProduct, renameProduct, deleteProduct } = useInventory();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [password, setPassword] = useState<string>('');
  const [showAddMaterial, setShowAddMaterial] = useState<boolean>(false);
  const [showAddProduct, setShowAddProduct] = useState<boolean>(false);
  const [editingCost, setEditingCost] = useState<string>('');
  const [newCost, setNewCost] = useState<number>(0);
  const [editingMaterialName, setEditingMaterialName] = useState<string>('');
  const [editingProductName, setEditingProductName] = useState<string>('');
  const [newMaterialName, setNewMaterialName] = useState<string>('');
  const [newProductName, setNewProductName] = useState<string>('');

  const handleLogin = () => {
    if (password === 'Idontremember') {
      setIsAuthenticated(true);
      toast({
        title: "Access Granted",
        description: "Welcome to Settings",
      });
    } else {
      toast({
        title: "Access Denied",
        description: "Incorrect password",
        variant: "destructive"
      });
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

  const handleAddNewProduct = (productData: {
    name: string;
    recipe: { materialId: string; quantity: number }[];
  }) => {
    const success = addNewProduct(productData);
    if (success) {
      setShowAddProduct(false);
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
    if (!newMaterialName.trim()) {
      toast({
        title: "Invalid Input",
        description: "Name cannot be empty",
        variant: "destructive"
      });
      return;
    }
    
    const success = renameMaterial(materialId, newMaterialName.trim());
    if (success) {
      setEditingMaterialName('');
      setNewMaterialName('');
    }
  };

  const handleRenameProduct = (productId: string) => {
    if (!newProductName.trim()) {
      toast({
        title: "Invalid Input",
        description: "Name cannot be empty",
        variant: "destructive"
      });
      return;
    }
    
    const success = renameProduct(productId, newProductName.trim());
    if (success) {
      setEditingProductName('');
      setNewProductName('');
    }
  };

  const handleDeleteMaterial = (materialId: string) => {
    if (window.confirm('Are you sure you want to delete this material? This action cannot be undone.')) {
      deleteMaterial(materialId);
    }
  };

  const handleDeleteProduct = (productId: string) => {
    if (window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      deleteProduct(productId);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="p-6 min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Lock className="mr-2 h-5 w-5" />
              Settings Access
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Password</label>
              <Input 
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter settings password"
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
              />
            </div>
            <Button onClick={handleLogin} className="w-full">
              Access Settings
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <Button 
          variant="outline" 
          onClick={() => setIsAuthenticated(false)}
        >
          Lock Settings
        </Button>
      </div>

      {/* Materials Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Package className="mr-2 h-5 w-5" />
            Materials Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={() => setShowAddMaterial(true)}
            className="mb-4"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add New Material
          </Button>

          {showAddMaterial && (
            <div className="border p-4 rounded-lg">
              <AddMaterialForm
                onAddMaterial={handleAddNewMaterial}
                onCancel={() => setShowAddMaterial(false)}
              />
            </div>
          )}

          <div className="space-y-4">
            {rawMaterials.map((material) => {
              const status = getStockStatus(material);
              
              return (
                <div key={material.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {editingMaterialName === material.id ? (
                        <div className="flex gap-1">
                          <Input 
                            value={newMaterialName}
                            onChange={(e) => setNewMaterialName(e.target.value)}
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
                              setEditingMaterialName('');
                              setNewMaterialName('');
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
                              setEditingMaterialName(material.id);
                              setNewMaterialName(material.name);
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
                      <p className="font-bold text-green-600">₹{(material.currentStock * material.costPerUnit).toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Products Management */}
      <Card>
        <CardHeader>
          <CardTitle>Products Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={() => setShowAddProduct(true)}
            className="mb-4"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add New Product
          </Button>

          {showAddProduct && (
            <div className="border p-4 rounded-lg">
              <AddProductForm
                rawMaterials={rawMaterials}
                onAddProduct={handleAddNewProduct}
                onCancel={() => setShowAddProduct(false)}
              />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map(product => (
              <div key={product.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  {editingProductName === product.id ? (
                    <div className="flex gap-1 flex-1">
                      <Input 
                        value={newProductName}
                        onChange={(e) => setNewProductName(e.target.value)}
                        className="h-8 font-semibold"
                        placeholder="Enter new name"
                      />
                      <Button 
                        size="sm" 
                        onClick={() => handleRenameProduct(product.id)}
                        className="h-8 px-2 text-xs"
                      >
                        Save
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => {
                          setEditingProductName('');
                          setNewProductName('');
                        }}
                        className="h-8 px-2 text-xs"
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <>
                      <h3 className="font-semibold text-lg">{product.name}</h3>
                      <div className="flex gap-1">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            setEditingProductName(product.id);
                            setNewProductName(product.name);
                          }}
                          className="h-6 w-6 p-0"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDeleteProduct(product.id)}
                          className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </>
                  )}
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Production Cost:</span>
                    <span className="font-medium">₹{product.productionCost.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
