import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Order from "@/models/Order";

export async function PATCH(
  req: NextRequest,
  context: { params: { id: string } } | { params: Promise<{ id: string }> }
) {
  const params = "then" in context.params
    ? await context.params
    : context.params;

  const { id } = params;
  // Note: 'id' is extracted but not used in PATCH - used as params.id instead
  // This is intentional as the parameter is used in the query
  try {
    const { status } = await req.json();
    await dbConnect();

    const order = await Order.findById(params.id);

    if (!order) {
      return NextResponse.json({ error: "Orden no encontrada" }, { status: 404 });
    }

    // Si se está cancelando la orden, hacer rollback del stock
    if (status === "cancelled" && order.status !== "cancelled") {
      const stockRollbackErrors: string[] = [];

      for (const item of order.items) {
        if (item.size && item.color) {
          try {
            const rollbackRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/inventory/rollback`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                productId: item.productId,
                size: item.size,
                color: item.color,
                quantity: item.quantity,
              }),
            });

            if (!rollbackRes.ok) {
              const errorData = await rollbackRes.json().catch(() => ({ error: "Unknown error" }));
              stockRollbackErrors.push(`Error rollback ${item.name}: ${errorData.error || "Unknown error"}`);
            }
          } catch (rollbackError) {
            stockRollbackErrors.push(`Error rollback ${item.name}: ${rollbackError instanceof Error ? rollbackError.message : "Unknown error"}`);
          }
        }
      }

      // Actualizar orden con errores de rollback si los hay
      const updateData: any = { status };
      if (stockRollbackErrors.length > 0) {
        updateData.stockRollbackErrors = stockRollbackErrors;
      }

      const updatedOrder = await Order.findByIdAndUpdate(
        params.id,
        updateData,
        { new: true }
      );

      return NextResponse.json({
        order: updatedOrder,
        rollbackErrors: stockRollbackErrors.length > 0 ? stockRollbackErrors : undefined
      });
    } else {
      // Actualización normal
      const updatedOrder = await Order.findByIdAndUpdate(
        params.id,
        { status },
        { new: true }
      );

      return NextResponse.json({ order: updatedOrder });
    }
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