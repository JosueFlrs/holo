// components/tarjetaProducto.jsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { usarCarrito } from "@/store/usarCarrito";
import { ShoppingCart, Plus, Minus, X } from "lucide-react";

export default function TarjetaProducto({ unProducto }) {
    const enrutador = useRouter();
    const agregarAlCarrito = usarCarrito.getState().agregarAlCarrito;

    // --- ESTADOS PARA EL MODAL DE PRE-COMPRA ---
    const [modalAbierto, setModalAbierto] = useState(false);
    const [cantidadSeleccionada, setCantidadSeleccionada] = useState(1);

    const varianteInicial = unProducto.variantesProducto && unProducto.variantesProducto.length > 0
        ? unProducto.variantesProducto[0]
        : null;

    if (!varianteInicial) return null;

    const generarSlug = (texto) => {
        return texto
            .toLowerCase()
            .trim()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '');
    };

    const manejarRedireccion = () => {
        const urlLimpia = generarSlug(unProducto.nombreProducto);
        enrutador.push(`/productos/${urlLimpia}`);
    };

    // Abre el modal intermedio deteniendo la redirección de la tarjeta
    const abrirModalConfirmacion = (evento) => {
        evento.stopPropagation();
        setCantidadSeleccionada(1); // Reseteamos a 1 cada vez que abre
        setModalAbierto(true);
    };

    // Ejecuta la inserción real en tu store de Zustand multiplicando por la cantidad elegida
    const confirmarAgregarAlCarrito = () => {
        // Tu store actual suma de a 1, por lo que podemos adaptarlo ejecutando un bucle 
        // o modificando el artículo. Para no romper tu usarCarrito.js actual, lo sumamos las veces seleccionadas:
        for (let i = 0; i < cantidadSeleccionada; i++) {
            agregarAlCarrito(varianteInicial, unProducto);
        }
        setModalAbierto(false);
    };

    return (
        <>
            <Card
                onClick={manejarRedireccion}
                className="group bg-transparent shadow-none hover:shadow-xl hover:shadow-slate-200/80 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1.5 cursor-pointer relative p-2"
            >
                <div>
                    <div className="relative aspect-square w-full bg-background rounded-2xl overflow-hidden">
                        <img
                            src={varianteInicial.urlImagen || "https://images.unsplash.com/photo-1572375995301-4598b2c20ce4?w=500"}
                            alt={unProducto.nombreProducto}
                            className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                        />

                        {unProducto.categorias && (
                            <span className="absolute top-3 left-3 bg-accent text-white font-base font-bold text-[10px] px-2.5 py-1 rounded-full shadow-sm tracking-wide uppercase">
                                {unProducto.categorias.nombreCategoria}
                            </span>
                        )}
                    </div>

                    <CardContent className="p-4 pb-1 text-center">
                        <h3 className="font-retro text-lg text-slate-900 leading-tight group-hover:text-primary transition-colors duration-200 line-clamp-1">
                            {unProducto.nombreProducto}
                        </h3>
                    </CardContent>
                </div>

                <CardFooter className="p-4 pt-0 flex flex-col items-center justify-center w-full pb-2">
                    <span className="font-retro text-xl text-slate-900 tracking-wide">
                        ${Number(varianteInicial.precioUnitario).toLocaleString('es-AR')}
                    </span>

                    {/* BOTÓN PARA CELULARES */}
                    <div className="w-full mt-3 md:hidden">
                        <Button
                            size="sm"
                            className="w-full bg-primary hover:bg-primary/90 text-white font-base font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all h-10 gap-2 cursor-pointer"
                            onClick={abrirModalConfirmacion}
                        >
                            <ShoppingCart className="h-4 w-4" />
                            Añadir
                        </Button>
                    </div>

                    {/* BOTÓN FLOTANTE PARA COMPUTADORAS */}
                    <div className="hidden md:block w-full mt-3 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 absolute bottom-2 left-0 px-4 bg-background/90 backdrop-blur-sm py-1 z-10">
                        <Button
                            size="sm"
                            className="w-full bg-primary hover:bg-primary/90 text-white font-base font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all h-10 gap-2 cursor-pointer"
                            onClick={abrirModalConfirmacion}
                        >
                            <ShoppingCart className="h-4 w-4" />
                            Añadir al carrito
                        </Button>
                    </div>
                </CardFooter>
            </Card>

            {/* --- MODAL ELEGANTE DE RESUMEN Y CANTIDAD (QUICK VIEW) --- */}
            {modalAbierto && (
                <div 
                    className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200"
                    onClick={() => setModalAbierto(false)} // Cierra al hacer clic en el fondo
                >
                    <div 
                        className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl border border-slate-100 relative animate-in zoom-in-95 duration-200 flex flex-col gap-5 select-none"
                        onClick={(e) => e.stopPropagation()} // Evita que se cierre al tocar dentro del modal
                    >
                        {/* Botón X de cierre absoluto */}
                        <button 
                            onClick={() => setModalAbierto(false)}
                            className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all cursor-pointer"
                        >
                            <X className="h-4 w-4" />
                        </button>

                        {/* Título */}
                        <h4 className="font-retro text-lg text-slate-900 tracking-wide pr-6">
                            ¿Cuánto te vas a llevar?
                        </h4>

                        {/* Resumen del Sticker: Foto, Nombre y Precio */}
                        <div className="flex items-center gap-4 bg-background/60 p-3 rounded-2xl border border-slate-100">
                            <div className="h-16 w-16 bg-white rounded-xl overflow-hidden border border-slate-100 shrink-0">
                                <img 
                                    src={varianteInicial.urlImagen || "https://images.unsplash.com/photo-1572375995301-4598b2c20ce4?w=500"} 
                                    alt={unProducto.nombreProducto} 
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="flex flex-col min-w-0">
                                <span className="font-retro text-base text-slate-900 truncate">
                                    {unProducto.nombreProducto}
                                </span>
                                <span className="font-base text-xs text-foreground/50 truncate">
                                    {varianteInicial.nombreVariante !== "Default" ? varianteInicial.nombreVariante : "Tamaño estándar"}
                                </span>
                                <span className="font-retro text-sm text-primary mt-0.5">
                                    ${Number(varianteInicial.precioUnitario).toLocaleString('es-AR')}
                                </span>
                            </div>
                        </div>

                        {/* Selector de Cantidades */}
                        <div className="flex flex-col items-center gap-2 mt-1">
                            <span className="font-base text-[10px] font-bold text-foreground/40 uppercase tracking-widest">
                                Seleccionar Cantidad
                            </span>
                            <div className="flex items-center bg-slate-50 border border-slate-200/80 rounded-2xl p-1 shadow-inner">
                                <button
                                    disabled={cantidadSeleccionada <= 1}
                                    onClick={() => setCantidadSeleccionada(prev => prev - 1)}
                                    className="p-2 text-slate-600 hover:bg-white rounded-xl transition-all disabled:opacity-40 cursor-pointer"
                                >
                                    <Minus className="h-4 w-4" />
                                </button>
                                <span className="font-retro text-lg text-slate-800 w-12 text-center">
                                    {cantidadSeleccionada}
                                </span>
                                <button
                                    onClick={() => setCantidadSeleccionada(prev => prev + 1)}
                                    className="p-2 text-slate-600 hover:bg-white rounded-xl transition-all cursor-pointer"
                                >
                                    <Plus className="h-4 w-4" />
                                </button>
                            </div>
                        </div>

                        {/* Botones de Acción con Jerarquías Estrictas */}
                        <div className="flex flex-col gap-2 mt-2 w-full">
                            {/* Botón Principal: Llamativo NaranjaHolo */}
                            <Button
                                onClick={confirmarAgregarAlCarrito}
                                className="w-full bg-primary hover:bg-primary/90 text-white font-base font-bold text-xs uppercase tracking-wider rounded-xl shadow-md h-11 gap-2 cursor-pointer"
                            >
                                <ShoppingCart className="h-4 w-4" />
                                Añadir al carrito (${(varianteInicial.precioUnitario * cantidadSeleccionada).toLocaleString('es-AR')})
                            </Button>

                            {/* Botón Secundario: Solo texto plano, no llamativo */}
                            <button
                                onClick={() => {
                                    setModalAbierto(false);
                                    manejarRedireccion();
                                }}
                                className="w-full text-center py-2.5 text-foreground/50 hover:text-primary transition-colors text-xs font-base font-bold uppercase tracking-wider cursor-pointer"
                            >
                                Ver detalle de producto
                            </button>
                        </div>

                    </div>
                </div>
            )}
        </>
    );
}