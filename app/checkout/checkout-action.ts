"use server";

import { stripe } from "@/lib/stripe";
import { CartItem } from "@/store/cart-store";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/mongodb";
import Order from "@/models/Order";

export const checkoutAction = async (formData: FormData): Promise<void> => {
  const itemsJson = formData.get("items") as string;
  const items = JSON.parse(itemsJson);

  // Validar stock antes de crear sesión de Stripe
  for (const item of items) {
    try {
      const stockRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/inventory/check`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: item.id,
          size: item.size,
          color: item.color,
          quantity: item.quantity,
        }),
      });

      const stockData = await stockRes.json();
      if (!stockData.available) {
        throw new Error(`Stock insuficiente para ${item.name} (${item.size}/${item.color}): ${stockData.message}`);
      }
    } catch (error) {
      console.error("Error validando stock:", error);
      throw new Error(`Error validando stock: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  const line_items = items.map((item: CartItem) => ({
    price_data: {
      currency: "cad",
      product_data: {
        name: `${item.name}${item.size ? ` - Talla: ${item.size}` : ""}${
          item.color ? ` - Color: ${item.color}` : ""
        }`,
      },
      unit_amount: item.price,
    },
    quantity: item.quantity,
  }));

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items,
    mode: "payment",
    success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/success`,
    cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout`,
    billing_address_collection: "required",
    shipping_address_collection: {
      allowed_countries: ["US", "CA", "ES", "MX"],
    },
    customer_email: undefined,
  });

  // Guardar orden en MongoDB
  try {
    await dbConnect();
    const order = await Order.create({
      orderId: session.id,
      sessionId: session.id,
      items: items.map((item: CartItem) => ({
        productId: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        size: item.size,
        color: item.color,
      })),
      total: items.reduce(
        (acc: number, item: CartItem) => acc + item.price * item.quantity,
        0
      ),
      status: "pending",
    });
    console.log("Orden guardada en MongoDB con sessionId:", session.id);
    // Note: 'order' variable is created but not used in return - this is intentional
    // as the order data is not needed beyond logging
  } catch (error) {
    console.error("Error guardando orden en MongoDB:", error);
  }

  // NO enviar email aquí - se enviará desde el webhook cuando el pago se confirme

  redirect(session.url!);
};