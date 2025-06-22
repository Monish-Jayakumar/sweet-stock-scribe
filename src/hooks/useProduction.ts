
import { useState } from 'react';
import { Product, ProductionLog, RawMaterial } from '@/types';
import { initialProducts } from '@/data/initialInventoryData';
import { toast } from '@/hooks/use-toast';

export const useProduction = (
  rawMaterials: RawMaterial[],
  updateMaterialStock: (materialId: string, newStock: number) => void
) => {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [productionLogs, setProductionLogs] = useState<ProductionLog[]>([]);

  const checkStockAvailability = (productId: string, quantity: number = 1) => {
    const product = products.find(p => p.id === productId);
    if (!product) return { canProduce: false, shortages: [] };

    const shortages: { materialName: string; required: number; available: number }[] = [];
    
    for (const ingredient of product.recipe) {
      const material = rawMaterials.find(m => m.id === ingredient.materialId);
      if (!material) continue;
      
      const required = ingredient.quantity * quantity;
      if (material.currentStock < required) {
        shortages.push({
          materialName: material.name,
          required,
          available: material.currentStock
        });
      }
    }

    return { canProduce: shortages.length === 0, shortages };
  };

  const produceProduct = (productId: string, quantity: number = 1, notes?: string): boolean => {
    const { canProduce, shortages } = checkStockAvailability(productId, quantity);
    
    if (!canProduce) {
      toast({
        title: "Insufficient Stock",
        description: `Cannot produce. Shortages: ${shortages.map(s => `${s.materialName} (need ${s.required}${rawMaterials.find(m => m.name === s.materialName)?.unit}, have ${s.available}${rawMaterials.find(m => m.name === s.materialName)?.unit})`).join(', ')}`,
        variant: "destructive"
      });
      return false;
    }

    const product = products.find(p => p.id === productId);
    if (!product) return false;

    // Deduct materials
    product.recipe.forEach(ingredient => {
      const material = rawMaterials.find(m => m.id === ingredient.materialId);
      if (material) {
        const newStock = material.currentStock - (ingredient.quantity * quantity);
        updateMaterialStock(material.id, newStock);
      }
    });

    // Log production
    const productionLog: ProductionLog = {
      id: Date.now().toString(),
      productId,
      quantityProduced: quantity,
      timestamp: new Date(),
      userId: 'current-user',
      notes
    };
    setProductionLogs(prev => [productionLog, ...prev]);

    toast({
      title: "Production Successful",
      description: `${quantity} ${product.name} produced successfully!`,
    });

    return true;
  };

  const addNewProduct = (productData: {
    name: string;
    recipe: { materialId: string; quantity: number }[];
    category: 'sweets' | 'savouries' | 'bakery';
  }): boolean => {
    const existingProduct = products.find(p => 
      p.name.toLowerCase() === productData.name.toLowerCase()
    );
    
    if (existingProduct) {
      toast({
        title: "Product Already Exists",
        description: `${productData.name} is already in the product list`,
        variant: "destructive"
      });
      return false;
    }

    const newProduct: Product = {
      id: Date.now().toString(),
      name: productData.name,
      recipe: productData.recipe,
      productionCost: 0,
      category: productData.category
    };

    setProducts(prev => [...prev, newProduct]);

    toast({
      title: "Product Added",
      description: `${productData.name} has been added to ${productData.category}`,
    });

    return true;
  };

  const renameProduct = (productId: string, newName: string): boolean => {
    const existingProduct = products.find(p => 
      p.name.toLowerCase() === newName.toLowerCase() && p.id !== productId
    );
    
    if (existingProduct) {
      toast({
        title: "Name Already Exists",
        description: `A product with name "${newName}" already exists`,
        variant: "destructive"
      });
      return false;
    }

    setProducts(prev => prev.map(product => {
      if (product.id === productId) {
        return {
          ...product,
          name: newName
        };
      }
      return product;
    }));

    toast({
      title: "Product Renamed",
      description: `Product renamed to "${newName}"`,
    });

    return true;
  };

  const deleteProduct = (productId: string): boolean => {
    const product = products.find(p => p.id === productId);
    if (!product) return false;

    setProducts(prev => prev.filter(p => p.id !== productId));

    toast({
      title: "Product Deleted",
      description: `${product.name} has been removed from products`,
    });

    return true;
  };

  return {
    products,
    setProducts,
    productionLogs,
    setProductionLogs,
    checkStockAvailability,
    produceProduct,
    addNewProduct,
    renameProduct,
    deleteProduct
  };
};
