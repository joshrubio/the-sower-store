import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Order from "@/models/Order";

export async function GET() {
  try {
    await dbConnect();
    const orders = await Order.find({}).sort({ createdAt: -1 }).limit(50);
    return NextResponse.json({ orders });
  } catch (error) {
    console.error("Error obteniendo órdenes:", error);
    return NextResponse.json({ error: "Error al obtener órdenes" }, { status: 500 });
  }
}