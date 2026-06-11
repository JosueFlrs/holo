// components/barraNavegacion.jsx
'use client';

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { clienteSupabase } from "@/utilities/clienteSupabase";
import CarritoCompras from "./carritoCompras";
import { Menu, X, ChevronDown, Search } from "lucide-react";

export default function BarraNavegacion() {
    const enrutador = useRouter();
    const parametrosUrl = useSearchParams();
    const [categorias, setCategorias] = useState([]);
    const [menuCelularAbierto, setMenuCelularAbierto] = useState(false);
    const [desplegableAbierto, setDesplegableAbierto] = useState(false);

    const idTemporizador = useRef(null);

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

    return (
        // CONTENEDOR FLOTANTE
        <div className="sticky top-0 z-50 w-full px-4 pt-4 pb-2 bg-transparent select-none">

            {/* LA ISLA: Bajamos la opacidad a 85% y subimos el blur para un efecto cristal naranja premium */}
            <header className="max-w-5xl mx-auto bg-primary/85 backdrop-blur-xl transition-all duration-300 shadow-lg rounded-2xl border border-white/20">

                <div className="w-full px-6 h-16 flex items-center justify-between">

                    {/* LOGO */}
                    <Link href="/" className="flex items-center gap-3 select-none hover:opacity-90 transition-opacity">
                        <div className="h-9 w-9 bg-background rounded-xl flex items-center justify-center text-primary font-retro text-xl shadow-sm">
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

                            {/* DROPDOWN: Ahora no se corta porque el padre NO tiene overflow-hidden */}
                            {desplegableAbierto && (
                                <div className="absolute left-0 w-52 bg-white border border-slate-100 shadow-2xl rounded-xl py-2 mt-3 animate-in fade-in slide-in-from-top-2 duration-200 z-60 ">
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

                    {/* ACCIONES DERECHA */}
                    <div className="flex items-center gap-2 text-background">
                        <button
                            onClick={() => enrutador.push("/productos")}
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
                </div>

                {/* MENÚ CELULAR: Agregamos rounded-b-2xl para que el final del menú también sea curvo */}
                {menuCelularAbierto && (
                    <div className="md:hidden border-t border-white/10 bg-primary px-6 py-6 flex flex-col gap-5 animate-in fade-in slide-in-from-top-2 duration-200 w-full rounded-b-2xl">
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