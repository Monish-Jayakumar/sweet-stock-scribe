
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useInventory } from '@/hooks/useInventory';
import { Package, Plus, AlertCircle, CheckCircle, Edit, Trash2 } from 'lucide-react';
import { AddProductForm } from './AddProductForm';

export const ProductionPage = () => {
  const { products, rawMaterials, checkStockAvailability, produceProduct, productionLogs, addNewProduct, renameProduct, deleteProduct } = useInventory();
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [notes, setNotes] = useState<string>('');
  const [showAddProduct, setShowAddProduct] = useState<boolean>(false);
  const [editingName, setEditingName] = useState<string>('');
  const [newName, setNewName] = useState<string>('');

  const handleProduction = () => {
    if (!selectedProduct || quantity <= 0) return;
    
    const success = produceProduct(selectedProduct, quantity, notes);
    if (success) {
      setQuantity(1);
      setNotes('');
    }
  };

  const getProductAvailability = (productId: string) => {
    return checkStockAvailability(productId, quantity);
  };

  const handleProductSelection = (value: string) => {
    if (value === 'add_new') {
      setShowAddProduct(true);
      setSelectedProduct('');
    } else {
      setSelectedProduct(value);
      setShowAddProduct(false);
    }
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

  const handleRenameProduct = (productId: string) => {
    if (!newName.trim()) {
      return;
    }
    
    const success = renameProduct(productId, newName.trim());
    if (success) {
      setEditingName('');
      setNewName('');
    }
  };

  const handleDeleteProduct = (productId: string) => {
    if (window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      deleteProduct(productId);
    }
  };

  const todayProduction = productionLogs.filter(log => 
    new Date(log.timestamp).toDateString() === new Date().toDateString()
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Production Center</h1>
        <Badge variant="outline" className="text-lg px-3 py-1">
          Today: {todayProduction.length} products
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Production Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Plus className="mr-2 h-5 w-5" />
              Log Production
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Select Product</label>
              <select 
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={selectedProduct}
                onChange={(e) => handleProductSelection(e.target.value)}
              >
                <option value="">Choose a product...</option>
                {products.map(product => (
                  <option key={product.id} value={product.id}>
                    {product.name}
                  </option>
                ))}
                <option value="add_new" className="font-medium text-blue-600">
                  + Add New Product
                </option>
              </select>
            </div>

            {showAddProduct && (
              <AddProductForm
                rawMaterials={rawMaterials}
                onAddProduct={handleAddNewProduct}
                onCancel={() => setShowAddProduct(false)}
              />
            )}

            {!showAddProduct && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-2">Quantity</label>
                  <Input 
                    type="number" 
                    min="1" 
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                    placeholder="Enter quantity"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Notes (Optional)</label>
                  <Textarea 
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Any production notes..."
                    rows={3}
                  />
                </div>

                {selectedProduct && (
                  <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium mb-2">Stock Check</h4>
                      {(() => {
                        const { canProduce, shortages } = getProductAvailability(selectedProduct);
                        return canProduce ? (
                          <div className="flex items-center text-green-600">
                            <CheckCircle className="mr-2 h-4 w-4" />
                            <span>All ingredients available</span>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <div className="flex items-center text-red-600">
                              <AlertCircle className="mr-2 h-4 w-4" />
                              <span>Insufficient ingredients</span>
                            </div>
                            {shortages.map((shortage, index) => (
                              <p key={index} className="text-sm text-red-600 ml-6">
                                {shortage.materialName}: Need {shortage.required}
                                {rawMaterials.find(m => m.name === shortage.materialName)?.unit}, 
                                Have {shortage.available}
                                {rawMaterials.find(m => m.name === shortage.materialName)?.unit}
                              </p>
                            ))}
                          </div>
                        );
                      })()}
                    </div>

                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-medium mb-2">Recipe Requirements</h4>
                      {(() => {
                        const product = products.find(p => p.id === selectedProduct);
                        return product?.recipe.map(ingredient => {
                          const material = rawMaterials.find(m => m.id === ingredient.materialId);
                          const totalRequired = ingredient.quantity * quantity;
                          return (
                            <div key={ingredient.materialId} className="flex justify-between text-sm">
                              <span>{material?.name}</span>
                              <span>{totalRequired}{material?.unit}</span>
                            </div>
                          );
                        });
                      })()}
                    </div>
                  </div>
                )}

                <Button 
                  onClick={handleProduction}
                  disabled={!selectedProduct || quantity <= 0 || !getProductAvailability(selectedProduct).canProduce}
                  className="w-full"
                >
                  Log Production
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        {/* Recent Production */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Package className="mr-2 h-5 w-5" />
              Recent Production
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {productionLogs.length > 0 ? (
                productionLogs.slice(0, 10).map((log) => {
                  const product = products.find(p => p.id === log.productId);
                  return (
                    <div key={log.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{product?.name || 'Unknown Product'}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(log.timestamp).toLocaleString()}
                        </p>
                        {log.notes && (
                          <p className="text-xs text-gray-500 mt-1">{log.notes}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">
                          {log.quantityProduced} units
                        </p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-gray-500 text-center py-8">No production logged yet</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Products Overview with rename/delete options */}
      <Card>
        <CardHeader>
          <CardTitle>Available Products</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map(product => (
              <div key={product.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  {editingName === product.id ? (
                    <div className="flex gap-1 flex-1">
                      <Input 
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
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
                      <h3 className="font-semibold text-lg">{product.name}</h3>
                      <div className="flex gap-1">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            setEditingName(product.id);
                            setNewName(product.name);
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
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full mt-3"
                  onClick={() => setSelectedProduct(product.id)}
                >
                  Select for Production
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
