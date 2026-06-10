// app/page.js
'use client';

import { useState, useEffect } from "react";
import BarraNavegacion from "@/components/barraNavegacion";
import TarjetaProducto from "@/components/tarjetaProducto";
import { clienteSupabase } from "@/utilities/clienteSupabase";
import { Sparkles } from "lucide-react";

export default function PaginaInicio() {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("Todos");
  const [estaCargando, setEstaCargando] = useState(true);

  useEffect(() => {
    async function cargarDatosTienda() {
      setEstaCargando(true);

      // 1. Traemos las categorías reales de Supabase
      const { data: categoriasData } = await clienteSupabase
        .from("categorias")
        .select("id, nombreCategoria");

      // 2. Traemos los productos con sus relaciones
      const { data: productosData } = await clienteSupabase
        .from('productos')
        .select(`
          id,
          nombreProducto,
          descripcion,
          categorias ( nombreCategoria ),
          variantesProducto ( id, nombreVariante, precioUnitario, urlImagen )
        `);

      if (categoriasData) setCategorias(categoriasData);
      if (productosData) setProductos(productosData);
      setEstaCargando(false);
    }

    cargarDatosTienda();
  }, []);

  // Filtrado lógico en tiempo real
  const productosFiltrados = categoriaSeleccionada === "Todos"
    ? productos
    : productos.filter(p => p.categorias?.nombreCategoria === categoriaSeleccionada);

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

      {/* SECCIÓN: Barra de Filtros con fondo Naranja Claro y botones Rosa */}
      <section className="bg-[shadow-sm] py-6 px-6 border-y border-slate-200/40 sticky top-19 z-40 transition-all duration-200" style={{ backgroundColor: 'hsl(24, 95%, 70%)' }}>
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">

          {/* Título de la sección en un color oscuro suave para que contraste bien sobre el naranja claro */}
          <div className="flex items-center gap-2 font-retro text-lg text-background tracking-wide">
            <span>¿Qué estás buscando?</span>
          </div>

          {/* Contenedor de Botones de Filtro */}
          <div className="flex flex-wrap gap-2 justify-center">

            {/* Botón de "Todos" */}
            <button
              onClick={() => setCategoriaSeleccionada("Todos")}
              className={`text-xs px-4 py-2 rounded-xl border transition-all cursor-pointer font-base font-bold uppercase tracking-wider ${categoriaSeleccionada === "Todos"
                ? 'bg-accent text-background border-transparent shadow-md scale-105' // Activo: Rosa con letras crema
                : 'bg-white/40 text-slate-900 border-white/20 hover:bg-white/60'    // Inactivo: Blanco translúcido suave
                }`}
            >
              Todos
            </button>

            {/* Render dinámico de las categorías */}
            {categorias.map((cat) => {
              const esActivo = categoriaSeleccionada === cat.nombreCategoria;
              return (
                <button
                  key={`filtro-${cat.id}`}
                  onClick={() => setCategoriaSeleccionada(cat.nombreCategoria)}
                  className={`text-xs px-4 py-2 rounded-xl border transition-all cursor-pointer font-base font-bold uppercase tracking-wider ${esActivo
                    ? 'bg-accent text-background border-transparent shadow-md scale-105' // Activo: Rosa con letras crema
                    : 'bg-white/40 text-slate-900 border-white/20 hover:bg-white/60'    // Inactivo: Blanco translúcido suave
                    }`}
                >
                  {cat.nombreCategoria}
                </button>
              );
            })}
          </div>

        </div>
      </section>

      {/* Grilla principal del catálogo */}
      <main className="max-w-6xl mx-auto px-6 mt-12">
        <h2 className="font-retro text-3xl text-foreground mb-8 tracking-wide">
          {categoriaSeleccionada === "Todos" ? "Diseños Disponibles" : `Filtrado por: ${categoriaSeleccionada}`}
        </h2>

        {estaCargando ? (
          <div className="text-center font-base text-foreground/40 py-20 animate-pulse font-bold">
            Sincronizando el catálogo con Supabase...
          </div>
        ) : productosFiltrados.length === 0 ? (
          <p className="text-center font-base text-foreground/40 py-16 bg-white rounded-2xl border border-slate-200/60 shadow-sm">
            No se encontraron productos en la categoría "{categoriaSeleccionada}".
          </p>
        ) : (
          /* CAMBIO CLAVE: Cambiamos a lg:grid-cols-4 para achicar tarjetas y meter una más por fila */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {productosFiltrados.map((unProducto) => (
              <TarjetaProducto key={unProducto.id} unProducto={unProducto} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}