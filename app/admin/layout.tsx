// app/admin/layout.tsx
import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { Home, Package, ClipboardList } from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar izquierda */}
      <aside className="w-64 bg-white border-r shadow-sm flex flex-col justify-between">
        <div>
          <div className="p-6 border-b">
            <h1 className="text-xl font-bold text-gray-800">Panel Admin</h1>
          </div>

          <nav className="flex flex-col space-y-1 p-4">
            <Link
              href="/admin"
              className="flex items-center space-x-2 text-gray-700 hover:bg-gray-100 rounded-lg px-3 py-2 transition"
            >
              <Home className="w-4 h-4" />
              <span>Dashboard</span>
            </Link>

            <Link
              href="/admin/orders"
              className="flex items-center space-x-2 text-gray-700 hover:bg-gray-100 rounded-lg px-3 py-2 transition"
            >
              <ClipboardList className="w-4 h-4" />
              <span>Pedidos</span>
            </Link>

            <Link
              href="/admin/inventory"
              className="flex items-center space-x-2 text-gray-700 hover:bg-gray-100 rounded-lg px-3 py-2 transition"
            >
              <Package className="w-4 h-4" />
              <span>Inventario</span>
            </Link>
          </nav>
        </div>

        <div className="p-4 border-t">
          <UserButton afterSignOutUrl="/" />
        </div>
      </aside>

      {/* Contenido principal */}
      <main className="flex-1 p-8 overflow-y-auto">{children}</main>
    </div>
  );
}
