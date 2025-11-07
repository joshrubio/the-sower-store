import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Inventory from "@/models/Inventory";

// POST - Verificar stock disponible
export async function POST(req: NextRequest) {
  try {
    const { productId, size, color, quantity } = await req.json();

    await dbConnect();

    const inventory = await Inventory.findOne({ productId });

    if (!inventory) {
      return NextResponse.json(
        { available: false, stock: 0, message: "Producto no encontrado" },
        { status: 404 }
      );
    }

    const variant = inventory.variants.find(
      (v: { size: string; color: string; stock: number }) =>
        v.size === size && v.color === color
    );

    if (!variant) {
      return NextResponse.json({
        available: false,
        stock: 0,
        message: "Variante no disponible",
      });
    }

    const available = variant.stock >= quantity;

    return NextResponse.json({
      available,
      stock: variant.stock,
      message: available
        ? "Stock disponible"
        : `Solo quedan ${variant.stock} unidades`,
    });
  } catch (error) {
    console.error("Error verificando stock:", error);
    return NextResponse.json(
      { error: "Error al verificar stock" },
      { status: 500 }
    );
  }
}