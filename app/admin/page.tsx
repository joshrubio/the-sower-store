import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default async function AdminDashboard() {
  const { userId } = await auth()
  
  if (!userId) {
    redirect('/sign-in')
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Bienvenido al panel de administración de The Sower
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/admin/orders">
          <Card className="hover:shadow-lg transition cursor-pointer">
            <CardHeader>
              <CardTitle className="text-lg">Pedidos</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">-</p>
              <p className="text-sm text-gray-600">Gestionar pedidos</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/inventory">
          <Card className="hover:shadow-lg transition cursor-pointer">
            <CardHeader>
              <CardTitle className="text-lg">Inventario</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">-</p>
              <p className="text-sm text-gray-600">Gestionar stock</p>
            </CardContent>
          </Card>
        </Link>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Productos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">-</p>
            <p className="text-sm text-gray-600">En Stripe</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}