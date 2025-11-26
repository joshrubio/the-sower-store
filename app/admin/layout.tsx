// app/admin/layout.tsx
"use client";

import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { Home, Package, ClipboardList, Menu } from "lucide-react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useState, useEffect } from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };

    handleResize(); // Set initial state
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar izquierda */}
      <aside className={`fixed md:relative z-40 h-full w-64 bg-white border-r shadow-sm flex flex-col justify-between transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        <div>
          <div className="p-6 border-b flex justify-between items-center">
            <h1 className="text-xl font-bold text-gray-800">Panel Admin</h1>
            <button
              onClick={() => setSidebarOpen(false)}
              className="md:hidden p-1 hover:bg-gray-100 rounded"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
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
      <main className="flex-1 p-8 overflow-y-auto">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="md:hidden mb-4 p-2 bg-gray-200 rounded"
        >
          <Menu className="w-5 h-5" />
        </button>
        {children}
      </main>
    </div>
  );
}
