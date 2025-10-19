"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, X } from "lucide-react";
import { toast } from "sonner";

interface Product {
  _id: string;
  name: string;
  slug: string;
  price: number;
  images: string[];
}

interface ProductPickerProps {
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}

export default function ProductPicker({
  selectedIds,
  onChange,
}: ProductPickerProps) {
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);

  // Fetch selected products details on mount
  useEffect(() => {
    if (selectedIds.length > 0) {
      fetchProductsByIds(selectedIds);
    }
  }, []);

  const fetchProductsByIds = async (ids: string[]) => {
    try {
      const response = await fetch(
        `/api/products?ids=${ids.join(",")}&limit=100`
      );
      const data = await response.json();
      if (response.ok && data.data) {
        setSelectedProducts(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch selected products:", error);
    }
  };

  const searchProducts = async () => {
    if (!search.trim()) return;

    setLoading(true);
    try {
      const response = await fetch(
        `/api/products?search=${encodeURIComponent(search)}&limit=20`
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      setProducts(data.data || []);
    } catch (error: any) {
      toast.error(error.message || "Failed to search products");
    } finally {
      setLoading(false);
    }
  };

  const toggleProduct = (product: Product) => {
    const isSelected = selectedIds.includes(product._id);

    if (isSelected) {
      // Remove
      const newIds = selectedIds.filter((id) => id !== product._id);
      const newProducts = selectedProducts.filter((p) => p._id !== product._id);
      onChange(newIds);
      setSelectedProducts(newProducts);
    } else {
      // Add
      const newIds = [...selectedIds, product._id];
      const newProducts = [...selectedProducts, product];
      onChange(newIds);
      setSelectedProducts(newProducts);
    }
  };

  const removeProduct = (id: string) => {
    const newIds = selectedIds.filter((i) => i !== id);
    const newProducts = selectedProducts.filter((p) => p._id !== id);
    onChange(newIds);
    setSelectedProducts(newProducts);
  };

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="flex gap-2">
        <Input
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && searchProducts()}
        />
        <Button type="button" onClick={searchProducts} disabled={loading}>
          <Search className="w-4 h-4" />
        </Button>
      </div>

      {/* Search Results */}
      {products.length > 0 && (
        <div className="border rounded-lg p-4 space-y-2 max-h-64 overflow-y-auto">
          <p className="text-sm font-medium mb-2">Search Results</p>
          {products.map((product) => {
            const isSelected = selectedIds.includes(product._id);
            return (
              <div
                key={product._id}
                className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer"
                onClick={() => toggleProduct(product)}
              >
                <Checkbox checked={isSelected} />
                {product.images[0] && (
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-12 h-12 object-cover rounded"
                  />
                )}
                <div className="flex-1">
                  <p className="text-sm font-medium">{product.name}</p>
                  <p className="text-xs text-gray-500">{product.price} ETB</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Selected Products */}
      {selectedProducts.length > 0 && (
        <div className="border rounded-lg p-4 space-y-2">
          <p className="text-sm font-medium mb-2">
            Selected Products ({selectedProducts.length})
          </p>
          {selectedProducts.map((product) => (
            <div
              key={product._id}
              className="flex items-center gap-3 p-2 bg-purple-50 rounded"
            >
              {product.images[0] && (
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-12 h-12 object-cover rounded"
                />
              )}
              <div className="flex-1">
                <p className="text-sm font-medium">{product.name}</p>
                <p className="text-xs text-gray-500">{product.price} ETB</p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeProduct(product._id)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


