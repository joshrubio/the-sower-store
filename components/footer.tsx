// components/footer.tsx
import Link from "next/link"
import { Instagram } from "lucide-react"

export default function Footer() {
  return (
    <footer className="w-full bg-black text-gray-300">
      <div className="container mx-auto px-4 py-10 flex flex-col items-center text-center space-y-4">
        
        {/* Nombre de la marca */}
        <h3 className="text-xl font-semibold text-white">The Sower</h3>

        {/* Frase de marca */}
        <p className="text-sm italic text-gray-500">
          Inspirando al mundo con Fe y Estilo.
        </p>

        {/* Contacto */}
        <div className="space-y-1 text-sm text-gray-500">
          <p>
            <a href="mailto:info@thesower.com" className="hover:underline">
              info@thesower.com
            </a>
          </p>
          <p>
            <a href="tel:+34600123456" className="hover:underline">
              +34 600 123 456
            </a>
          </p>
        </div>

        {/* Redes sociales */}
        <div className="flex space-x-4 pt-2">
          <Link
            href="https://instagram.com"
            target="_blank"
            aria-label="Instagram"
            className="hover:text-white transition-colors"
          >
            <Instagram className="w-5 h-5" />
          </Link>
        </div>

        {/* Línea separadora */}
        <div className="w-16 h-[1px] bg-gray-500 my-4" />

        {/* Derechos */}
        <p className="text-xs text-gray-500">
          © {new Date().getFullYear()} The Sower. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  )
}
