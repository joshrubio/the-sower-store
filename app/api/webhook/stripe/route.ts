import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import dbConnect from "@/lib/mongodb";
import Order from "@/models/Order";

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  console.log("✅ Webhook recibido:", event.type);

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    try {
      await dbConnect();

      // Obtener detalles completos de la sesión
      const fullSession = await stripe.checkout.sessions.retrieve(session.id);

      const updateData: any = {
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

      // NUEVO: Reducir stock de cada item
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
            } else {
              const errorData = await reduceRes.json();
              console.error(`❌ Error reduciendo stock:`, errorData);
            }
          } catch (reduceError) {
            console.error("❌ Error llamando a reduce stock:", reduceError);
          }
        }
      }

      // Enviar email de confirmación
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
            const errorData = await emailResponse.json();
            console.error("❌ Error en respuesta del email:", errorData);
          }
        } catch (emailError) {
          console.error("❌ Error enviando email:", emailError);
        }
      }
    } catch (error) {
      console.error("❌ Error actualizando orden:", error);
    }
  }

  return NextResponse.json({ received: true });
}