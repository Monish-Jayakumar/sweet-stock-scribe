
export interface RawMaterial {
  id: string;
  name: string;
  currentStock: number;
  unit: string;
  minStockLevel: number;
  costPerUnit: number;
  lastUpdated: Date;
}

export interface RecipeIngredient {
  materialId: string;
  quantity: number;
}

export interface Product {
  id: string;
  name: string;
  recipe: RecipeIngredient[];
  productionCost: number;
  category: 'sweets' | 'savouries' | 'bakery';
}

export interface StockTransaction {
  id: string;
  type: 'purchase' | 'production' | 'adjustment';
  materialId?: string;
  productId?: string;
  quantity: number;
  purchasePrice?: number; // New field for purchase transactions
  timestamp: Date;
  notes?: string;
  userId: string;
}

export interface ProductionLog {
  id: string;
  productId: string;
  quantityProduced: number;
  timestamp: Date;
  userId: string;
  notes?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'staff';
}
