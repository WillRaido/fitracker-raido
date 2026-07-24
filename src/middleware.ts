import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Aplica a todas las rutas EXCEPTO:
     * - archivos estáticos de Next (_next/static, _next/image)
     * - assets de la PWA (manifest, iconos, service worker)
     * - imágenes
     */
    "/((?!_next/static|_next/image|favicon.ico|favicon-32.png|manifest.json|sw.js|workbox-|icon.svg|icon-maskable.svg|icon-192.png|icon-512.png|icon-192-maskable.png|icon-512-maskable.png|apple-touch-icon.png).*)",
  ],
};
