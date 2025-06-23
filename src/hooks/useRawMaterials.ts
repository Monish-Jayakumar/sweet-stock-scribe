import { useState } from 'react';
import { RawMaterial } from '@/types';
import { initialRawMaterials } from '@/data/initialInventoryData';
import { toast } from '@/hooks/use-toast';

export const useRawMaterials = () => {
  const [rawMaterials, setRawMaterials] = useState<RawMaterial[]>(initialRawMaterials);

  const addStock = (materialId: string, quantity: number, purchasePrice?: number, notes?: string) => {
    setRawMaterials(prev => prev.map(material => {
      if (material.id === materialId) {
        let newCostPerUnit = material.costPerUnit;
        
        // Calculate weighted average cost if purchase price is provided
        if (purchasePrice && purchasePrice > 0) {
          const currentValue = material.currentStock * material.costPerUnit;
          const newValue = quantity * purchasePrice;
          const totalStock = material.currentStock + quantity;
          newCostPerUnit = totalStock > 0 ? (currentValue + newValue) / totalStock : purchasePrice;
        }

        return {
          ...material,
          currentStock: material.currentStock + quantity,
          costPerUnit: newCostPerUnit,
          lastUpdated: new Date()
        };
      }
      return material;
    }));

    const material = rawMaterials.find(m => m.id === materialId);
    const costInfo = purchasePrice && purchasePrice > 0 
      ? ` at ₹${purchasePrice}/${material?.unit} (new avg: ₹${((material?.currentStock || 0) * (material?.costPerUnit || 0) + quantity * purchasePrice) / ((material?.currentStock || 0) + quantity)})`
      : '';

    toast({
      title: "Stock Added",
      description: `${quantity} units added to inventory${costInfo}`,
    });
  };

  const addNewMaterial = (materialData: {
    name: string;
    unit: string;
    costPerUnit: number;
    minStockLevel: number;
    currentStock: number;
  }): boolean => {
    const existingMaterial = rawMaterials.find(m => 
      m.name.toLowerCase() === materialData.name.toLowerCase()
    );
    
    if (existingMaterial) {
      toast({
        title: "Material Already Exists",
        description: `${materialData.name} is already in the inventory`,
        variant: "destructive"
      });
      return false;
    }

    const newMaterial: RawMaterial = {
      id: (Date.now()).toString(),
      name: materialData.name,
      currentStock: materialData.currentStock,
      unit: materialData.unit,
      minStockLevel: materialData.minStockLevel,
      costPerUnit: materialData.costPerUnit,
      lastUpdated: new Date()
    };

    setRawMaterials(prev => [...prev, newMaterial]);

    toast({
      title: "Material Added",
      description: `${materialData.name} has been added to inventory`,
    });

    return true;
  };

  const renameMaterial = (materialId: string, newName: string): boolean => {
    const existingMaterial = rawMaterials.find(m => 
      m.name.toLowerCase() === newName.toLowerCase() && m.id !== materialId
    );
    
    if (existingMaterial) {
      toast({
        title: "Name Already Exists",
        description: `A material with name "${newName}" already exists`,
        variant: "destructive"
      });
      return false;
    }

    setRawMaterials(prev => prev.map(material => {
      if (material.id === materialId) {
        return {
          ...material,
          name: newName,
          lastUpdated: new Date()
        };
      }
      return material;
    }));

    toast({
      title: "Material Renamed",
      description: `Material renamed to "${newName}"`,
    });

    return true;
  };

  const deleteMaterial = (materialId: string): boolean => {
    const material = rawMaterials.find(m => m.id === materialId);
    if (!material) return false;

    setRawMaterials(prev => prev.filter(m => m.id !== materialId));

    toast({
      title: "Material Deleted",
      description: `${material.name} has been removed from inventory`,
    });

    return true;
  };

  const updateMaterialStock = (materialId: string, newStock: number) => {
    setRawMaterials(prev => prev.map(material => {
      if (material.id === materialId) {
        return {
          ...material,
          currentStock: newStock,
          lastUpdated: new Date()
        };
      }
      return material;
    }));
  };

  const updateMaterialCost = (materialId: string, newCost: number) => {
    setRawMaterials(prev => prev.map(material => {
      if (material.id === materialId) {
        return {
          ...material,
          costPerUnit: newCost,
          lastUpdated: new Date()
        };
      }
      return material;
    }));

    toast({
      title: "Cost Updated",
      description: "Material cost has been updated",
    });
  };

  return {
    rawMaterials,
    setRawMaterials,
    addStock,
    addNewMaterial,
    updateMaterialStock,
    updateMaterialCost,
    renameMaterial,
    deleteMaterial
  };
};
