import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Order from "@/models/Order";

export async function GET() {
  try {
    await dbConnect();
    const orders = await Order.find({}).sort({ createdAt: -1 });
    console.log(`Encontradas ${orders.length} órdenes`);
    return NextResponse.json({ orders });
  } catch (error) {
    console.error("Error obteniendo órdenes:", error);
    return NextResponse.json(
      {
        error: "Error al obtener órdenes",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}