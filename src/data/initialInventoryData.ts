
import { RawMaterial, Product } from '@/types';

export const initialRawMaterials: RawMaterial[] = [
  {
    id: '1',
    name: 'Maida (Flour)',
    currentStock: 50,
    unit: 'kg',
    minStockLevel: 5,
    costPerUnit: 50,
    lastUpdated: new Date()
  },
  {
    id: '2',
    name: 'Rice Flour',
    currentStock: 25,
    unit: 'kg',
    minStockLevel: 3,
    costPerUnit: 80,
    lastUpdated: new Date()
  },
  {
    id: '3',
    name: 'Sugar',
    currentStock: 40,
    unit: 'kg',
    minStockLevel: 5,
    costPerUnit: 60,
    lastUpdated: new Date()
  },
  {
    id: '4',
    name: 'Ghee',
    currentStock: 8,
    unit: 'kg',
    minStockLevel: 1,
    costPerUnit: 800,
    lastUpdated: new Date()
  },
  {
    id: '5',
    name: 'Cardamom Powder',
    currentStock: 0.5,
    unit: 'kg',
    minStockLevel: 0.1,
    costPerUnit: 2500,
    lastUpdated: new Date()
  },
  {
    id: '6',
    name: 'Milk Powder',
    currentStock: 15,
    unit: 'kg',
    minStockLevel: 2,
    costPerUnit: 450,
    lastUpdated: new Date()
  },
  {
    id: '7',
    name: 'Cashews',
    currentStock: 3,
    unit: 'kg',
    minStockLevel: 0.5,
    costPerUnit: 1200,
    lastUpdated: new Date()
  },
  {
    id: '8',
    name: 'Almonds',
    currentStock: 2.5,
    unit: 'kg',
    minStockLevel: 0.4,
    costPerUnit: 1500,
    lastUpdated: new Date()
  },
  {
    id: '9',
    name: 'Pistachios',
    currentStock: 1.5,
    unit: 'kg',
    minStockLevel: 0.3,
    costPerUnit: 2000,
    lastUpdated: new Date()
  },
  {
    id: '10',
    name: 'Raisins',
    currentStock: 2,
    unit: 'kg',
    minStockLevel: 0.3,
    costPerUnit: 800,
    lastUpdated: new Date()
  }
];

export const initialProducts: Product[] = [
  {
    id: '1',
    name: 'Laddu (1kg)',
    recipe: [
      { materialId: '1', quantity: 0.2 },
      { materialId: '2', quantity: 0.3 },
      { materialId: '3', quantity: 0.4 },
      { materialId: '4', quantity: 0.08 },
      { materialId: '5', quantity: 0.02 }
    ],
    productionCost: 0,
    category: 'sweets'
  }
];
