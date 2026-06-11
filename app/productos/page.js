// app/productos/page.js
'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import BarraNavegacion from "@/components/barraNavegacion";
import TarjetaProducto from "@/components/tarjetaProducto";
import { clienteSupabase } from "@/utilities/clienteSupabase";
import { ChevronRight, SlidersHorizontal, ArrowDownCircle } from "lucide-react";

const TAMANO_PAGINA = 12;

export default function PaginaTodosLosProductos() {
    const parametrosUrl = useSearchParams();
    const categoriaDeEntrada = parametrosUrl.get("categoria");
    const [productos, setProductos] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("Todos");
    const [criterioOrden, setCriterioOrden] = useState("novedades");
    const [estaCargando, setEstaCargando] = useState(true);
    const [cargandoMas, setCargandoMas] = useState(false);

    // Controlamos la página actual para calcular el rango en Supabase
    const [paginaActual, setPaginaActual] = useState(0);
    // Flag para saber si llegamos al final del catálogo en la base de datos
    const [hayMasProductos, setHayMasProductos] = useState(true);

    useEffect(() => {
        if (categoriaDeEntrada) {
            setCategoriaSeleccionada(categoriaDeEntrada);
        }
    }, [categoriaDeEntrada]);

    // 1. Cargar las categorías una sola vez al montar el componente
    useEffect(() => {
        async function cargarCategorias() {
            const { data } = await clienteSupabase
                .from("categorias")
                .select("id, nombreCategoria");
            if (data) setCategorias(data);
        }
        cargarCategorias();
    }, []);

    // 2. Efecto central: Se dispara CADA VEZ que cambia la categoría, el orden o la página solicitada
    useEffect(() => {
        async function consultarSupabase() {
            if (paginaActual === 0) {
                setEstaCargando(true);
            } else {
                setCargandoMas(true);
            }

            // Calculamos los índices de registros exactos que le pediremos a Postgres
            const desde = paginaActual * TAMANO_PAGINA;
            const hasta = desde + TAMANO_PAGINA - 1;

            // Armamos la query base
            let consulta = clienteSupabase
                .from('productos')
                .select(`
          id,
          nombreProducto,
          descripcion,
          created_at,
          categorias!inner ( id, nombreCategoria ),
          variantesProducto ( id, nombreVariante, precioUnitario, urlImagen )
        `);

            // Aplicamos el filtro de categoría directamente en el motor de Base de Datos si corresponde
            if (categoriaSeleccionada !== "Todos") {
                consulta = consulta.eq('categorias.nombreCategoria', categoriaSeleccionada);
            }

            // Aplicamos el ordenamiento dinámico desde el servidor para que el rango sea preciso
            switch (criterioOrden) {
                case "precio-menor":
                    // Ordena por el precio unitario de su variante de forma ascendente
                    consulta = consulta.order('precioUnitario', { foreignTable: 'variantesProducto', ascending: true });
                    break;
                case "precio-mayor":
                    consulta = consulta.order('precioUnitario', { foreignTable: 'variantesProducto', ascending: false });
                    break;
                case "antiguo":
                    consulta = consulta.order('created_at', { ascending: true });
                    break;
                case "novedades":
                default:
                    consulta = consulta.order('created_at', { ascending: false });
                    break;
            }

            // CAMBIO ESTRATÉGICO: Pedimos únicamente el bloque de registros solicitado
            const { data: nuevosProductos, error } = await consulta.range(desde, hasta);

            if (error) {
                console.error("Error al paginar productos:", error);
            }

            if (nuevosProductos) {
                // Si la respuesta vino con menos elementos del tamaño de página, significa que no quedan más
                if (nuevosProductos.length < TAMANO_PAGINA) {
                    setHayMasProductos(false);
                } else {
                    setHayMasProductos(true);
                }

                // Si es la página 0, reiniciamos el array. Si es una página avanzada, los agregamos al final
                if (paginaActual === 0) {
                    setProductos(nuevosProductos);
                } else {
                    setProductos((previos) => [...previos, ...nuevosProductos]);
                }
            }

            setEstaCargando(false);
            setCargandoMas(false);
        }

        consultarSupabase();
    }, [categoriaSeleccionada, criterioOrden, paginaActual]);

    // Si el usuario cambia el filtro o el orden, reseteamos la paginación a la hoja 0
    const manejarCambioFiltro = (nombreCat) => {
        setCategoriaSeleccionada(nombreCat);
        setPaginaActual(0);
    };

    const manejarCambioOrden = (nuevoOrden) => {
        setCriterioOrden(nuevoOrden);
        setPaginaActual(0);
    };

    const manejarCargarMas = () => {
        setPaginaActual((previo) => previo + 1);
    };

    return (
        <div className="min-h-screen bg-background pb-20">
            <BarraNavegacion />

            {/* SECCIÓN SUPERIOR: Ruta e Inserción de Ordenamiento */}
            <div className="max-w-7xl mx-auto px-6 pt-8 pb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200/40 select-none">
                <nav className="flex items-center gap-1.5 font-base text-xs font-bold text-foreground/40 uppercase tracking-wider">
                    <Link href="/" className="hover:text-primary transition-colors">
                        Inicio
                    </Link>
                    <ChevronRight className="h-3.5 w-3.5 text-foreground/30" />
                    <span className="text-foreground/80">Productos</span>
                </nav>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    <label htmlFor="ordenar" className="font-base text-xs font-bold uppercase tracking-wider text-foreground/50 hidden md:inline-block">
                        Ordenar por:
                    </label>
                    <select
                        id="ordenar"
                        value={criterioOrden}
                        onChange={(e) => manejarCambioOrden(e.target.value)}
                        className="text-xs font-base font-bold uppercase tracking-wider bg-white border border-slate-200/80 rounded-xl px-3 py-2.5 text-slate-800 focus:outline-none focus:border-primary cursor-pointer shadow-sm min-w-45"
                    >
                        <option value="novedades">Más nuevos primero</option>
                        <option value="antiguo">Más viejos primero</option>
                        <option value="precio-menor">Precio: Menor a Mayor</option>
                        <option value="precio-mayor">Precio: Mayor a Menor</option>
                    </select>
                </div>
            </div>

            {/* LAYOUT DE COLUMNAS */}
            <div className="max-w-7xl mx-auto px-6 mt-10 flex flex-col lg:flex-row gap-10">

                {/* SIDEBAR DE CATEGORÍAS */}
                <aside className="w-full lg:w-64 shrink-0">
                    <div className="bg-white/40 border border-slate-200/40 rounded-2xl p-5 sticky top-24">
                        <h2 className="font-retro text-lg text-slate-900 mb-4 flex items-center gap-2 select-none">
                            <SlidersHorizontal className="h-4 w-4 text-primary" />
                            Categorías
                        </h2>

                        <div className="flex flex-row lg:flex-col flex-wrap gap-1">
                            <button
                                onClick={() => manejarCambioFiltro("Todos")}
                                className={`w-auto lg:w-full text-left text-xs font-base font-bold uppercase tracking-wider px-4 py-3 rounded-xl transition-all cursor-pointer ${categoriaSeleccionada === "Todos"
                                    ? 'bg-accent text-background shadow-sm translate-x-1 lg:translate-x-2'
                                    : 'text-foreground/70 hover:bg-slate-100/60 hover:text-foreground'
                                    }`}
                            >
                                Todos los productos
                            </button>

                            {categorias.map((cat) => {
                                const esActivo = categoriaSeleccionada === cat.nombreCategoria;
                                return (
                                    <button
                                        key={`sidebar-cat-${cat.id}`}
                                        onClick={() => manejarCambioFiltro(cat.nombreCategoria)}
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

                {/* CONTENIDO DE PRODUCTOS */}
                <main className="flex-1">
                    {estaCargando ? (
                        <div className="text-center font-base text-foreground/40 py-24 animate-pulse font-bold">
                            Consultando rango en Supabase...
                        </div>
                    ) : productos.length === 0 ? (
                        <div className="text-center font-base text-foreground/40 py-20 bg-white/40 rounded-2xl border border-dashed border-slate-200/80">
                            No se encontraron productos en esta sección.
                        </div>
                    ) : (
                        <div>
                            {/* Grilla principal */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
                                {productos.map((unProducto) => (
                                    <TarjetaProducto key={`server-catalogo-${unProducto.id}`} unProducto={unProducto} />
                                ))}
                            </div>

                            {/* BOTÓN DINÁMICO DE CARGAR MÁS CON LAZADO DE SERVIDOR */}
                            {hayMasProductos && (
                                <div className="flex justify-center mt-14">
                                    <button
                                        disabled={cargandoMas}
                                        onClick={manejarCargarMas}
                                        className="group font-retro text-sm px-8 py-3.5 bg-primary text-white hover:bg-primary/90 disabled:bg-primary/50 rounded-2xl shadow-md transition-all duration-300 hover:scale-105 hover:shadow-lg tracking-wider uppercase flex items-center gap-2 cursor-pointer"
                                    >
                                        <ArrowDownCircle className={`h-4 w-4 transition-transform ${cargandoMas ? 'animate-spin' : 'group-hover:translate-y-0.5'}`} />
                                        {cargandoMas ? 'Pidiendo más stickers...' : 'Cargar más productos'}
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </main>

            </div>
        </div>
    );
}