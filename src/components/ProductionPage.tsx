
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useInventory } from '@/hooks/useInventory';
import { Package, CheckCircle, AlertCircle, Candy, Coffee, Cake } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface ProductionPageProps {
  activeSection?: 'sweets' | 'savouries' | 'bakery';
}

export const ProductionPage = ({ activeSection = 'sweets' }: ProductionPageProps) => {
  const { products, checkStockAvailability, produceProduct, productionLogs } = useInventory();
  const [quantities, setQuantities] = useState<{ [key: string]: number }>({});

  // Filter products by category
  const sweetProducts = products.filter(p => p.category === 'sweets');
  const savouryProducts = products.filter(p => p.category === 'savouries');
  const bakeryProducts = products.filter(p => p.category === 'bakery');

  const getCurrentProducts = () => {
    switch (activeSection) {
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

  const getSectionTitle = () => {
    switch (activeSection) {
      case 'sweets':
        return 'Sweets Production';
      case 'savouries':
        return 'Savouries Production';
      case 'bakery':
        return 'Bakery Production';
      default:
        return 'Sweets Production';
    }
  };

  const getSectionIcon = () => {
    switch (activeSection) {
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

  const handleQuantityChange = (productId: string, quantity: number) => {
    const value = quantity || 0;
    setQuantities(prev => ({ ...prev, [productId]: value }));
  };

  const handleSubmitProduction = () => {
    let hasProduction = false;
    let successCount = 0;
    let failureCount = 0;

    Object.entries(quantities).forEach(([productId, quantity]) => {
      if (quantity > 0) {
        hasProduction = true;
        const success = produceProduct(productId, quantity, `${getSectionTitle()} batch`);
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
    setQuantities({});
  };

  const getProductAvailability = (productId: string, quantity: number) => {
    return checkStockAvailability(productId, quantity);
  };

  const currentProducts = getCurrentProducts();
  const SectionIcon = getSectionIcon();

  const todayProduction = productionLogs.filter(log => 
    new Date(log.timestamp).toDateString() === new Date().toDateString()
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">{getSectionTitle()}</h1>
        <Badge variant="outline" className="text-lg px-3 py-1">
          Today: {todayProduction.length} batches
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <SectionIcon className="mr-2 h-5 w-5" />
            {getSectionTitle()}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {currentProducts.length > 0 ? (
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
                  {currentProducts.map((product) => {
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
                            onChange={(e) => handleQuantityChange(product.id, parseInt(e.target.value) || 0)}
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
                  onClick={handleSubmitProduction}
                  disabled={Object.values(quantities).every(q => (q || 0) <= 0)}
                >
                  Submit {getSectionTitle()}
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No products available in {activeSection} category</p>
              <p className="text-sm text-gray-400 mt-2">Add products in Settings to get started</p>
            </div>
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
  );
};
