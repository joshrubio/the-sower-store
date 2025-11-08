import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Inventory from "@/models/Inventory";

// POST - Verificar stock disponible
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { productId, size, color, quantity } = body;

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