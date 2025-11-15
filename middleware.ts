import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isProtectedRoute = createRouteMatcher(['/admin(.*)'])
const isPublicApiRoute = createRouteMatcher([
  '/api/inventory/reduce(.*)',
  '/api/webhook/(.*)',
])

export default clerkMiddleware(async (auth, req) => {
  // Permitir rutas públicas de API sin autenticación
  if (isPublicApiRoute(req)) {
    return
  }
  
  // Proteger rutas de admin
  if (isProtectedRoute(req)) {
    await auth.protect()
  }
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}