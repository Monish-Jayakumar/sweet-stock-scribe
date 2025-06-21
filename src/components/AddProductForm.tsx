
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RawMaterial } from '@/types';
import { toast } from '@/hooks/use-toast';
import { Plus, Trash2 } from 'lucide-react';

interface AddProductFormProps {
  rawMaterials: RawMaterial[];
  onAddProduct: (productData: {
    name: string;
    recipe: { materialId: string; quantity: number }[];
    sellingPrice: number;
  }) => boolean;
  onCancel: () => void;
}

export const AddProductForm: React.FC<AddProductFormProps> = ({ rawMaterials, onAddProduct, onCancel }) => {
  const [productName, setProductName] = useState<string>('');
  const [sellingPrice, setSellingPrice] = useState<number>(0);
  const [recipe, setRecipe] = useState<{ materialId: string; quantity: number }[]>([
    { materialId: '', quantity: 0 }
  ]);

  const addRecipeItem = () => {
    setRecipe([...recipe, { materialId: '', quantity: 0 }]);
  };

  const removeRecipeItem = (index: number) => {
    setRecipe(recipe.filter((_, i) => i !== index));
  };

  const updateRecipeItem = (index: number, field: 'materialId' | 'quantity', value: string | number) => {
    const updatedRecipe = recipe.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    );
    setRecipe(updatedRecipe);
  };

  const handleAddProduct = () => {
    if (!productName.trim()) {
      toast({
        title: "Invalid Input",
        description: "Product name is required",
        variant: "destructive"
      });
      return;
    }

    if (sellingPrice <= 0) {
      toast({
        title: "Invalid Input",
        description: "Selling price must be greater than 0",
        variant: "destructive"
      });
      return;
    }

    const validRecipe = recipe.filter(item => item.materialId && item.quantity > 0);
    if (validRecipe.length === 0) {
      toast({
        title: "Invalid Input",
        description: "At least one recipe ingredient is required",
        variant: "destructive"
      });
      return;
    }

    const success = onAddProduct({
      name: productName,
      recipe: validRecipe,
      sellingPrice
    });

    if (success) {
      setProductName('');
      setSellingPrice(0);
      setRecipe([{ materialId: '', quantity: 0 }]);
    }
  };

  return (
    <div className="bg-blue-50 p-4 rounded-lg space-y-4">
      <h4 className="font-medium text-blue-800">Add New Product</h4>
      
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium mb-1">Product Name</label>
          <Input 
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            placeholder="Enter product name"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Selling Price (₹)</label>
          <Input 
            type="number" 
            step="0.01"
            min="0"
            value={sellingPrice || ''}
            onChange={(e) => setSellingPrice(parseFloat(e.target.value) || 0)}
            placeholder="0.00"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Recipe</label>
        <div className="space-y-2">
          {recipe.map((item, index) => (
            <div key={index} className="flex gap-2 items-center">
              <select 
                className="flex-1 p-2 border border-gray-300 rounded-md text-sm"
                value={item.materialId}
                onChange={(e) => updateRecipeItem(index, 'materialId', e.target.value)}
              >
                <option value="">Select material...</option>
                {rawMaterials.map(material => (
                  <option key={material.id} value={material.id}>
                    {material.name} ({material.unit})
                  </option>
                ))}
              </select>
              
              <Input 
                type="number" 
                step="0.01"
                min="0"
                className="w-24"
                value={item.quantity || ''}
                onChange={(e) => updateRecipeItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                placeholder="Qty"
              />
              
              {recipe.length > 1 && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => removeRecipeItem(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={addRecipeItem}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Ingredient
          </Button>
        </div>
      </div>

      <div className="flex gap-2">
        <Button onClick={handleAddProduct} size="sm" className="flex-1">
          Add Product
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
