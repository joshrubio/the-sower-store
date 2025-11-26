import Image from "next/image";
import { stripe } from "@/lib/stripe";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ProductList } from "@/components/product-list";
import { AnimatedHeroCards } from "@/components/animated-hero-cards";

export default async function Home() {
  const products = await stripe.products.list({
    expand: ["data.default_price"],
    limit: 9,
  });

  return (
    <div className="min-h-screen">
      <section className="rounded bg-neutral-100 py-8 sm:py-12">
        <div className="mx-auto grid grid-cols-1 items-center justify-items-center gap-8 px-8 sm:px-16 md:grid-cols-2">
          <div className="max-w-md space-y-4">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              Bienvenido a The Sower
            </h2>
            <p className="text-neutral-600">
              Descubre una colección exclusiva de productos que fusionan fe, estilo y calidad excepcional.
            </p>
            <Button
              asChild
              variant="default"
              className="inline-flex items-center justify-center rounded-full px-6 py-3 bg-black text-white"
            >
              <Link
                href="/products"
                className="inline-flex items-center justify-center rounded-full px-6 py-3"
              >
                Nuestro Catalogo
              </Link>
            </Button>
          </div>
          <AnimatedHeroCards products={products.data} />
        </div>
      </section>
       {/* Products Section */}
      <section className="py-20 sm:py-24 lg:py-32">
        <div className="container mx-auto px-8 sm:px-12 lg:px-16">
          <div className="mb-16 text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Productos Destacados
            </h2>
            <p className="mt-2 text-neutral-600">
              Explora nuestra colección de camisetas con diseños únicos
            </p>
          </div>
          <ProductList products={products.data} />
        </div>
      </section>
    </div>
  );
}