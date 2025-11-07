"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { stripe } from "@/lib/stripe";

interface Product {
  id: string;
  name: string;
  images: string[];
}

interface Variant {
  size: string;
  color: string;
  stock: number;
  sku?: string;
}

interface InventoryItem {
  _id?: string;
  productId: string;
  productName: string;
  variants: Variant[];
}

const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];
const COLORS = [
  { name: "Negro", value: "black" },
  { name: "Blanco", value: "white" },
  { name: "Gris", value: "gray" },
  { name: "Azul", value: "blue" },
  { name: "Rojo", value: "red" },
];

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [editingInventory, setEditingInventory] = useState<InventoryItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Obtener productos de Stripe
      const productsRes = await fetch("/api/products");
      const productsData = await productsRes.json();
      setProducts(productsData.products || []);

      // Obtener inventario de MongoDB
      const inventoryRes = await fetch("/api/inventory");
      const inventoryData = await inventoryRes.json();
      setInventory(Array.isArray(inventoryData.inventory) ? inventoryData.inventory : []);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const getInventoryForProduct = (productId: string) => {
    return inventory.find((inv) => inv.productId === productId);
  };

  const initializeInventory = (product: Product) => {
    const variants: Variant[] = [];
    
    SIZES.forEach((size) => {
      COLORS.forEach((color) => {
        variants.push({
          size,
          color: color.value,
          stock: 0,
        });
      });
    });

    setEditingInventory({
      productId: product.id,
      productName: product.name,
      variants,
    });
  };

  const editInventory = (productId: string) => {
    const inv = getInventoryForProduct(productId);
    if (inv) {
      setEditingInventory({ ...inv });
    }
  };

  const updateVariantStock = (size: string, color: string, newStock: number) => {
    if (!editingInventory) return;

    const updatedVariants = editingInventory.variants.map((v) =>
      v.size === size && v.color === color ? { ...v, stock: newStock } : v
    );

    setEditingInventory({ ...editingInventory, variants: updatedVariants });
  };

  const saveInventory = async () => {
    if (!editingInventory) return;

    try {
      const res = await fetch("/api/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingInventory),
      });

      if (res.ok) {
        alert("Inventario guardado correctamente");
        fetchData();
        setEditingInventory(null);
      } else {
        alert("Error al guardar inventario");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error al guardar inventario");
    }
  };

  const setAllStock = (stock: number) => {
    if (!editingInventory) return;

    const updatedVariants = editingInventory.variants.map((v) => ({
      ...v,
      stock,
    }));

    setEditingInventory({ ...editingInventory, variants: updatedVariants });
  };

  if (loading) {
    return <p className="text-center">Cargando inventario...</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Gestión de Inventario</h1>
        <p className="text-gray-600 mt-2">
          Administra el stock de cada producto por talla y color
        </p>
      </div>

      {editingInventory ? (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Editando: {editingInventory.productName}</CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setEditingInventory(null)}
                >
                  Cancelar
                </Button>
                <Button onClick={saveInventory}>Guardar</Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-2 items-center">
                <span className="text-sm font-medium">Acciones rápidas:</span>
                <Button size="sm" variant="outline" onClick={() => setAllStock(10)}>
                  Establecer todo a 10
                </Button>
                <Button size="sm" variant="outline" onClick={() => setAllStock(20)}>
                  Establecer todo a 20
                </Button>
                <Button size="sm" variant="outline" onClick={() => setAllStock(0)}>
                  Vaciar todo
                </Button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Talla</th>
                      {COLORS.map((color) => (
                        <th key={color.value} className="text-center p-2">
                          {color.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {SIZES.map((size) => (
                      <tr key={size} className="border-b">
                        <td className="p-2 font-medium">{size}</td>
                        {COLORS.map((color) => {
                          const variant = editingInventory.variants.find(
                            (v) => v.size === size && v.color === color.value
                          );
                          return (
                            <td key={color.value} className="p-2">
                              <Input
                                type="number"
                                min="0"
                                value={variant?.stock || 0}
                                onChange={(e) =>
                                  updateVariantStock(
                                    size,
                                    color.value,
                                    parseInt(e.target.value) || 0
                                  )
                                }
                                className="w-20 text-center"
                              />
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="pt-4">
                <p className="text-sm text-gray-600">
                  Stock total:{" "}
                  <span className="font-bold">
                    {editingInventory.variants.reduce((sum, v) => sum + v.stock, 0)}{" "}
                    unidades
                  </span>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((product) => {
            const inv = getInventoryForProduct(product.id);
            const totalStock = inv?.variants.reduce((sum, v) => sum + v.stock, 0) || 0;

            return (
              <Card key={product.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{product.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {product.images[0] && (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-40 object-cover rounded"
                      />
                    )}
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm text-gray-600">Stock total:</p>
                        <p className="text-2xl font-bold">{totalStock}</p>
                      </div>
                      {inv ? (
                        <Button onClick={() => editInventory(product.id)}>
                          Editar
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          onClick={() => initializeInventory(product)}
                        >
                          Inicializar
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}