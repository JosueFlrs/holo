// components/tarjetaProducto.jsx
'use client';

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { usarCarrito } from "@/store/usarCarrito";
import { ShoppingCart } from "lucide-react";

export default function TarjetaProducto({ unProducto }) {
    const enrutador = useRouter();
    const agregarAlCarrito = usarCarrito.getState().agregarAlCarrito;

    const varianteInicial = unProducto.variantesProducto && unProducto.variantesProducto.length > 0
        ? unProducto.variantesProducto[0]
        : null;

    if (!varianteInicial) return null;

    // Función para transformar el nombre del producto en un slug para la URL
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
        enrutador.push(`/producto/${urlLimpia}`);
    };

    return (
        <Card
            onClick={manejarRedireccion}
            className="group bg-transparent shadow-none hover:shadow-xl hover:shadow-slate-200/80 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1.5 cursor-pointer relative p-2"
        >
            <div>
                {/* Contenedor de la Imagen: bg-background para fusionar los PNGs transparentes */}
                <div className="relative aspect-square w-full bg-background rounded-2xl overflow-hidden">
                    <img
                        src={varianteInicial.urlImagen || "https://images.unsplash.com/photo-1572375995301-4598b2c20ce4?w=500"}
                        alt={unProducto.nombreProducto}
                        className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                    />

                    {/* Tag de Categoría flotante Rosa */}
                    {unProducto.categorias && (
                        <span className="absolute top-3 left-3 bg-accent text-white font-base font-bold text-[10px] px-2.5 py-1 rounded-full shadow-sm tracking-wide uppercase">
                            {unProducto.categorias.nombreCategoria}
                        </span>
                    )}
                </div>

                {/* Detalles Básicos */}
                <CardContent className="p-4 pb-1 text-center">
                    <h3 className="font-retro text-lg text-slate-900 leading-tight group-hover:text-primary transition-colors duration-200 line-clamp-1">
                        {unProducto.nombreProducto}
                    </h3>
                </CardContent>
            </div>

            {/* Footer Fijo con Precio */}
            <CardFooter className="p-4 pt-0 flex flex-col items-center justify-center w-full pb-2">
                <span className="font-retro text-xl text-slate-900 tracking-wide">
                    ${Number(varianteInicial.precioUnitario).toLocaleString('es-AR')}
                </span>

                {/* BOTÓN FLOTANTE: Aparece suavemente desde abajo en el hover */}
                <div className="w-full mt-3 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 absolute bottom-2 left-0 px-4 bg-background/90 backdrop-blur-sm py-1 z-10">
                    <Button
                        size="sm"
                        className="w-full bg-primary hover:bg-primary/90 text-white font-base font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all h-10 gap-2 cursor-pointer"
                        onClick={(evento) => {
                            evento.stopPropagation();
                            agregarAlCarrito(varianteInicial, unProducto);
                        }}
                    >
                        <ShoppingCart className="h-4 w-4" />
                        Añadir al carrito
                    </Button>
                </div>
            </CardFooter>
        </Card>
    );
}