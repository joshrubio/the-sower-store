import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Inventory from "@/models/Inventory";

// POST - Reducir stock después de una compra
export async function POST(req: NextRequest) {
  try {
    const { productId, size, color, quantity } = await req.json();

    await dbConnect();

    const inventory = await Inventory.findOne({ productId });

    if (!inventory) {
      return NextResponse.json(
        { error: "Producto no encontrado" },
        { status: 404 }
      );
    }

    const variantIndex = inventory.variants.findIndex(
      (v: { size: string; color: string; stock: number }) =>
        v.size === size && v.color === color
    );

    if (variantIndex === -1) {
      return NextResponse.json(
        { error: "Variante no encontrada" },
        { status: 404 }
      );
    }

    const variant = inventory.variants[variantIndex];

    if (variant.stock < quantity) {
      return NextResponse.json(
        { error: "Stock insuficiente" },
        { status: 400 }
      );
    }

    // Reducir stock
    inventory.variants[variantIndex].stock -= quantity;
    await inventory.save();

    return NextResponse.json({
      success: true,
      newStock: inventory.variants[variantIndex].stock,
    });
  } catch (error) {
    console.error("Error reduciendo stock:", error);
    return NextResponse.json(
      { error: "Error al reducir stock" },
      { status: 500 }
    );
  }
}