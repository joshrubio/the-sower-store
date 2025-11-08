"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Order {
  _id: string;
  orderId: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    size?: string;
    color?: string;
  }>;
  total: number;
  status: string;
  customerEmail?: string;
  shippingAddress?: {
    name: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
  createdAt: string;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/orders");
      const data = await res.json();
      setOrders(data.orders || []);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    if (newStatus === "cancelled") {
      const confirmed = window.confirm(
        "¿Estás seguro de que quieres cancelar este pedido? Esta acción no se puede deshacer y podría requerir devolución de stock manualmente."
      );
      if (!confirmed) return;
    }

    try {
      await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      fetchOrders();
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const filteredOrders = orders.filter((order) => {
    if (filter === "all") return true;
    return order.status === filter;
  });

  if (loading) {
    return <p className="text-center">Cargando pedidos...</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Pedidos ({orders.length})</h1>
        <div className="flex gap-2">
  <Button
    variant={filter === "all" ? "default" : "outline"}
    size="sm"
    onClick={() => setFilter("all")}
  >
    Todos
  </Button>
  <Button
    variant={filter === "pending" ? "default" : "outline"}
    size="sm"
    onClick={() => setFilter("pending")}
  >
    Pendientes
  </Button>
  <Button
    variant={filter === "paid" ? "default" : "outline"}
    size="sm"
    onClick={() => setFilter("paid")}
  >
    Pagados
  </Button>
  <Button
    variant={filter === "shipped" ? "default" : "outline"}
    size="sm"
    onClick={() => setFilter("shipped")}
  >
    Enviados
  </Button>
  <Button
    variant={filter === "delivered" ? "default" : "outline"}
    size="sm"
    onClick={() => setFilter("delivered")}
  >
    Entregados
  </Button>
  <Button
    variant={filter === "cancelled" ? "default" : "outline"}
    size="sm"
    onClick={() => setFilter("cancelled")}
  >
    Cancelados
  </Button>
</div>
      </div>

      <div className="grid gap-4">
        {filteredOrders.length === 0 ? (
          <p className="text-center text-gray-500">No hay pedidos</p>
        ) : (
          filteredOrders.map((order) => (
            <Card key={order._id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">
                      Pedido #{order.orderId.slice(-8)}
                    </CardTitle>
                    <p className="text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleString("es-ES")}
                    </p>
                    {order.customerEmail && (
                      <p className="text-sm text-gray-600 mt-1">
                        📧 {order.customerEmail}
                      </p>
                    )}
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      order.status === "pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : order.status === "paid"
                        ? "bg-green-100 text-green-800"
                        : order.status === "shipped"
                        ? "bg-blue-100 text-blue-800"
                        : order.status === "delivered"
                        ? "bg-purple-100 text-purple-800"
                        : order.status === "cancelled"
                        ? "bg-red-100 text-red-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {order.status}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span>
                          {item.name}
                          {item.size && ` - Talla: ${item.size}`}
                          {item.color && ` - Color: ${item.color}`} x
                          {item.quantity}
                        </span>
                        <span>
                          ${((item.price * item.quantity) / 100).toFixed(2)}
                        </span>
                      </div>
                    ))}
                    <div className="border-t pt-2 flex justify-between font-bold">
                      <span>Total:</span>
                      <span>${(order.total / 100).toFixed(2)}</span>
                    </div>
                  </div>

                  {order.shippingAddress && (
                    <div className="text-sm text-gray-600 border-t pt-3">
                      <p className="font-semibold mb-1">📍 Dirección de envío:</p>
                      <p>{order.shippingAddress.name}</p>
                      <p>{order.shippingAddress.line1}</p>
                      {order.shippingAddress.line2 && (
                        <p>{order.shippingAddress.line2}</p>
                      )}
                      <p>
                        {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                        {order.shippingAddress.postal_code}
                      </p>
                      <p>{order.shippingAddress.country}</p>
                    </div>
                  )}

                  <div className="flex gap-2 flex-wrap pt-2">
                    {order.status === "pending" && (
                      <Button
                        size="sm"
                        onClick={() => updateOrderStatus(order._id, "paid")}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Marcar como Pagado
                      </Button>
                    )}
                    {order.status === "paid" && (
                      <Button
                        size="sm"
                        onClick={() => updateOrderStatus(order._id, "shipped")}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        Marcar como Enviado
                      </Button>
                    )}
                    {order.status === "shipped" && (
                      <Button
                        size="sm"
                        onClick={() =>
                          updateOrderStatus(order._id, "delivered")
                        }
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        Marcar como Entregado
                      </Button>
                    )}
                    {order.status !== "cancelled" && (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() =>
                          updateOrderStatus(order._id, "cancelled")
                        }
                      >
                        Cancelar
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}