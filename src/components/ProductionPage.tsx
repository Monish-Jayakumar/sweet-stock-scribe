
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useInventory } from '@/hooks/useInventory';
import { Package, CheckCircle, AlertCircle } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export const ProductionPage = () => {
  const { products, checkStockAvailability, produceProduct, productionLogs } = useInventory();
  const [sweetQuantities, setSweetQuantities] = useState<{ [key: string]: number }>({});
  const [savouriesQuantities, setSavouriesQuantities] = useState<{ [key: string]: number }>({});
  const [bakeryQuantities, setBakeryQuantities] = useState<{ [key: string]: number }>({});

  // Categorize products by type (you can modify this logic based on your needs)
  const sweets = products.filter(p => p.name.toLowerCase().includes('sweet') || p.name.toLowerCase().includes('candy') || p.name.toLowerCase().includes('dessert'));
  const savouries = products.filter(p => p.name.toLowerCase().includes('snack') || p.name.toLowerCase().includes('chip') || p.name.toLowerCase().includes('namkeen'));
  const bakery = products.filter(p => p.name.toLowerCase().includes('bread') || p.name.toLowerCase().includes('cake') || p.name.toLowerCase().includes('biscuit'));
  
  // If products don't match specific keywords, show them in all categories for now
  const allProducts = products.length > 0 ? products : [];
  const displaySweets = sweets.length > 0 ? sweets : allProducts;
  const displaySavouries = savouries.length > 0 ? savouries : allProducts;
  const displayBakery = bakery.length > 0 ? bakery : allProducts;

  const handleQuantityChange = (productId: string, quantity: number, category: 'sweets' | 'savouries' | 'bakery') => {
    const value = quantity || 0;
    if (category === 'sweets') {
      setSweetQuantities(prev => ({ ...prev, [productId]: value }));
    } else if (category === 'savouries') {
      setSavouriesQuantities(prev => ({ ...prev, [productId]: value }));
    } else if (category === 'bakery') {
      setBakeryQuantities(prev => ({ ...prev, [productId]: value }));
    }
  };

  const handleSubmitProduction = (category: 'sweets' | 'savouries' | 'bakery') => {
    let quantities: { [key: string]: number };
    let categoryName: string;
    
    if (category === 'sweets') {
      quantities = sweetQuantities;
      categoryName = 'Sweets';
    } else if (category === 'savouries') {
      quantities = savouriesQuantities;
      categoryName = 'Savouries';
    } else {
      quantities = bakeryQuantities;
      categoryName = 'Bakery';
    }

    let hasProduction = false;
    let successCount = 0;
    let failureCount = 0;

    Object.entries(quantities).forEach(([productId, quantity]) => {
      if (quantity > 0) {
        hasProduction = true;
        const success = produceProduct(productId, quantity, `${categoryName} production batch`);
        if (success) {
          successCount++;
        } else {
          failureCount++;
        }
      }
    });

    if (!hasProduction) {
      return;
    }

    // Clear quantities after submission
    if (category === 'sweets') {
      setSweetQuantities({});
    } else if (category === 'savouries') {
      setSavouriesQuantities({});
    } else {
      setBakeryQuantities({});
    }
  };

  const getProductAvailability = (productId: string, quantity: number) => {
    return checkStockAvailability(productId, quantity);
  };

  const renderProductionTable = (
    productList: any[], 
    quantities: { [key: string]: number }, 
    category: 'sweets' | 'savouries' | 'bakery',
    title: string
  ) => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Package className="mr-2 h-5 w-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {productList.length > 0 ? (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product Name</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Stock Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {productList.map((product) => {
                  const quantity = quantities[product.id] || 0;
                  const { canProduce } = quantity > 0 ? getProductAvailability(product.id, quantity) : { canProduce: true };
                  
                  return (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min="0"
                          value={quantities[product.id] || ''}
                          onChange={(e) => handleQuantityChange(product.id, parseInt(e.target.value) || 0, category)}
                          className="w-24"
                          placeholder="0"
                        />
                      </TableCell>
                      <TableCell>
                        {quantity > 0 ? (
                          canProduce ? (
                            <div className="flex items-center text-green-600">
                              <CheckCircle className="mr-1 h-4 w-4" />
                              <span className="text-sm">Available</span>
                            </div>
                          ) : (
                            <div className="flex items-center text-red-600">
                              <AlertCircle className="mr-1 h-4 w-4" />
                              <span className="text-sm">Insufficient</span>
                            </div>
                          )
                        ) : (
                          <span className="text-gray-400 text-sm">-</span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            <div className="mt-4 flex justify-end">
              <Button 
                onClick={() => handleSubmitProduction(category)}
                disabled={Object.values(quantities).every(q => (q || 0) <= 0)}
              >
                Submit {title} Production
              </Button>
            </div>
          </>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">No products available in {title.toLowerCase()} category</p>
            <p className="text-sm text-gray-400 mt-2">Add products in Settings to get started</p>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const todayProduction = productionLogs.filter(log => 
    new Date(log.timestamp).toDateString() === new Date().toDateString()
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Production Center</h1>
        <Badge variant="outline" className="text-lg px-3 py-1">
          Today: {todayProduction.length} batches
        </Badge>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Sweets Production */}
        {renderProductionTable(displaySweets, sweetQuantities, 'sweets', 'Sweets Production')}

        {/* Savouries Production */}
        {renderProductionTable(displaySavouries, savouriesQuantities, 'savouries', 'Savouries Production')}

        {/* Bakery Production */}
        {renderProductionTable(displayBakery, bakeryQuantities, 'bakery', 'Bakery Production')}
      </div>

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
  );
};
