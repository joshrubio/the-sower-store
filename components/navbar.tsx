"use client";

import Link from "next/link";
import Image from "next/image";
import {
  ShoppingCartIcon,
  Bars3Icon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useCartStore } from "@/store/cart-store";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";

export const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState<boolean>(false);
  const { items } = useCartStore();
  const cartCount = items.reduce((acc, item) => acc + item.quantity, 0);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMobileOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <nav className="sticky top-0 z-50 bg-white shadow">
      <div className="container mx-auto flex items-center justify-between px-4 py-4">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2 hover:opacity-80">
          <div className="relative h-10 w-10">
            <Image
              src="/logo.png"
              alt="The Sower Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
          <span className="font-bold text-lg">The Sower</span>
        </Link>

        {/* Links Desktop */}
        <div className="hidden md:flex space-x-6">
          <Link href="/" className="hover:text-blue-600">Inicio</Link>
          <Link href="/products" className="hover:text-blue-600">
            Productos
          </Link>
          <Link href="/checkout" className="hover:text-blue-600">
            Checkout
          </Link>
        
        <SignedIn>
            <Link href="/admin" className="block hover:text-blue-600">
              Admin
            </Link>
            </SignedIn>
            </div>

        {/* Iconos y botones */}
        <div className="flex items-center space-x-4">
          {/* Cart */}
          <Link href="/checkout" className="relative">
            <ShoppingCartIcon className="h-6 w-6" />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                {cartCount}
              </span>
            )}
          </Link>

          {/* Auth Buttons */}
          <SignedIn>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
          <SignedOut>
            <div className="hidden md:flex space-x-2">
              <SignInButton mode="modal">
                <Button variant="outline">Iniciar sesión</Button>
              </SignInButton>
              <SignUpButton mode="modal">
                <Button className="bg-black text-white hover:bg-black/80">
                  Registrarse
                </Button>
              </SignUpButton>
            </div>
          </SignedOut>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            className="md:hidden"
            onClick={() => setMobileOpen((prev) => !prev)}
          >
            {mobileOpen ? (
              <XMarkIcon className="h-6 w-6" />
            ) : (
              <Bars3Icon className="h-6 w-6" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <nav className="md:hidden bg-white shadow-md">
          <ul className="flex flex-col p-4 space-y-3">
            <li>
              <Link href="/" className="block hover:text-blue-600">
                Inicio
              </Link>
            </li>
            <li>
              <Link href="/products" className="block hover:text-blue-600">
                Productos
              </Link>
            </li>
            <li>
              <Link href="/checkout" className="block hover:text-blue-600">
                Checkout
              </Link>
              </li>
            <li>
              <SignedIn>
             <Link href="/admin" className="block hover:text-blue-600">
              Admin
            </Link>
          </SignedIn>
            </li>
            <li className="border-t pt-3 flex flex-col space-y-2">
              <SignedOut>
                <SignInButton mode="modal">
                  <Button variant="outline" className="w-full">
                    Iniciar sesión
                  </Button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <Button className="w-full bg-black text-white hover:bg-blue-700">
                    Registrarse
                  </Button>
                </SignUpButton>
              </SignedOut>
              
            </li>
          </ul>
        </nav>
      )}
    </nav>
  );
};
