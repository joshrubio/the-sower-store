import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Inventory from "@/models/Inventory";

// GET - Obtener inventario de un producto
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");

    await dbConnect();

    if (productId) {
      const inventory = await Inventory.findOne({ productId });
      return NextResponse.json({ inventory });
    }

    // Si no hay productId, devolver todo el inventario
    const allInventory = await Inventory.find({});
    return NextResponse.json({ inventory: allInventory });
  } catch (error) {
    console.error("Error obteniendo inventario:", error);
    return NextResponse.json(
      { error: "Error al obtener inventario" },
      { status: 500 }
    );
  }
}

// POST - Crear o actualizar inventario
export async function POST(req: NextRequest) {
  try {
    const { productId, productName, variants } = await req.json();

    await dbConnect();

    const inventory = await Inventory.findOneAndUpdate(
      { productId },
      { productId, productName, variants },
      { new: true, upsert: true }
    );

    return NextResponse.json({ inventory });
  } catch (error) {
    console.error("Error actualizando inventario:", error);
    return NextResponse.json(
      { error: "Error al actualizar inventario" },
      { status: 500 }
    );
  }
}