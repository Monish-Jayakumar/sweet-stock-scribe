import React, { createContext, useContext, ReactNode } from 'react';
import { useRawMaterials } from '@/hooks/useRawMaterials';
import { useProduction } from '@/hooks/useProduction';
import { useTransactions } from '@/hooks/useTransactions';
import { RawMaterial, Product, StockTransaction, ProductionLog } from '@/types';
import { getStockStatus, getLowStockItems } from '@/utils/inventoryUtils';

interface InventoryContextType {
  rawMaterials: RawMaterial[];
  products: Product[];
  transactions: StockTransaction[];
  productionLogs: ProductionLog[];
  checkStockAvailability: (productId: string, quantity?: number) => { canProduce: boolean; shortages: any[] };
  produceProduct: (productId: string, quantity?: number, notes?: string) => boolean;
  addStock: (materialId: string, quantity: number, purchasePrice?: number, notes?: string) => void;
  adjustStock: (materialId: string, newStock: number, reason: string) => void;
  addNewMaterial: (materialData: any) => boolean;
  addNewProduct: (productData: any) => boolean;
  updateMaterialCost: (materialId: string, newCost: number) => void;
  renameMaterial: (materialId: string, newName: string) => boolean;
  deleteMaterial: (materialId: string) => boolean;
  renameProduct: (productId: string, newName: string) => boolean;
  deleteProduct: (productId: string) => boolean;
  getLowStockItems: () => RawMaterial[];
  getStockStatus: (material: RawMaterial) => string;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export const InventoryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { rawMaterials, setRawMaterials, addStock: addStockToMaterial, addNewMaterial, updateMaterialStock, updateMaterialCost, renameMaterial, deleteMaterial } = useRawMaterials();
  const { addStockTransaction, addProductionTransaction, addAdjustmentTransaction, transactions, setTransactions } = useTransactions();
  const { products, setProducts, productionLogs, setProductionLogs, checkStockAvailability, produceProduct: produceProductBase, addNewProduct, renameProduct, deleteProduct } = useProduction(rawMaterials, updateMaterialStock);

  const addStock = (materialId: string, quantity: number, purchasePrice?: number, notes?: string) => {
    console.log('Adding stock:', materialId, quantity, purchasePrice, notes);
    addStockToMaterial(materialId, quantity, purchasePrice, notes);
    addStockTransaction(materialId, quantity, purchasePrice, notes);
  };

  const adjustStock = (materialId: string, newStock: number, reason: string) => {
    const material = rawMaterials.find(m => m.id === materialId);
    if (!material) return;

    const difference = newStock - material.currentStock;
    updateMaterialStock(materialId, newStock);
    addAdjustmentTransaction(materialId, difference, reason);
  };

  const produceProduct = (productId: string, quantity: number = 1, notes?: string): boolean => {
    const product = products.find(p => p.id === productId);
    if (!product) return false;

    const success = produceProductBase(productId, quantity, notes);
    
    if (success) {
      // Log transactions for each material used
      product.recipe.forEach(ingredient => {
        addProductionTransaction(
          ingredient.materialId, 
          productId, 
          ingredient.quantity * quantity, 
          product.name
        );
      });
    }

    return success;
  };

  const contextValue: InventoryContextType = {
    rawMaterials,
    products,
    transactions,
    productionLogs,
    checkStockAvailability,
    produceProduct,
    addStock,
    adjustStock,
    addNewMaterial,
    addNewProduct,
    updateMaterialCost,
    renameMaterial,
    deleteMaterial,
    renameProduct,
    deleteProduct,
    getLowStockItems: () => getLowStockItems(rawMaterials),
    getStockStatus
  };

  return (
    <InventoryContext.Provider value={contextValue}>
      {children}
    </InventoryContext.Provider>
  );
};

export const useInventoryContext = () => {
  const context = useContext(InventoryContext);
  if (context === undefined) {
    throw new Error('useInventoryContext must be used within an InventoryProvider');
  }
  return context;
};
