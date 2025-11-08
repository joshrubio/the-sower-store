import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import dbConnect from "@/lib/mongodb";
import Inventory from "@/models/Inventory";

// POST - Rollback stock (incrementar stock después de cancelación)
export async function POST(req: NextRequest) {
  // Verificar autenticación (solo webhooks internos deberían poder hacer rollback)
  const authResult = await auth();
  if (!authResult.userId) {
    return NextResponse.json(
      { error: "Unauthorized - Only authenticated users can rollback stock" },
      { status: 401 }
    );
  }

  try {
    const { productId, size, color, quantity } = await req.json();

    // Validación de entrada
    if (!productId || typeof productId !== 'string' || productId.trim() === '') {
      return NextResponse.json(
        { error: "productId es requerido y debe ser un string válido" },
        { status: 400 }
      );
    }

    if (!size || typeof size !== 'string' || size.trim() === '') {
      return NextResponse.json(
        { error: "size es requerido y debe ser un string válido" },
        { status: 400 }
      );
    }

    if (!color || typeof color !== 'string' || color.trim() === '') {
      return NextResponse.json(
        { error: "color es requerido y debe ser un string válido" },
        { status: 400 }
      );
    }

    if (!quantity || typeof quantity !== 'number' || quantity <= 0 || !Number.isInteger(quantity)) {
      return NextResponse.json(
        { error: "quantity es requerido y debe ser un número entero positivo" },
        { status: 400 }
      );
    }

    await dbConnect();

    // Usar operación atómica para incrementar stock
    const updateResult = await Inventory.updateOne(
      {
        productId,
        "variants.size": size,
        "variants.color": color
      },
      {
        $inc: { "variants.$.stock": quantity } // Incrementar stock atómicamente
      }
    );

    if (updateResult.modifiedCount === 0) {
      return NextResponse.json(
        { error: "Producto o variante no encontrada para rollback" },
        { status: 404 }
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
      message: `Stock incrementado en ${quantity} unidades`
    });
  } catch (error) {
    console.error("Error haciendo rollback de stock:", error);
    return NextResponse.json(
      { error: "Error al hacer rollback de stock" },
      { status: 500 }
    );
  }
}