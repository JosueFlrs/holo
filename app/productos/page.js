// app/productos/page.js
'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import BarraNavegacion from "@/components/barraNavegacion";
import TarjetaProducto from "@/components/tarjetaProducto";
import { clienteSupabase } from "@/utilities/clienteSupabase";
import { ChevronRight, SlidersHorizontal, ArrowDownCircle, Search, X } from "lucide-react";

const TAMANO_PAGINA = 12;

export default function PaginaTodosLosProductos() {
    const enrutador = useRouter();
    const parametrosUrl = useSearchParams();

    // Leemos tanto la categoría como el término de búsqueda desde la URL
    const categoriaDeEntrada = parametrosUrl.get("categoria");
    const terminoDeEntrada = parametrosUrl.get("buscar") || "";

    const [productos, setProductos] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("Todos");
    const [criterioOrden, setCriterioOrden] = useState("novedades");
    const [estaCargando, setEstaCargando] = useState(true);
    const [cargandoMas, setCargandoMas] = useState(false);
    const [paginaActual, setPaginaActual] = useState(0);
    const [hayMasProductos, setHayMasProductos] = useState(true);

    // Estado para controlar el input de búsqueda
    const [textoBusqueda, setTextoBusqueda] = useState(terminoDeEntrada);

    // Sincronizar input si cambia la URL externamente (ej: desde la lupa de la Navbar)
    useEffect(() => {
        setTextoBusqueda(terminoDeEntrada);
    }, [terminoDeEntrada]);

    // Cargar categorías una sola vez
    useEffect(() => {
        async function cargarCategorias() {
            const { data } = await clienteSupabase
                .from("categorias")
                .select("id, nombreCategoria");
            if (data) setCategorias(data);
        }
        cargarCategorias();
    }, []);

    // Sincronizar categoría de entrada de la URL
    useEffect(() => {
        if (categoriaDeEntrada) {
            setCategoriaSeleccionada(categoriaDeEntrada);
        } else {
            setCategoriaSeleccionada("Todos");
        }
        setPaginaActual(0);
    }, [categoriaDeEntrada]);

    // EFECTO CENTRAL: Filtros y paginación desde el servidor de Supabase
    useEffect(() => {
        async function consultarSupabase() {
            if (paginaActual === 0) {
                setEstaCargando(true);
            } else {
                setCargandoMas(true);
            }

            const desde = paginaActual * TAMANO_PAGINA;
            const hasta = desde + TAMANO_PAGINA - 1;

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

            // Si hay un término en la URL, filtramos en Postgres por nombre del producto
            if (terminoDeEntrada) {
                consulta = consulta.ilike('nombreProducto', `%${terminoDeEntrada}%`);
            }

            if (categoriaSeleccionada !== "Todos") {
                consulta = consulta.eq('categorias.nombreCategoria', categoriaSeleccionada);
            }

            // Ordenamiento
            switch (criterioOrden) {
                case "precio-menor":
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

            const { data: nuevosProductos, error } = await consulta.range(desde, hasta);

            if (error) {
                console.error("Error al paginar productos:", error);
            }

            if (nuevosProductos) {
                if (nuevosProductos.length < TAMANO_PAGINA) {
                    setHayMasProductos(false);
                } else {
                    setHayMasProductos(true);
                }

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
    }, [categoriaSeleccionada, criterioOrden, paginaActual, terminoDeEntrada]);

    // Ejecutar búsqueda al presionar ENTER o botón Buscar
    const manejarSubmitBusqueda = (e) => {
        e.preventDefault();
        setPaginaActual(0);

        const params = new URLSearchParams(window.location.search);
        if (textoBusqueda.trim()) {
            params.set("buscar", textoBusqueda.trim());
        } else {
            params.delete("buscar");
        }
        enrutador.push(`/productos?${params.toString()}`);
    };

    // Limpiar el buscador por completo
    const limpiarBuscador = () => {
        setTextoBusqueda("");
        setPaginaActual(0);
        const params = new URLSearchParams(window.location.search);
        params.delete("buscar");
        enrutador.push(`/productos?${params.toString()}`);
    };

    const manejarCambioFiltro = (nombreCat) => {
        const params = new URLSearchParams(window.location.search);
        if (nombreCat === "Todos") {
            params.delete("categoria");
        } else {
            params.set("categoria", nombreCat);
        }
        enrutador.push(`/productos?${params.toString()}`);
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

            {/* SECCIÓN SUPERIOR UNIFICADA: Ruta, Buscador Central y Ordenamiento */}
            <div className="max-w-7xl mx-auto px-6 pt-8 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/40 select-none">

                {/* 1. RUTA (BREADCRUMBS) */}
                <nav className="flex items-center gap-1.5 font-base text-xs font-bold text-foreground/40 uppercase tracking-wider shrink-0 w-full md:w-auto">
                    <Link href="/" className="hover:text-primary transition-colors">
                        Inicio
                    </Link>
                    <ChevronRight className="h-3.5 w-3.5 text-foreground/30" />
                    <span className="text-foreground/80">Productos</span>
                </nav>

                {/* 2. BARRA DE BÚSQUEDA INTERNA CENTRAL */}
                <div className="w-full md:max-w-md flex justify-center">
                    <form onSubmit={manejarSubmitBusqueda} className="relative w-full flex gap-2">
                        <div className="relative flex-1">
                            <input
                                type="text"
                                placeholder="Buscar stickers por nombre..."
                                value={textoBusqueda}
                                onChange={(e) => setTextoBusqueda(e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-10 py-2 text-xs focus:outline-none focus:border-primary shadow-sm text-slate-800 font-base"
                            />
                            <Search className="absolute left-3.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                            {textoBusqueda && (
                                <button
                                    type="button"
                                    onClick={limpiarBuscador}
                                    className="absolute right-3 top-2.5 p-0.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
                                >
                                    <X className="h-3.5 w-3.5" />
                                </button>
                            )}
                        </div>
                        <button
                            type="submit"
                            className="bg-primary hover:bg-primary/90 text-white px-4 rounded-xl text-[10px] font-base font-bold uppercase tracking-wider shadow-sm transition-colors cursor-pointer"
                        >
                            Buscar
                        </button>
                    </form>
                </div>

                {/* 3. ORDENAMIENTO */}
                <div className="flex items-center gap-2 w-full md:w-auto justify-end shrink-0">
                    <label htmlFor="ordenar" className="font-base text-xs font-bold uppercase tracking-wider text-foreground/50 hidden lg:inline-block">
                        Ordenar por:
                    </label>
                    <select
                        id="ordenar"
                        value={criterioOrden}
                        onChange={(e) => manejarCambioOrden(e.target.value)}
                        className="text-xs font-base font-bold uppercase tracking-wider bg-white border border-slate-200/80 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-primary cursor-pointer shadow-sm min-w-45 w-full md:w-auto"
                    >
                        <option value="novedades">Más nuevos primero</option>
                        <option value="antiguo">Más viejos primero</option>
                        <option value="precio-menor">Precio: Menor a Mayor</option>
                        <option value="precio-mayor">Precio: Mayor a Menor</option>
                    </select>
                </div>
            </div>

            {/* LAYOUT DE COLUMNAS */}
            <div className="max-w-7xl mx-auto px-6 mt-6 flex flex-col lg:flex-row gap-10">

                {/* SIDEBAR DE CATEGORÍAS */}
                <aside className="w-full lg:w-64 shrink-0">
                    <div className="bg-white/40 border border-slate-200/40 rounded-2xl p-5 sticky top-30">
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
                            Filtrando catálogo en Supabase...
                        </div>
                    ) : productos.length === 0 ? (
                        <div className="text-center font-base text-foreground/40 py-20 bg-white/40 rounded-2xl border border-dashed border-slate-200/80 px-4">
                            No encontramos stickers que coincidan con "{terminoDeEntrada || categoriaSeleccionada}". ¡Probá con otra palabra!
                        </div>
                    ) : (
                        <div>
                            <p className="font-base text-[10px] font-bold text-foreground/40 uppercase tracking-widest mb-6 select-none">
                                {terminoDeEntrada ? `Resultados para "${terminoDeEntrada}": ` : ""}Viendo {productos.length} diseños cargados en pantalla
                            </p>

                            {/* Grilla principal con 2 columnas fijas en celulares */}
                            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-3 sm:gap-6">
                                {productos.map((unProducto) => (
                                    <TarjetaProducto key={`server-catalogo-${unProducto.id}`} unProducto={unProducto} />
                                ))}
                            </div>

                            {/* BOTÓN DINÁMICO DE CARGAR MÁS */}
                            {hayMasProductos && (
                                <div className="flex justify-center mt-14">
                                    <button
                                        disabled={cargandoMas}
                                        onClick={manejarCargarMas}
                                        className="group font-retro text-sm px-8 py-3.5 bg-primary text-white hover:bg-primary/90 disabled:bg-primary/50 rounded-2xl shadow-md transition-all duration-300 hover:scale-105 hover:shadow-lg tracking-wider uppercase flex items-center gap-2 cursor-pointer"
                                    >
                                        <ArrowDownCircle className={`h-4 w-4 transition-transform ${cargandoMas ? 'animate-spin' : 'group-hover:translate-y-0.5'}`} />
                                        {cargandoMas ? 'Buscando más...' : 'Cargar más productos'}
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