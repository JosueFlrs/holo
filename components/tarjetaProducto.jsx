// components/tarjetaProducto.jsx
'use client';

import { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { usarCarrito } from "@/store/usarCarrito";
import { Plus } from "lucide-react";

export default function TarjetaProducto({ unProducto }) {
    // 1. ZUSTAND HOOK: Siempre arriba, sin condicionales.
    //const agregarAlCarrito = usarCarrito((estado) => estado.agregarAlCarrito);
    const agregarAlCarrito = usarCarrito.getState().agregarAlCarrito;

    // 2. REACT HOOK: Guardamos solo un número (el índice del array), que es 100% estable.
    const [indiceVariante, setIndiceVariante] = useState(0);

    // --- A PARTIR DE AQUÍ YA NO HAY MÁS HOOKS ---

    // Variables derivadas simples (no son hooks, así que no rompen nada al renderizar)
    const variantes = unProducto?.variantesProducto || [];

    // Tomamos la variante activa basándonos en el número que guardó el estado
    const varianteActiva = variantes[indiceVariante] || {
        id: 0,
        nombreVariante: "Sin opciones",
        precioUnitario: 0,
        urlImagen: "https://images.unsplash.com/photo-1572375995301-4598b2c20ce4?w=500"
    };

    return (
        <Card className="bg-white border-2 border-slate-900 rounded-3xl overflow-hidden shadow-md flex flex-col justify-between transition-transform duration-200 hover:-translate-y-1">
            <div>
                {/* Imagen del Producto */}
                <div className="relative aspect-square w-full bg-slate-100 border-b-2 border-slate-900 overflow-hidden">
                    <img
                        src={varianteActiva.urlImagen}
                        alt={unProducto?.nombreProducto}
                        className="object-cover w-full h-full"
                    />
                    {unProducto?.categorias && (
                        <span className="absolute top-3 left-3 bg-accent text-slate-900 font-base font-bold text-xs px-3 py-1 rounded-full border-2 border-slate-900 shadow-sm">
                            {unProducto.categorias.nombreCategoria}
                        </span>
                    )}
                </div>

                <CardHeader className="p-4 pb-1">
                    <CardTitle className="font-retro text-2xl text-slate-950 leading-tight">
                        {unProducto?.nombreProducto}
                    </CardTitle>
                </CardHeader>

                <CardContent className="p-4 pt-0 font-base">
                    <p className="text-xs text-slate-500 mt-1">
                        {unProducto?.descripcion}
                    </p>

                    {/* Selector de Variantes usando el índice */}
                    {variantes.length > 1 && (
                        <div className="mt-4">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                Opciones disponibles:
                            </span>
                            <div className="flex flex-wrap gap-2 mt-1">
                                {variantes.map((variante, index) => (
                                    <button
                                        key={`var-${variante.id}`}
                                        // Al hacer clic, actualizamos el número de índice, no el objeto
                                        onClick={() => setIndiceVariante(index)}
                                        className={`text-xs px-3 py-1.5 rounded-full border-2 transition-all cursor-pointer font-medium ${index === indiceVariante
                                                ? 'bg-primary text-white border-slate-900 shadow-sm font-bold'
                                                : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-400'
                                            }`}
                                    >
                                        {variante.nombreVariante}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </CardContent>
            </div>

            <CardFooter className="p-4 pt-0 flex items-center justify-between border-t border-slate-100 mt-4">
                <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Precio</span>
                    <span className="font-retro text-xl text-slate-950 font-bold">
                        ${Number(varianteActiva.precioUnitario).toLocaleString('es-AR')}
                    </span>
                </div>

                <Button
                    size="sm"
                    className="bg-accent hover:bg-accent/90 text-slate-900 font-base font-bold rounded-full border-2 border-slate-900 shadow-sm cursor-pointer gap-1 h-9"
                    onClick={() => agregarAlCarrito(varianteActiva, unProducto)}
                >
                    <Plus className="h-4 w-4" />
                    Agregar
                </Button>
            </CardFooter>
        </Card>
    );
}