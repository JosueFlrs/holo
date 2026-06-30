// app/page.js
'use client';

import { useState, useEffect } from "react";
import BarraNavegacion from "@/components/barraNavegacion";
import TarjetaProducto from "@/components/tarjetaProducto";
import CarruselHero from "@/components/carruselHero"; 
import { clienteSupabase } from "@/utilities/clienteSupabase";
import { Sparkles, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function Home() {
  const [productosDestacados, setProductosDestacados] = useState([]);
  const [estaCargando, setEstaCargando] = useState(true);

  useEffect(() => {
    async function obtenerProductosHome() {
      setEstaCargando(true);
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
        .limit(12);

      if (error) console.error("Error cargando home:", error);
      if (data) setProductosDestacados(data);
      setEstaCargando(false);
    }
    obtenerProductosHome();
  }, []);

  return (
    <div className="min-h-screen bg-background pb-20 relative overflow-x-hidden">
      
      {/* 1. NAVBAR FIXED REAL: 
         Cambiamos a 'fixed' solo en la raíz para garantizar que flote de forma absoluta 
         sobre el carrusel inmersivo sin importar los cálculos del flujo HTML. */}
      <div className="fixed top-0 left-0 w-full z-50">
        <BarraNavegacion />
      </div>

      {/* 2. CONTENEDOR RELATIVO PARA EL HERO:
         Envolvemos el carrusel en una caja que ocupa espacio real en la pantalla.
         Eliminamos el div invisible que nos rompía el scroll nativo. */}
      <div className="w-full h-[90dvh] relative z-0">
        <CarruselHero />
      </div>

      {/* 3. SECCIÓN DE PRODUCTOS DESTACADOS:
         Al estar el carrusel ocupando su espacio de forma relativa arriba, el main se dibuja 
         exactamente abajo de forma orgánica, permitiendo que el scroll de la página funcione 
         de manera idéntica a como lo hace en /productos. */}
      <main className="relative z-10 bg-background w-full mt-12">
        <div className="max-w-7xl mx-auto px-6 pt-12">
          
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