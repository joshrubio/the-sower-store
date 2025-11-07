import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Order from "@/models/Order";

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { status } = await req.json();
    const { id } = await context.params; // ← AWAIT aquí
    
    await dbConnect();

    const order = await Order.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!order) {
      return NextResponse.json(
        { error: "Orden no encontrada" },
        { status: 404 }
      );
    }

    console.log(`✅ Orden ${id} actualizada a estado: ${status}`);
    return NextResponse.json({ order });
  } catch (error) {
    console.error("Error actualizando orden:", error);
    return NextResponse.json(
      { error: "Error al actualizar" },
      { status: 500 }
    );
  }
}