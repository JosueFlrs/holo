// app/productos/page.js
'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import BarraNavegacion from "@/components/barraNavegacion";
import TarjetaProducto from "@/components/tarjetaProducto";
import { clienteSupabase } from "@/utilities/clienteSupabase";
import { ChevronRight, SlidersHorizontal } from "lucide-react";

export default function PaginaTodosLosProductos() {
    const [productos, setProductos] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("Todos");
    const [criterioOrden, setCriterioOrden] = useState("novedades"); // novedades, viejo, precio-menor, precio-mayor
    const [estaCargando, setEstaCargando] = useState(true);

    useEffect(() => {
        async function cargarCatalogoCompleto() {
            setEstaCargando(true);

            // 1. Traemos todas las categorías para el panel izquierdo
            const { data: categoriasData } = await clienteSupabase
                .from("categorias")
                .select("id, nombreCategoria");

            // 2. Traemos todos los productos sin límite
            const { data: productosData, error } = await clienteSupabase
                .from('productos')
                .select(`
          id,
          nombreProducto,
          descripcion,
          created_at,
          categorias ( nombreCategoria ),
          variantesProducto ( id, nombreVariante, precioUnitario, urlImagen )
        `);

            if (error) {
                console.error("Error al cargar el catálogo completo:", error);
            }

            if (categoriasData) setCategorias(categoriasData);
            if (productosData) setProductos(productosData);
            setEstaCargando(false);
        }

        cargarCatalogoCompleto();
    }, []);

    // --- LÓGICA DE FILTRADO Y ORDENAMIENTO ---

    // 1. Filtrar por categoría seleccionada en el panel izquierdo
    const productosFiltrados = categoriaSeleccionada === "Todos"
        ? productos
        : productos.filter(p => p.categorias?.nombreCategoria === categoriaSeleccionada);

    // 2. Ordenar los productos filtrados según el selector superior derecho
    const productosOrdenados = [...productosFiltrados].sort((a, b) => {
        const precioA = a.variantesProducto?.[0]?.precioUnitario || 0;
        const precioB = b.variantesProducto?.[0]?.precioUnitario || 0;
        const fechaA = new Date(a.created_at || 0).getTime();
        const fechaB = new Date(b.created_at || 0).getTime();

        switch (criterioOrden) {
            case "precio-menor":
                return precioA - precioB;
            case "precio-mayor":
                return precioB - precioA;
            case "antiguo":
                return fechaA - fechaB;
            case "novedades":
            default:
                return fechaB - fechaA; // Más nuevo a más viejo
        }
    });

    return (
        <div className="min-h-screen bg-background pb-20">
            <BarraNavegacion />

            {/* SECCIÓN SUPERIOR: Ruta (Izquierda) y Ordenamiento (Derecha) */}
            <div className="max-w-7xl mx-auto px-6 pt-8 pb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200/40 select-none">

                {/* Ruta de navegación (Breadcrumb) */}
                <nav className="flex items-center gap-1.5 font-base text-xs font-bold text-foreground/40 uppercase tracking-wider">
                    <Link href="/" className="hover:text-primary transition-colors">
                        Inicio
                    </Link>
                    <ChevronRight className="h-3.5 w-3.5 text-foreground/30" />
                    <span className="text-foreground/80">
                        Productos
                    </span>
                </nav>

                {/* Selector de Ordenamiento */}
                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    <label htmlFor="ordenar" className="font-base text-xs font-bold uppercase tracking-wider text-foreground/50 hidden md:inline-block">
                        Ordenar por:
                    </label>
                    <select
                        id="ordenar"
                        value={criterioOrden}
                        onChange={(e) => setCriterioOrden(e.target.value)}
                        className="text-xs font-base font-bold uppercase tracking-wider bg-white border border-slate-200/80 rounded-xl px-3 py-2.5 text-slate-800 focus:outline-none focus:border-primary cursor-pointer shadow-sm min-w-45"
                    >
                        <option value="novedades">Más nuevos primero</option>
                        <option value="antiguo">Más viejos primero</option>
                        <option value="precio-menor">Precio: Menor a Mayor</option>
                        <option value="precio-mayor">Precio: Mayor a Menor</option>
                    </select>
                </div>
            </div>

            {/* SECCIÓN PRINCIPAL: Layout de 2 columnas (Sidebar Izquierda + Grilla Derecha) */}
            <div className="max-w-7xl mx-auto px-6 mt-10 flex flex-col lg:flex-row gap-10">

                {/* SIDEBAR IZQUIERDA: Listado de Categorías */}
                <aside className="w-full lg:w-64 shrink-0">
                    <div className="bg-white/40 border border-slate-200/40 rounded-2xl p-5 sticky top-24">
                        <h2 className="font-retro text-lg text-slate-900 mb-4 flex items-center gap-2 select-none">
                            <SlidersHorizontal className="h-4 w-4 text-primary" />
                            Categorías
                        </h2>

                        <div className="flex flex-row lg:flex-col flex-wrap gap-1">
                            {/* Botón Todos */}
                            <button
                                onClick={() => setCategoriaSeleccionada("Todos")}
                                className={`w-auto lg:w-full text-left text-xs font-base font-bold uppercase tracking-wider px-4 py-3 rounded-xl transition-all cursor-pointer ${categoriaSeleccionada === "Todos"
                                        ? 'bg-accent text-background shadow-sm translate-x-1 lg:translate-x-2'
                                        : 'text-foreground/70 hover:bg-slate-100/60 hover:text-foreground'
                                    }`}
                            >
                                Todos los productos
                            </button>

                            {/* Botones de Categorías de la Base de Datos */}
                            {categorias.map((cat) => {
                                const esActivo = categoriaSeleccionada === cat.nombreCategoria;
                                return (
                                    <button
                                        key={`sidebar-cat-${cat.id}`}
                                        onClick={() => setCategoriaSeleccionada(cat.nombreCategoria)}
                                        className={`w-auto lg:w-full text-left text-xs font-base font-bold uppercase tracking-wider px-4 py-3 rounded-xl transition-all cursor-pointer ${esActivo
                                                ? 'bg-accent text-background shadow-sm translate-x-1 lg:translate-x-2'
                                                : 'text-foreground/70 hover:bg-slate-100/60 hover:text-foreground'
                                            }`}
                                    >
                                        {cat.nombreCategoria}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </aside>

                {/* CONTENIDO DERECHA: Grilla de Productos */}
                <main className="flex-1">
                    {estaCargando ? (
                        <div className="text-center font-base text-foreground/40 py-24 animate-pulse font-bold">
                            Organizando catálogo de HOLO...
                        </div>
                    ) : productosOrdenados.length === 0 ? (
                        <div className="text-center font-base text-foreground/40 py-20 bg-white/40 rounded-2xl border border-dashed border-slate-200/80">
                            No se encontraron productos en esta sección.
                        </div>
                    ) : (
                        <div>
                            {/* Contador de productos discreto */}
                            <p className="font-base text-[10px] font-bold text-foreground/40 uppercase tracking-widest mb-6 select-none">
                                Mostrando {productosOrdenados.length} artículos encontrados
                            </p>

                            {/* Grilla expandida responsiva */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
                                {productosOrdenados.map((unProducto) => (
                                    <TarjetaProducto key={`catalogo-${unProducto.id}`} unProducto={unProducto} />
                                ))}
                            </div>
                        </div>
                    )}
                </main>

            </div>
        </div>
    );
}