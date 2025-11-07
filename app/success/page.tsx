"use client"

import { useCartStore } from "@/store/cart-store"
import Link from "next/link"
import { useEffect } from "react"
import { CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function SuccessPage() {
  const { clearCart } = useCartStore()
  
  useEffect(() => {
    clearCart()
  }, [clearCart])
  
  return (
    <div className="container mx-auto px-4 py-16 text-center flex flex-col items-center space-y-6">
      {/* Icono de éxito */}
      <CheckCircle className="w-16 h-16 text-green-500 mb-2" />

      {/* Título */}
      <h1 className="text-3xl font-bold text-foreground">¡Pago completado con éxito!</h1>

      {/* Mensaje principal */}
      <p className="text-muted-foreground max-w-md">
        Gracias por tu compra. Tu pedido ha sido recibido y se enviará a la dirección proporcionada 
        en un periodo estimado de <span className="font-semibold text-foreground">2 a 10 días</span>.
      </p>

      {/* Botón para seguir comprando */}
      <Button asChild className="mt-4">
        <Link href="/products">
          Seguir comprando
        </Link>
      </Button>

      {/* Mensaje de contacto */}
      <div className="py-4 text-muted-foreground max-w-md">
        Para cualquier consulta, no dudes en contactarnos a través de <a href="mailto:info@thesower.com" className="underline hover:text-foreground">info@thesower.com</a>
      </div>
    </div>
  )
}
