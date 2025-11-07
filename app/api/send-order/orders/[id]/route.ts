import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Order from "@/models/Order";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { status } = await req.json();
    await dbConnect();
    
    const order = await Order.findByIdAndUpdate(
      params.id,
      { status },
      { new: true }
    );

    if (!order) {
      return NextResponse.json({ error: "Orden no encontrada" }, { status: 404 });
    }

    return NextResponse.json({ order });
  } catch (error) {
    console.error("Error actualizando orden:", error);
    return NextResponse.json({ error: "Error al actualizar" }, { status: 500 });
  }
}

export async function GET() {
  try {
    await dbConnect();
    const orders = await Order.find({}).sort({ createdAt: -1 });
    console.log(`Encontradas ${orders.length} órdenes`);
    return NextResponse.json({ orders });
  } catch (error) {
    console.error("Error obteniendo órdenes:", error);
    return NextResponse.json({ 
      error: "Error al obtener órdenes",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}