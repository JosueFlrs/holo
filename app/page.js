// app/page.js
'use client';

import { useState, useEffect } from "react";
import BarraNavegacion from "@/components/barraNavegacion";
import TarjetaProducto from "@/components/tarjetaProducto";
import CarruselHero from "@/components/carruselHero"; // 👈 Importamos el nuevo componente
import { clienteSupabase } from "@/utilities/clienteSupabase";
import { Sparkles, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function Home() {
  const [productosDestacados, setProductosDestacados] = useState([]);
  const [estaCargando, setEstaCargando] = useState(true);

  useEffect(() => {
    async function obtenerProductosHome() {
      setEstaCargando(true);
      // Traemos los últimos 12 productos con sus variantes y categorías correspondientes
      const { data, error } = await clienteSupabase
        .from("productos")
        .select(`
          id,
          nombreProducto,
          descripcion,
          categorias ( id, nombreCategoria ),
          variantesProducto ( id, nombreVariante, precioUnitario, urlImagen )
        `)
        .order("created_at", { ascending: false })
        .limit(12); // Aseguramos completar la grilla con 12 simétricos

      if (error) console.error("Error cargando home:", error);
      if (data) setProductosDestacados(data);
      setEstaCargando(false);
    }
    obtenerProductosHome();
  }, []);

  // app/page.js

  return (
    <div className="min-h-screen bg-background pb-20 relative overflow-x-hidden">
      {/* La navbar queda flotando sticky arriba en z-50 */}
      <BarraNavegacion />

      {/* El carrusel se dibuja completo desde el pixel 0 en z-0 por detrás */}
      <CarruselHero />

      {/* TRUCO MAESTRO: Bloque invisible que empuja todo el contenido abajo.
       Mide exactamente el 90% del alto de la pantalla, haciendo que los productos 
       destacados arranquen milimétricamente abajo del carrusel. */}
      <div className="w-full h-[90dvh] pointer-events-none" />

      {/* SECCIÓN DE PRODUCTOS DESTACADOS: Comienza limpia justo en el 10% inferior */}
      <main className="relative z-10 bg-background w-full">
        <div className="max-w-7xl mx-auto px-6 pt-6">

          <div className="flex items-center justify-between border-b border-slate-200/40 pb-4 mb-8 select-none">
            <h2 className="font-retro text-2xl text-slate-900 flex items-center gap-2.5 tracking-wide">
              <Sparkles className="h-5 w-5 text-primary animate-pulse" />
              Últimos Lanzamientos
            </h2>
            <Link
              href="/productos"
              className="group flex items-center gap-1 text-xs font-base font-bold text-primary uppercase tracking-wider hover:opacity-80 transition-opacity"
            >
              Ver catálogo entero
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>

          {estaCargando ? (
            <div className="text-center font-base text-foreground/40 py-24 font-bold animate-pulse">
              Cargando novedades de HOLO...
            </div>
          ) : productosDestacados.length === 0 ? (
            <div className="text-center font-base text-foreground/40 py-24">
              No hay productos cargados actualmente en el catálogo.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {productosDestacados.map((unProducto) => (
                <TarjetaProducto key={`home-destacado-${unProducto.id}`} unProducto={unProducto} />
              ))}
            </div>
          )}

        </div>
      </main>
    </div>
  );
}