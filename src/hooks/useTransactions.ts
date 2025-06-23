
import { useState } from 'react';
import { StockTransaction } from '@/types';

export const useTransactions = () => {
  const [transactions, setTransactions] = useState<StockTransaction[]>([]);

  const addTransaction = (transaction: Omit<StockTransaction, 'id' | 'timestamp'>) => {
    const newTransaction: StockTransaction = {
      ...transaction,
      id: Date.now().toString(),
      timestamp: new Date()
    };

    setTransactions(prev => [newTransaction, ...prev]);
    return newTransaction;
  };

  const addStockTransaction = (materialId: string, quantity: number, purchasePrice?: number, notes?: string) => {
    return addTransaction({
      type: 'purchase',
      materialId,
      quantity,
      purchasePrice,
      notes,
      userId: 'current-user'
    });
  };

  const addProductionTransaction = (materialId: string, productId: string, quantity: number, productName: string) => {
    return addTransaction({
      type: 'production',
      materialId,
      productId,
      quantity: -quantity,
      notes: `Used for ${productName} production`,
      userId: 'current-user'
    });
  };

  const addAdjustmentTransaction = (materialId: string, quantity: number, reason: string) => {
    return addTransaction({
      type: 'adjustment',
      materialId,
      quantity,
      notes: reason,
      userId: 'current-user'
    });
  };

  return {
    transactions,
    setTransactions,
    addTransaction,
    addStockTransaction,
    addProductionTransaction,
    addAdjustmentTransaction
  };
};
