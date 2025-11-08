"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCartStore } from "@/store/cart-store";
import { checkoutAction } from "./checkout-action";

export default function CheckoutPage() {
  const { items, removeItem, addItem } = useCartStore();
  const total = items.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  const handleRemove = (item: { id: string; size?: string; color?: string }) => {
    console.log("Intentando eliminar:", {
      id: item.id,
      size: item.size,
      color: item.color,
    });
    removeItem(item.id, item.size, item.color);
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-3xl font-bold mb-4">Tu carrito está vacío</h1>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Checkout</h1>
      <Card className="max-w-md mx-auto mb-8">
        <CardHeader>
          <CardTitle className="text-xl font-bold">Order Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-4">
            {items.map((item, index) => {
              console.log("Item en carrito:", item);
              return (
                <li key={`${item.id}-${item.size}-${item.color}-${index}`} className="flex flex-col gap-2 border-b pb-2">
                  <div className="flex justify-between">
                    <div className="flex flex-col">
                      <span className="font-medium">{item.name}</span>
                      {(item.size || item.color) && (
                        <span className="text-sm text-gray-600">
                          {item.size && `Talla: ${item.size}`}
                          {item.size && item.color && " | "}
                          {item.color && `Color: ${item.color}`}
                        </span>
                      )}
                    </div>
                    <span className="font-semibold">
                      ${((item.price * item.quantity) / 100).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemove(item)}
                    >
                      –
                    </Button>
                    <span className="text-lg font-semibold">{item.quantity}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => addItem({ ...item, quantity: 1 })}
                    >
                      +
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
          <div className="mt-4 border-t pt-2 text-lg font-semibold">
            Total: ${(total / 100).toFixed(2)}
          </div>
        </CardContent>
      </Card>
      <form action={checkoutAction} className="max-w-md mx-auto">
        <input type="hidden" name="items" value={JSON.stringify(items)} />
        <Button type="submit" variant="default" className="w-full">
          Proceed to Payment
        </Button>
      </form>
    </div>
  );
}
