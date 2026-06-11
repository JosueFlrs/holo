// app/page.js
'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import BarraNavegacion from "@/components/barraNavegacion";
import TarjetaProducto from "@/components/tarjetaProducto";
import { clienteSupabase } from "@/utilities/clienteSupabase";

export default function PaginaInicio() {
  const [productos, setProductos] = useState([]);
  const [estaCargando, setEstaCargando] = useState(true);

  useEffect(() => {
    async function cargarDatosTienda() {
      setEstaCargando(true);

      // Traemos los productos ordenados por la nueva columna 'created_at' y limitado a 12
      const { data: productosData, error } = await clienteSupabase
        .from('productos')
        .select(`
          id,
          nombreProducto,
          descripcion,
          categorias ( nombreCategoria ),
          variantesProducto ( id, nombreVariante, precioUnitario, urlImagen )
        `)
        .order('created_at', { ascending: false })
        .limit(12);

      if (error) {
        console.error("Error al obtener los últimos productos:", error);
      }

      if (productosData) setProductos(productosData);
      setEstaCargando(false);
    }

    cargarDatosTienda();
  }, []);

  return (
    <div className="min-h-screen bg-background pb-16">
      <BarraNavegacion />

      {/* Hero: Fondo crema limpio y tipografía en naranja */}
      <section className="bg-background py-16 px-6 text-center select-none">
        <h1 className="font-retro text-5xl md:text-7xl text-primary tracking-wide">
          ¡Dale onda a tus cosas!
        </h1>
        <p className="font-base text-sm md:text-base text-foreground/60 font-medium mt-4 max-w-xl mx-auto leading-relaxed">
          Catálogo interactivo con diseños llenos de brillo. Armá tu pedido y coordiná la entrega al toque por WhatsApp.
        </p>
      </section>

      {/* Grilla principal del catálogo (Novedades) */}
      <main className="max-w-6xl mx-auto px-6 mt-4">
        <h2 className="font-retro text-3xl text-foreground mb-8 tracking-wide">
          Últimos Ingresos
        </h2>

        {estaCargando ? (
          <div className="text-center font-base text-foreground/40 py-20 animate-pulse font-bold">
            Sincronizando las novedades con Supabase...
          </div>
        ) : productos.length === 0 ? (
          <p className="text-center font-base text-foreground/40 py-16 bg-white rounded-2xl border border-slate-200/60 shadow-sm">
            No se encontraron productos recientes en el catálogo.
          </p>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
              {productos.map((unProducto) => (
                <TarjetaProducto key={unProducto.id} unProducto={unProducto} />
              ))}
            </div>

            {/* BOTÓN VER MÁS: Centrado, elegante y con redirección fluida */}
            <div className="flex justify-center mt-14">
              <Link
                href="/productos"
                className="font-retro text-base px-8 py-3.5 bg-primary text-white hover:bg-primary/90 rounded-2xl shadow-md transition-all duration-300 hover:scale-105 hover:shadow-lg tracking-wider uppercase"
              >
                Ver todos los productos
              </Link>
            </div>
          </>
        )}
      </main>
    </div>
  );
}