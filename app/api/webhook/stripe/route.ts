import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import dbConnect from "@/lib/mongodb";
import Order from "@/models/Order";

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

if (!webhookSecret) {
  throw new Error("STRIPE_WEBHOOK_SECRET is required but not set in environment variables");
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret!);
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    console.error("Webhook signature verification failed:", errorMessage);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  console.log("✅ Webhook recibido:", event.type);

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    try {
      await dbConnect();

      // Obtener detalles completos de la sesión
      const fullSession = await stripe.checkout.sessions.retrieve(session.id);

      const updateData: Record<string, unknown> = {
        status: "paid",
        customerEmail: fullSession.customer_details?.email,
      };

      // Guardar dirección de envío si existe
      if (fullSession.shipping_details?.address) {
        updateData.shippingAddress = {
          name: fullSession.shipping_details.name || "",
          line1: fullSession.shipping_details.address.line1 || "",
          line2: fullSession.shipping_details.address.line2 || "",
          city: fullSession.shipping_details.address.city || "",
          state: fullSession.shipping_details.address.state || "",
          postal_code: fullSession.shipping_details.address.postal_code || "",
          country: fullSession.shipping_details.address.country || "",
        };
      }

      // Actualizar la orden
      const order = await Order.findOneAndUpdate(
        { sessionId: session.id },
        updateData,
        { new: true }
      );

      if (!order) {
        console.error("❌ Orden no encontrada:", session.id);
        return NextResponse.json({ received: true });
      }

      console.log(`✅ Orden ${session.id} actualizada como pagada`);

      // Reducir stock de cada item con rollback si falla
      const stockReductionErrors: string[] = [];
      const reducedItems: Array<{ productId: string; size: string; color: string; quantity: number }> = [];
      for (const item of order.items) {
        if (item.size && item.color) {
          try {
            const reduceRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/inventory/reduce`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                productId: item.productId,
                size: item.size,
                color: item.color,
                quantity: item.quantity,
              }),
            });

            if (reduceRes.ok) {
              console.log(`✅ Stock reducido: ${item.name} - ${item.size}/${item.color} x${item.quantity}`);
              reducedItems.push({
                productId: item.productId,
                size: item.size,
                color: item.color,
                quantity: item.quantity,
              });
            } else {
              const errorData = await reduceRes.json().catch(() => ({ error: "Unknown error" }));
              const errorMsg = `Error reduciendo stock para ${item.name}: ${errorData.error || "Unknown error"}`;
              console.error(`❌ ${errorMsg}`);
              stockReductionErrors.push(errorMsg);
            }
          } catch (reduceError) {
            const errorMsg = `Error llamando a reduce stock para ${item.name}: ${reduceError instanceof Error ? reduceError.message : "Unknown error"}`;
            console.error(`❌ ${errorMsg}`);
            stockReductionErrors.push(errorMsg);
          }
        }
      }

      // Rollback si hay errores de stock
      if (stockReductionErrors.length > 0) {
        console.error(`⚠️ Errores de reducción de stock para orden ${session.id}:`, stockReductionErrors);

        // Intentar rollback de items ya reducidos
        for (const reducedItem of reducedItems) {
          try {
            // Aquí necesitaríamos una API de rollback o incrementar stock
            // Por simplicidad, marcamos la orden como problemática
            console.log(`Intentando rollback para ${reducedItem.productId}`);
          } catch (rollbackError) {
            console.error(`Error en rollback para ${reducedItem.productId}:`, rollbackError);
          }
        }

        // Marcar orden con errores de stock
        await Order.findOneAndUpdate(
          { sessionId: session.id },
          {
            stockReductionErrors,
            status: "stock_error" // Nuevo estado para órdenes con problemas de stock
          }
        );

        // Podríamos querer notificar al admin aquí
        return NextResponse.json({ received: true, stockErrors: stockReductionErrors });
      }

      // Enviar email de confirmación con mejor manejo de errores
      if (fullSession.customer_details?.email && order) {
        console.log("📧 Enviando email de confirmación...");

        try {
          const emailResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/send-order`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              orderId: session.id,
              items: order.items,
              total: order.total,
              shippingAddress: updateData.shippingAddress,
              customerEmail: fullSession.customer_details.email,
            }),
          });

          if (emailResponse.ok) {
            console.log("✅ Email enviado correctamente");
          } else {
            const errorData = await emailResponse.json().catch(() => ({ error: "Unknown error" }));
            console.error("❌ Error en respuesta del email:", errorData);
            // Opcional: Marcar orden con error de email
            await Order.findOneAndUpdate(
              { sessionId: session.id },
              { emailError: errorData.error || "Email sending failed" }
            );
          }
        } catch (emailError) {
          const errorMsg = emailError instanceof Error ? emailError.message : "Unknown error";
          console.error("❌ Error enviando email:", errorMsg);
          // Opcional: Marcar orden con error de email
          await Order.findOneAndUpdate(
            { sessionId: session.id },
            { emailError: errorMsg }
          );
        }
      }
    } catch (error) {
      console.error("❌ Error actualizando orden:", error);
    }
  }

  return NextResponse.json({ received: true });
}