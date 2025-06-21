
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { validateMaterialData } from '@/utils/inventoryUtils';

interface AddMaterialFormProps {
  onAddMaterial: (materialData: {
    name: string;
    unit: string;
    costPerUnit: number;
    minStockLevel: number;
    currentStock: number;
  }) => boolean;
  onCancel: () => void;
}

export const AddMaterialForm: React.FC<AddMaterialFormProps> = ({ onAddMaterial, onCancel }) => {
  const [newMaterialName, setNewMaterialName] = useState<string>('');
  const [newMaterialUnit, setNewMaterialUnit] = useState<string>('kg');
  const [newMaterialCostPerUnit, setNewMaterialCostPerUnit] = useState<number>(0);
  const [newMaterialMinStock, setNewMaterialMinStock] = useState<number>(0);
  const [newMaterialCurrentStock, setNewMaterialCurrentStock] = useState<number>(0);

  const handleAddNewMaterial = () => {
    const materialData = {
      name: newMaterialName.trim(),
      unit: newMaterialUnit,
      costPerUnit: newMaterialCostPerUnit,
      minStockLevel: newMaterialMinStock,
      currentStock: newMaterialCurrentStock
    };

    const validationError = validateMaterialData(materialData);
    if (validationError) {
      toast({
        title: "Invalid Input",
        description: validationError,
        variant: "destructive"
      });
      return;
    }

    const success = onAddMaterial(materialData);

    if (success) {
      setNewMaterialName('');
      setNewMaterialUnit('kg');
      setNewMaterialCostPerUnit(0);
      setNewMaterialMinStock(0);
      setNewMaterialCurrentStock(0);
    }
  };

  return (
    <div className="bg-blue-50 p-4 rounded-lg space-y-3">
      <h4 className="font-medium text-blue-800">Add New Material</h4>
      
      <div>
        <label className="block text-sm font-medium mb-1">Material Name</label>
        <Input 
          value={newMaterialName}
          onChange={(e) => setNewMaterialName(e.target.value)}
          placeholder="Enter material name"
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-sm font-medium mb-1">Unit</label>
          <select 
            className="w-full p-2 border border-gray-300 rounded-md text-sm"
            value={newMaterialUnit}
            onChange={(e) => setNewMaterialUnit(e.target.value)}
          >
            <option value="kg">Kilograms (kg)</option>
            <option value="ml">Milliliters (ml)</option>
            <option value="l">Liters (l)</option>
            <option value="pieces">Pieces</option>
            <option value="sheets">Sheets</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Cost/Unit (₹)</label>
          <Input 
            type="number" 
            step="0.01"
            min="0"
            value={newMaterialCostPerUnit || ''}
            onChange={(e) => setNewMaterialCostPerUnit(parseFloat(e.target.value) || 0)}
            placeholder="0.00"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-sm font-medium mb-1">Current Stock</label>
          <Input 
            type="number" 
            step="0.01"
            min="0"
            value={newMaterialCurrentStock || ''}
            onChange={(e) => setNewMaterialCurrentStock(parseFloat(e.target.value) || 0)}
            placeholder="0"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Minimum Stock Level</label>
          <Input 
            type="number" 
            step="0.01"
            min="0"
            value={newMaterialMinStock || ''}
            onChange={(e) => setNewMaterialMinStock(parseFloat(e.target.value) || 0)}
            placeholder="Enter minimum stock"
          />
        </div>
      </div>

      <div className="flex gap-2">
        <Button onClick={handleAddNewMaterial} size="sm" className="flex-1">
          Add Material
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onCancel}
          className="flex-1"
        >
          Cancel
        </Button>
      </div>
    </div>
  );
};
