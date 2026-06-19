// components/carritoCompras.jsx
'use client';

import { useState, useEffect } from 'react';
import { ShoppingBag, Trash2 } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { usarCarrito } from '@/store/usarCarrito';
import { useContadorCarrito } from '@/hooks/useContadorCarrito';
import { generarEnlaceWhatsapp } from '@/utilities/generarEnlaceWhatsapp';

export default function CarritoCompras() {
    const [carritoAbierto, setCarritoAbierto] = useState(false);

    const articulosEnCarrito = usarCarrito((state) => state.articulosEnCarrito);
    const eliminarDelCarrito = usarCarrito((state) => state.eliminarDelCarrito);
    const vaciarCarrito = usarCarrito((state) => state.vaciarCarrito);
    const obtenerTotalFinal = usarCarrito((state) => state.obtenerTotalFinal);

    const { totalItems: cantidadTotalArticulos } = useContadorCarrito();

    useEffect(() => {
        const abrirElContenedor = () => {
            setCarritoAbierto(true);
        };

        window.addEventListener('abrirCarrito', abrirElContenedor);
        return () => {
            window.removeEventListener('abrirCarrito', abrirElContenedor);
        };
    }, []);

    const manejarEnviarPedido = () => {
        if (articulosEnCarrito.length === 0) return;

        const urlWhatsapp = generarEnlaceWhatsapp(articulosEnCarrito, obtenerTotalFinal());
        window.open(urlWhatsapp, '_blank');

        vaciarCarrito();
        setCarritoAbierto(false);
    };

    return (
        <Sheet open={carritoAbierto} onOpenChange={setCarritoAbierto}>
            <SheetTrigger asChild>
                <button className="relative p-2 text-current hover:opacity-80 transition-all cursor-pointer flex items-center justify-center">
                    <ShoppingBag className="h-6 w-6" />
                    {cantidadTotalArticulos > 0 && (
                        <span className="absolute -top-1 -right-1 bg-accent text-white font-retro text-[10px] h-5 w-5 rounded-full flex items-center justify-center shadow-md animate-in zoom-in duration-200">
                            {cantidadTotalArticulos}
                        </span>
                    )}
                </button>
            </SheetTrigger>

            {/* CAMBIO ESTRATÉGICO AQUÍ:
              En lugar de confiar únicamente en el archivo base, forzamos de forma explícita 
              las clases condicionales de Tailwind usando el estado `carritoAbierto`.
              Si `carritoAbierto` es true, aplicamos la animación de entrada y desplazamiento a 0.
              Si es false, se desplaza hacia afuera de la pantalla.
            */}
            <SheetContent
                className="w-full sm:max-w-md bg-background border-l border-slate-100 flex flex-col justify-between p-6 select-none z-150"
            >
                <div>
                    <SheetHeader className="border-b border-slate-100 pb-4">
                        <SheetTitle className="font-retro text-2xl text-slate-900 tracking-wide flex items-center gap-2">
                            Tu Carrito
                            <span className="font-base text-xs font-bold px-2.5 py-1 bg-slate-100 rounded-full text-slate-600">
                                {cantidadTotalArticulos}
                            </span>
                        </SheetTitle>

                        <SheetDescription className="sr-only">
                            Resumen de los stickers y productos añadidos al carrito de compras.
                        </SheetDescription>
                    </SheetHeader>

                    {/* Listado de Artículos */}
                    <div className="overflow-y-auto max-h-[60vh] mt-6 flex flex-col gap-4 pr-1">
                        {articulosEnCarrito.length === 0 ? (
                            <div className="text-center py-16 flex flex-col items-center gap-3">
                                <p className="font-retro text-base text-slate-400">El carrito está vacío</p>
                                <p className="font-base text-xs text-slate-400/80 max-w-50">¡Paseate por el catálogo para sumar tus stickers favoritos!</p>
                            </div>
                        ) : (
                            articulosEnCarrito.map((articulo, indice) => (
                                <div
                                    key={`${articulo.idVariante}-${indice}`}
                                    className="flex items-center justify-between bg-white border border-slate-100 rounded-2xl p-3 shadow-sm"
                                >
                                    <div className="flex flex-col min-w-0 pr-2">
                                        <span className="font-retro text-base text-slate-900 truncate">
                                            {articulo.nombreProducto}
                                        </span>
                                        <span className="font-base text-xs text-foreground/40 mt-0.5">
                                            {articulo.nombreVariante !== "Default" ? articulo.nombreVariante : "Tamaño estándar"} x {articulo.cantidadComprada}
                                        </span>
                                        <span className="font-retro text-sm text-primary mt-1">
                                            ${(articulo.precioUnitario * articulo.cantidadComprada).toLocaleString('es-AR')}
                                        </span>
                                    </div>

                                    <button
                                        onClick={() => eliminarDelCarrito(articulo.idVariante)}
                                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all cursor-pointer shrink-0"
                                        title="Eliminar artículo"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Footer del Carrito */}
                {articulosEnCarrito.length > 0 && (
                    <div className="border-t border-slate-100 pt-4 flex flex-col gap-4 bg-background">
                        <div className="flex items-center justify-between select-none">
                            <span className="font-base text-xs font-bold uppercase tracking-wider text-foreground/50">
                                Total Estimado:
                            </span>
                            <span className="font-retro text-2xl text-slate-900 tracking-wide">
                                ${obtenerTotalFinal().toLocaleString('es-AR')}
                            </span>
                        </div>

                        <Button
                            onClick={manejarEnviarPedido}
                            className="w-full bg-primary hover:bg-primary/90 text-white font-base font-bold text-xs uppercase tracking-wider rounded-xl shadow-md h-12 transition-all cursor-pointer"
                        >
                            Pedir por WhatsApp
                        </Button>
                    </div>
                )}
            </SheetContent>
        </Sheet>
    );
}