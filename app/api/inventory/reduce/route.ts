import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import dbConnect from "@/lib/mongodb";
import Inventory from "@/models/Inventory";

// POST - Reducir stock después de una compra
export async function POST(req: NextRequest) {
  // Verificar autenticación (solo webhooks internos deberían poder reducir stock)
  const authResult = await auth();
  if (!authResult.userId) {
    return NextResponse.json(
      { error: "Unauthorized - Only authenticated users can reduce stock" },
      { status: 401 }
    );
  }
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

    // Usar transacción atómica para evitar race conditions
    const updateResult = await Inventory.updateOne(
      {
        productId,
        "variants.size": size,
        "variants.color": color,
        "variants.stock": { $gte: quantity } // Verificar stock disponible
      },
      {
        $inc: { "variants.$.stock": -quantity } // Reducir stock atómicamente
      }
    );

    if (updateResult.modifiedCount === 0) {
      return NextResponse.json(
        { error: "Stock insuficiente o variante no encontrada" },
        { status: 400 }
      );
    }

    // Obtener el stock actualizado
    const updatedInventory = await Inventory.findOne({ productId });
    const updatedVariant = updatedInventory?.variants.find(
      (v: { size: string; color: string }) => v.size === size && v.color === color
    );

    return NextResponse.json({
      success: true,
      newStock: updatedVariant?.stock,
    });
  } catch (error) {
    console.error("Error reduciendo stock:", error);
    return NextResponse.json(
      { error: "Error al reducir stock" },
      { status: 500 }
    );
  }
}