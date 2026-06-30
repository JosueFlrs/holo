// components/barraNavegacion.jsx
'use client';

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { clienteSupabase } from "@/utilities/clienteSupabase";
import CarritoCompras from "./carritoCompras";
import { Menu, X, ChevronDown, Search } from "lucide-react";

export default function BarraNavegacion() {
    const enrutador = useRouter();
    const parametrosUrl = useSearchParams();
    const rutaActual = usePathname();

    const [categorias, setCategorias] = useState([]);
    const [menuCelularAbierto, setMenuCelularAbierto] = useState(false);
    const [desplegableAbierto, setDesplegableAbierto] = useState(false);
    const [mostrarBuscador, setMostrarBuscador] = useState(false);
    const [textoBusquedaNav, setTextoBusquedaNav] = useState("");
    const referenciaInput = useRef(null);
    const idTemporizador = useRef(null);

    // 1. NUEVO ESTADO: Detectar si el usuario se desplazó hacia abajo
    const [usuarioHizoScroll, setUsuarioHizoScroll] = useState(false);

    useEffect(() => {
        const manejarScrollDePantalla = () => {
            if (window.scrollY > 20) {
                setUsuarioHizoScroll(true);
            } else {
                setUsuarioHizoScroll(false);
            }
        };

        // Escuchamos el movimiento del scroll apenas se monta el componente
        window.addEventListener("scroll", manejarScrollDePantalla);
        return () => {
            window.removeEventListener("scroll", manejarScrollDePantalla);
        };
    }, []);

    useEffect(() => {
        async function obtenerCategoriasNav() {
            const { data } = await clienteSupabase
                .from("categorias")
                .select("id, nombreCategoria")
                .order("nombreCategoria", { ascending: true });
            if (data) setCategorias(data);
        }
        obtenerCategoriasNav();
    }, []);

    useEffect(() => {
        return () => {
            if (idTemporizador.current) clearTimeout(idTemporizador.current);
        };
    }, []);

    useEffect(() => {
        if (mostrarBuscador && referenciaInput.current) {
            referenciaInput.current.focus();
        }
    }, [mostrarBuscador]);

    useEffect(() => {
        const queryBuscar = parametrosUrl.get("buscar") || "";
        setTextoBusquedaNav(queryBuscar);
        if (!queryBuscar) setMostrarBuscador(false);
    }, [parametrosUrl]);

    const manejarEntradaMouse = () => {
        if (idTemporizador.current) {
            clearTimeout(idTemporizador.current);
            idTemporizador.current = null;
        }
        setDesplegableAbierto(true);
    };

    const manejarSalidaMouse = () => {
        idTemporizador.current = setTimeout(() => {
            setDesplegableAbierto(false);
        }, 500);
    };

    const ejecutarBusquedaNavbar = (e) => {
        if (e) e.preventDefault();
        if (textoBusquedaNav.trim()) {
            enrutador.push(`/productos?buscar=${encodeURIComponent(textoBusquedaNav.trim())}`);
        } else {
            enrutador.push("/productos");
            setMostrarBuscador(false);
        }
    };

    return (
        // Mantenemos el fixed universal que estructuramos antes para que no se rompa productos
        <div className="fixed top-0 left-0 w-full px-4 pt-4 pb-2 bg-transparent select-none z-50">

            {/* 2. ANIMACIÓN DINÁMICA AQUÍ: 
               Modificamos las clases del header. Si está arriba de todo es transparente y sin bordes.
               Apenas hace scroll, adquiere el color de fondo naranja, el blur y los bordes con una transición suave. */}
            <header className={`max-w-5xl mx-auto transition-all duration-500 ease-in-out ${rutaActual !== "/"
                    ? "bg-primary/85 backdrop-blur-xl shadow-lg border-white/20 rounded-4xl border"
                    : usuarioHizoScroll
                        ? "bg-primary/85 backdrop-blur-xl shadow-lg border-white/20 rounded-4xl border"
                        : "bg-transparent shadow-none border-transparent rounded-4xl border"
                }`}>

                <div className="w-full px-6 h-16 flex items-center justify-between">

                    {/* VISTA A: MODO BUSCADOR EXPANDIDO */}
                    {mostrarBuscador ? (
                        <form
                            onSubmit={ejecutarBusquedaNavbar}
                            className="w-full h-full flex items-center gap-4 animate-in fade-in duration-200"
                        >
                            <Search className="h-5 w-5 text-background/60 shrink-0" />
                            <input
                                ref={referenciaInput}
                                type="text"
                                placeholder="Escribí el nombre del sticker que buscás y apretá Enter..."
                                value={textoBusquedaNav}
                                onChange={(e) => setTextoBusquedaNav(e.target.value)}
                                className="w-full h-full bg-transparent text-background font-base text-sm focus:outline-none placeholder:text-background/50"
                            />
                            <button
                                type="button"
                                onClick={() => {
                                    setMostrarBuscador(false);
                                    setTextoBusquedaNav("");
                                }}
                                className="p-2 text-background/60 hover:text-background hover:bg-white/10 rounded-xl transition-all cursor-pointer shrink-0"
                                title="Cerrar búsqueda"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </form>
                    ) : (

                        // VISTA B: MODO NAVBAR ESTÁNDAR
                        <>
                            {/* LOGO */}
                            <Link href="/" className="flex items-center gap-3 select-none hover:opacity-90 transition-opacity">
                                {/* Modificación sutil: el fondo del logo H cambia según el scroll para no perder contraste */}
                                <div className={`h-9 w-9 rounded-xl flex items-center justify-center font-retro text-xl shadow-sm transition-colors duration-500 ${usuarioHizoScroll ? "bg-background text-primary" : "bg-white/20 text-white backdrop-blur-md"
                                    }`}>
                                    H
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-retro text-2xl text-background tracking-wide leading-none">
                                        HOLO
                                    </span>
                                    <span className="font-base text-[10px] font-semibold text-background/70 tracking-wider uppercase mt-0.5">
                                        Stickers & Más
                                    </span>
                                </div>
                            </Link>

                            {/* MENÚ ESCRITORIO */}
                            <div className="hidden md:flex items-center gap-8">
                                <Link
                                    href="/"
                                    className="font-base text-xs font-bold uppercase tracking-wider text-background hover:text-background/80 transition-colors"
                                >
                                    Inicio
                                </Link>

                                <div
                                    className="relative"
                                    onMouseEnter={manejarEntradaMouse}
                                    onMouseLeave={manejarSalidaMouse}
                                >
                                    <button className="flex items-center gap-1 font-base text-xs font-bold uppercase tracking-wider text-background hover:text-background/80 transition-colors cursor-pointer py-1">
                                        Productos
                                        <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${desplegableAbierto ? "rotate-180" : ""}`} />
                                    </button>

                                    {desplegableAbierto && (
                                        <div className="absolute left-0 w-52 bg-white border border-slate-100 shadow-2xl rounded-xl py-2 mt-3 animate-in fade-in slide-in-from-top-2 duration-200 z-60">
                                            <Link
                                                href="/productos"
                                                className="block px-4 py-2.5 text-xs font-base font-bold uppercase tracking-wider text-primary hover:bg-primary/5 transition-colors"
                                                onClick={() => setDesplegableAbierto(false)}
                                            >
                                                Ver Todos
                                            </Link>
                                            <div className="border-t border-slate-100 my-1"></div>
                                            {categorias.map((cat) => (
                                                <Link
                                                    key={`nav-drop-${cat.id}`}
                                                    href={`/productos?categoria=${encodeURIComponent(cat.nombreCategoria)}`}
                                                    className="block px-4 py-2.5 text-xs font-base font-medium text-slate-700 hover:bg-primary/5 hover:text-primary transition-colors"
                                                    onClick={() => setDesplegableAbierto(false)}
                                                >
                                                    {cat.nombreCategoria}
                                                </Link>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <Link
                                    href="/contacto"
                                    className="font-base text-xs font-bold uppercase tracking-wider text-background hover:text-background/80 transition-colors"
                                >
                                    Contacto
                                </Link>
                            </div>

                            {/* ACCIONES DE LA DERECHA */}
                            <div className="flex items-center gap-2 text-background">
                                <button
                                    onClick={() => setMostrarBuscador(true)}
                                    className="p-2.5 text-background hover:bg-white/10 rounded-xl transition-all cursor-pointer"
                                    title="Buscar productos"
                                >
                                    <Search className="h-5 w-5" />
                                </button>

                                <CarritoCompras />

                                <button
                                    onClick={() => setMenuCelularAbierto(!menuCelularAbierto)}
                                    className="p-2.5 text-background hover:bg-white/10 rounded-xl transition-all md:hidden cursor-pointer ml-1"
                                >
                                    {menuCelularAbierto ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                                </button>
                            </div>
                        </>
                    )}
                </div>

                {/* MENÚ DESPLEGABLE CELULARES (Adquiere fondo sólido si se abre para que sea legible) */}
                {!mostrarBuscador && menuCelularAbierto && (
                    <div className="md:hidden border-t border-white/10 bg-primary px-6 py-6 flex flex-col gap-5 w-full rounded-b-2xl">
                        <Link
                            href="/"
                            className="font-base text-sm font-bold uppercase tracking-wider text-background py-1 border-b border-white/10"
                            onClick={() => setMenuCelularAbierto(false)}
                        >
                            Inicio
                        </Link>
                        <div className="flex flex-col gap-2">
                            <span className="font-base text-[10px] font-bold text-background/60 uppercase tracking-widest mb-1">
                                Catálogo de Productos
                            </span>
                            <Link
                                href="/productos"
                                className="font-base text-sm font-bold text-background pl-2 py-1"
                                onClick={() => setMenuCelularAbierto(false)}
                            >
                                • Todos los productos
                            </Link>
                            {categorias.map((cat) => (
                                <Link
                                    key={`nav-mob-${cat.id}`}
                                    href={`/productos?categoria=${encodeURIComponent(cat.nombreCategoria)}`}
                                    className="font-base text-sm font-medium text-background/90 pl-2 py-1 hover:text-background transition-colors"
                                    onClick={() => setMenuCelularAbierto(false)}
                                >
                                    • {cat.nombreCategoria}
                                </Link>
                            ))}
                        </div>
                        <Link
                            href="/contacto"
                            className="font-base text-sm font-bold uppercase tracking-wider text-background py-2 border-t border-white/10 mt-1"
                            onClick={() => setMenuCelularAbierto(false)}
                        >
                            Contacto
                        </Link>
                    </div>
                )}
            </header>
        </div>
    );
}