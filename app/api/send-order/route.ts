import { Resend } from "resend";
import { NextResponse } from "next/server";
import OrderConfirmationEmail from "@/emails/order-confirmation";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { orderId, items, total, shippingAddress, customerEmail } = await request.json();

    console.log("Enviando email con datos:", { orderId, itemsCount: items?.length, total });

    const { data, error } = await resend.emails.send({
      from: "The Sower <onboarding@resend.dev>",
      to: [process.env.ADMIN_EMAIL!], // Siempre a tu email por ahora
      subject: `Nuevo Pedido #${orderId.slice(-8)} - The Sower${customerEmail ? ` (Cliente: ${customerEmail})` : ''}`,
      react: OrderConfirmationEmail({ 
        orderId, 
        items, 
        total,
        shippingAddress,
        customerEmail
      }),
    });

    if (error) {
      console.error("Error de Resend:", error);
      return NextResponse.json({ error }, { status: 400 });
    }

    console.log("✅ Email enviado exitosamente:", data);
    return NextResponse.json({ data });
  } catch (error) {
    console.error("Error enviando email:", error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : "Unknown error" 
    }, { status: 500 });
  }
}