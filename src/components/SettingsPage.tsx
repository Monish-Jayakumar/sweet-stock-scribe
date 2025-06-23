
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useInventory } from '@/hooks/useInventory';
import { Plus, Package, Edit, Trash2, Lock, Candy, Coffee, Cake, ChefHat, Minus } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { AddMaterialForm } from './AddMaterialForm';
import { AddProductForm } from './AddProductForm';

export const SettingsPage = () => {
  const { rawMaterials, products, getStockStatus, addNewMaterial, updateMaterialCost, renameMaterial, deleteMaterial, addNewProduct, renameProduct, deleteProduct, adjustStock } = useInventory();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [password, setPassword] = useState<string>('');
  const [activeSection, setActiveSection] = useState<'materials' | 'production'>('materials');
  const [activeProductionSection, setActiveProductionSection] = useState<'sweets' | 'savouries' | 'bakery'>('sweets');
  const [showAddMaterial, setShowAddMaterial] = useState<boolean>(false);
  const [showAddSweet, setShowAddSweet] = useState<boolean>(false);
  const [showAddSavoury, setShowAddSavoury] = useState<boolean>(false);
  const [showAddBakery, setShowAddBakery] = useState<boolean>(false);
  const [editingCost, setEditingCost] = useState<string>('');
  const [editingStock, setEditingStock] = useState<string>('');
  const [newCost, setNewCost] = useState<number>(0);
  const [newStock, setNewStock] = useState<number>(0);
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
  }, category: 'sweets' | 'savouries' | 'bakery') => {
    const success = addNewProduct({ ...productData, category });
    if (success) {
      setShowAddSweet(false);
      setShowAddSavoury(false);
      setShowAddBakery(false);
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

  const handleUpdateStock = (materialId: string) => {
    if (newStock < 0) {
      toast({
        title: "Invalid Input",
        description: "Stock cannot be negative",
        variant: "destructive"
      });
      return;
    }
    
    const material = rawMaterials.find(m => m.id === materialId);
    if (material) {
      const difference = newStock - material.currentStock;
      const reason = difference > 0 ? 'Stock increase via settings' : 'Stock adjustment via settings';
      adjustStock(materialId, newStock, reason);
    }
    setEditingStock('');
    setNewStock(0);
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

  // Filter products by category
  const sweetProducts = products.filter(p => p.category === 'sweets');
  const savouryProducts = products.filter(p => p.category === 'savouries');
  const bakeryProducts = products.filter(p => p.category === 'bakery');

  const getCurrentProducts = () => {
    switch (activeProductionSection) {
      case 'sweets':
        return sweetProducts;
      case 'savouries':
        return savouryProducts;
      case 'bakery':
        return bakeryProducts;
      default:
        return sweetProducts;
    }
  };

  const getProductionTitle = () => {
    switch (activeProductionSection) {
      case 'sweets':
        return 'Sweets';
      case 'savouries':
        return 'Savouries';
      case 'bakery':
        return 'Bakery';
      default:
        return 'Sweets';
    }
  };

  const getProductionIcon = () => {
    switch (activeProductionSection) {
      case 'sweets':
        return Candy;
      case 'savouries':
        return Coffee;
      case 'bakery':
        return Cake;
      default:
        return Candy;
    }
  };

  const getShowAddState = () => {
    switch (activeProductionSection) {
      case 'sweets':
        return showAddSweet;
      case 'savouries':
        return showAddSavoury;
      case 'bakery':
        return showAddBakery;
      default:
        return showAddSweet;
    }
  };

  const setShowAddState = (show: boolean) => {
    switch (activeProductionSection) {
      case 'sweets':
        setShowAddSweet(show);
        break;
      case 'savouries':
        setShowAddSavoury(show);
        break;
      case 'bakery':
        setShowAddBakery(show);
        break;
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

      {/* Navigation Buttons */}
      <div className="flex gap-4 mb-6">
        <Button
          variant={activeSection === 'materials' ? 'default' : 'outline'}
          onClick={() => setActiveSection('materials')}
          className="flex items-center"
        >
          <Package className="mr-2 h-4 w-4" />
          Materials Management
        </Button>
        <Button
          variant={activeSection === 'production' ? 'default' : 'outline'}
          onClick={() => setActiveSection('production')}
          className="flex items-center"
        >
          <ChefHat className="mr-2 h-4 w-4" />
          Recipe Management
        </Button>
      </div>

      {/* Materials Management Section */}
      {activeSection === 'materials' && (
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
                        <div className="flex items-center gap-2">
                          {editingStock === material.id ? (
                            <div className="flex gap-1">
                              <Input 
                                type="number"
                                step="0.01"
                                value={newStock || ''}
                                onChange={(e) => setNewStock(parseFloat(e.target.value) || 0)}
                                className="w-24 h-6 text-xs"
                              />
                              <Button 
                                size="sm" 
                                onClick={() => handleUpdateStock(material.id)}
                                className="h-6 px-2 text-xs"
                              >
                                Save
                              </Button>
                            </div>
                          ) : (
                            <>
                              <p className="font-bold text-lg">
                                {material.currentStock.toLocaleString()}{material.unit}
                              </p>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => {
                                  setEditingStock(material.id);
                                  setNewStock(material.currentStock);
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
      )}

      {/* Recipe Management Section */}
      {activeSection === 'production' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ChefHat className="mr-2 h-5 w-5" />
                Recipe Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Production Section Navigation */}
              <div className="flex gap-4 mb-6">
                <Button
                  variant={activeProductionSection === 'sweets' ? 'default' : 'outline'}
                  onClick={() => setActiveProductionSection('sweets')}
                  className="flex items-center"
                >
                  <Candy className="mr-2 h-4 w-4" />
                  Sweets
                </Button>
                <Button
                  variant={activeProductionSection === 'savouries' ? 'default' : 'outline'}
                  onClick={() => setActiveProductionSection('savouries')}
                  className="flex items-center"
                >
                  <Coffee className="mr-2 h-4 w-4" />
                  Savouries
                </Button>
                <Button
                  variant={activeProductionSection === 'bakery' ? 'default' : 'outline'}
                  onClick={() => setActiveProductionSection('bakery')}
                  className="flex items-center"
                >
                  <Cake className="mr-2 h-4 w-4" />
                  Bakery
                </Button>
              </div>

              {/* Current Production Section */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold flex items-center">
                    {React.createElement(getProductionIcon(), { className: "mr-2 h-5 w-5" })}
                    {getProductionTitle()}
                  </h3>
                  <Button onClick={() => setShowAddState(true)} size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Add {getProductionTitle().slice(0, -1)}
                  </Button>
                </div>

                {getShowAddState() && (
                  <div className="border p-4 rounded-lg mb-4">
                    <AddProductForm
                      rawMaterials={rawMaterials}
                      onAddProduct={(data) => handleAddNewProduct(data, activeProductionSection)}
                      onCancel={() => setShowAddState(false)}
                    />
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {getCurrentProducts().map(product => (
                    <div key={product.id} className="border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-2">
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
                            <h4 className="font-semibold">{product.name}</h4>
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
                      <div className="space-y-1 text-sm">
                        <div>
                          <span className="text-gray-600">Recipe: </span>
                          <span className="text-xs">{product.recipe.length} ingredients</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {getCurrentProducts().length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No products available in {getProductionTitle().toLowerCase()} category</p>
                    <p className="text-sm text-gray-400 mt-2">Add products to get started</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
