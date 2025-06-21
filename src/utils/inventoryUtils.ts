
import { RawMaterial } from '@/types';

export const getStockStatus = (material: RawMaterial): 'good' | 'warning' | 'critical' => {
  const ratio = material.currentStock / material.minStockLevel;
  if (ratio <= 1) return 'critical';
  if (ratio <= 2) return 'warning';
  return 'good';
};

export const getLowStockItems = (rawMaterials: RawMaterial[]) => {
  return rawMaterials.filter(material => material.currentStock <= material.minStockLevel);
};

export const calculateTotalInventoryValue = (rawMaterials: RawMaterial[]) => {
  return rawMaterials.reduce((sum, material) => sum + (material.currentStock * material.costPerUnit), 0);
};

export const validateMaterialData = (materialData: {
  name: string;
  unit: string;
  costPerUnit: number;
  minStockLevel: number;
  currentStock: number;
}) => {
  if (!materialData.name.trim()) return 'Material name is required';
  if (materialData.costPerUnit <= 0) return 'Cost per unit must be greater than 0';
  if (materialData.minStockLevel <= 0) return 'Minimum stock level must be greater than 0';
  if (materialData.currentStock < 0) return 'Current stock cannot be negative';
  return null;
};
