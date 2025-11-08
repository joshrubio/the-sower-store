"use client";

import Stripe from "stripe";
import Image from "next/image";
import { Button } from "./ui/button";
import { useCartStore } from "@/store/cart-store";
import { useState, useEffect, useCallback } from "react";

interface Props {
  product: Stripe.Product;
}

const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];
const COLORS = [
  { name: "Negro", value: "black", hex: "#000000" },
  { name: "Blanco", value: "white", hex: "#FFFFFF" },
  { name: "Gris", value: "gray", hex: "#6B7280" },
  { name: "Azul", value: "blue", hex: "#3B82F6" },
  { name: "Rojo", value: "red", hex: "#EF4444" },
];

export const ProductDetail = ({ product }: Props) => {
  const [selectedSize, setSelectedSize] = useState<string>("M");
  const [selectedColor, setSelectedColor] = useState<string>("black");
  const [quantityToAdd, setQuantityToAdd] = useState<number>(1);
  const [stockInfo, setStockInfo] = useState<{
    available: boolean;
    stock: number;
    message: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  const { addItem } = useCartStore();
  const price = product.default_price as Stripe.Price;

  const checkStock = useCallback(async () => {
    try {
      const res = await fetch("/api/inventory/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          size: selectedSize,
          color: selectedColor,
          quantity: quantityToAdd,
        }),
      });

      const data = await res.json();
      setStockInfo(data);
    } catch (error) {
      console.error("Error verificando stock:", error);
    }
  }, [product.id, selectedSize, selectedColor, quantityToAdd]);

  // Verificar stock cuando cambian talla, color o cantidad
  useEffect(() => {
    checkStock();
  }, [checkStock]);


  const onAddToCart = async () => {
    // Validación adicional en el servidor antes de añadir al carrito
    try {
      const res = await fetch("/api/inventory/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          size: selectedSize,
          color: selectedColor,
          quantity: quantityToAdd,
        }),
      });

      const data = await res.json();

      if (!data.available) {
        alert(data.message || "No hay stock disponible");
        // Re-verificar stock después del error
        checkStock();
        return;
      }

      setLoading(true);

      addItem({
        id: product.id,
        name: product.name,
        price: price.unit_amount as number,
        imageUrl: product.images ? product.images[0] : null,
        quantity: quantityToAdd,
        size: selectedSize,
        color: selectedColor,
      });

      setQuantityToAdd(1);
      setLoading(false);
      alert("Producto añadido al carrito");
    } catch (error) {
      console.error("Error añadiendo al carrito:", error);
      alert("Error al añadir el producto al carrito. Inténtalo de nuevo.");
      // Re-verificar stock después del error
      checkStock();
    }
  };

  const increaseQuantity = () => {
    setQuantityToAdd((prev) => prev + 1);
  };

  const decreaseQuantity = () => {
    setQuantityToAdd((prev) => (prev > 1 ? prev - 1 : 1));
  };

  return (
    <div className="container mx-auto px-4 py-8 flex flex-col md:flex-row gap-8 items-start">
      {product.images && product.images[0] && (
        <div className="relative w-full md:w-1/2 aspect-square rounded-lg overflow-hidden">
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className="object-cover transition duration-300 hover:opacity-90"
          />
        </div>
      )}
      <div className="md:w-1/2 space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
          {product.description && (
            <p className="text-gray-700 mb-4">{product.description}</p>
          )}
          {price && price.unit_amount && (
            <p className="text-2xl font-bold text-gray-900">
              ${(price.unit_amount / 100).toFixed(2)}
            </p>
          )}
        </div>

        {/* Selector de Talla */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Talla
          </label>
          <div className="flex gap-2 flex-wrap">
            {SIZES.map((size) => (
              <button
                key={size}
                onClick={() => setSelectedSize(size)}
                className={`px-4 py-2 border rounded-md font-medium transition-colors ${
                  selectedSize === size
                    ? "bg-black text-white border-black"
                    : "bg-white text-gray-700 border-gray-300 hover:border-black"
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        {/* Selector de Color */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Color: {COLORS.find((c) => c.value === selectedColor)?.name}
          </label>
          <div className="flex gap-3">
            {COLORS.map((color) => (
              <button
                key={color.value}
                onClick={() => setSelectedColor(color.value)}
                className={`h-10 w-10 rounded-full border-2 transition-all ${
                  selectedColor === color.value
                    ? "border-black scale-110"
                    : "border-gray-300 hover:border-gray-400"
                }`}
                style={{ backgroundColor: color.hex }}
                title={color.name}
              >
                {color.value === "white" && (
                  <span className="block h-full w-full rounded-full border border-gray-200" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Stock Info */}
        {stockInfo && (
          <div
            className={`p-3 rounded-md ${
              stockInfo.available
                ? "bg-green-50 text-green-800"
                : "bg-red-50 text-red-800"
            }`}
          >
            <p className="text-sm font-medium">
              {stockInfo.available
                ? `✓ En stock (${stockInfo.stock} disponibles)`
                : `✗ ${stockInfo.message}`}
            </p>
          </div>
        )}

        {/* Cantidad */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Cantidad
          </label>
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              onClick={decreaseQuantity}
              className="w-10 h-10"
            >
              –
            </Button>
            <span className="text-lg font-semibold w-8 text-center">
              {quantityToAdd}
            </span>
            <Button
              onClick={increaseQuantity}
              className="w-10 h-10"
              disabled={
                stockInfo ? quantityToAdd >= stockInfo.stock : false
              }
            >
              +
            </Button>
          </div>
        </div>

        {/* Botón principal */}
        <Button
          onClick={onAddToCart}
          disabled={!stockInfo?.available || loading}
          className="w-full py-6 text-lg font-semibold"
        >
          {loading
            ? "Añadiendo..."
            : stockInfo?.available
            ? "Añadir al carrito"
            : "Sin stock"}
        </Button>
      </div>
    </div>
  );
};