// components/carritoCompras.jsx
'use client';

import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { usarCarrito } from "@/store/usarCarrito";
<<<<<<< HEAD
=======
import { useContadorCarrito } from "@/hooks/useContadorCarrito";
>>>>>>> d184dcfa4dbe673983974feb3c96a99d7cb62c7c
import { generarEnlaceWhatsapp } from "@/utilities/generarEnlaceWhatsapp";
import { ShoppingCart, Trash2, MessageSquare } from "lucide-react";

export default function CarritoCompras() {
    // 1. REGLA DE ORO DE REACT: Todos los hooks van primero, siempre.
    const articulosEnCarrito = usarCarrito((estado) => estado.articulosEnCarrito);
    const obtenerTotalFinal = usarCarrito((estado) => estado.obtenerTotalFinal);
    const eliminarDelCarrito = usarCarrito((estado) => estado.eliminarDelCarrito);
    const vaciarCarrito = usarCarrito((estado) => estado.vaciarCarrito);

    // 2. Control de montaje para evitar el choque de hidratación
    const [estaMontado, setEstaMontado] = useState(false);

    useEffect(() => {
        // Esto solo se ejecuta una vez que el componente ya está en el navegador
        setEstaMontado(true);
    }, []);

    // 3. Variables derivadas simples
    const totalArticulos = articulosEnCarrito.reduce(
        (acumulador, articulo) => acumulador + articulo.cantidadComprada,
        0
    );

    const manejarEnvioPedido = () => {
        const total = obtenerTotalFinal();
        const urlWhatsapp = generarEnlaceWhatsapp(articulosEnCarrito, total);
        window.open(urlWhatsapp, '_blank');
        vaciarCarrito();
    };

    // 4. BARRERA DE SEGURIDAD: Va siempre después de todos los hooks.
    // Si el componente está en el servidor, devolvemos un botón decorativo.
    if (!estaMontado) {
        return (
            <Button size="icon" className="relative bg-primary text-white rounded-full h-12 w-12 border-2 border-slate-900 shadow-md">
                <ShoppingCart className="h-5 w-5" />
            </Button>
        );
    }

    // 5. El renderizado real para el cliente
    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button size="icon" className="relative bg-primary hover:bg-primary/90 text-white rounded-full h-12 w-12 shadow-md border-2 border-slate-900 cursor-pointer">
                    <ShoppingCart className="h-5 w-5" />
                    {totalArticulos > 0 && (
                        <span className="absolute -top-1 -right-1 bg-accent text-slate-900 font-bold text-xs h-5 w-5 rounded-full flex items-center justify-center border-2 border-slate-900 animate-bounce">
                            {totalArticulos}
                        </span>
                    )}
                </Button>
            </SheetTrigger>

            <SheetContent className="bg-background border-l-2 border-slate-900 w-full sm:max-w-md flex flex-col justify-between">
                <div>
                    <SheetHeader>
                        <SheetTitle className="font-retro text-2xl text-primary tracking-wide">
                            Tu Carrito HOLO
                        </SheetTitle>
                    </SheetHeader>

                    <div className="mt-8 space-y-4 overflow-y-auto max-h-[60vh] pr-2">
                        {articulosEnCarrito.length === 0 ? (
                            <p className="font-base text-slate-500 text-center mt-12">
                                Tu carrito está vacío. ¡Súmale onda con unos stickers! 🎨
                            </p>
                        ) : (
                            articulosEnCarrito.map((articulo) => (
                                <div key={articulo.idVariante} className="flex items-center justify-between p-3 bg-white rounded-2xl border-2 border-slate-900 shadow-sm">
                                    <div className="font-base">
                                        <h4 className="font-bold text-slate-950 text-sm leading-tight">
                                            {articulo.nombreProducto}
                                        </h4>
                                        <p className="text-xs text-slate-500 mt-0.5">
                                            {articulo.nombreVariante}
                                        </p>
                                        <p className="text-xs font-semibold text-primary mt-1">
                                            {articulo.cantidadComprada}x ${articulo.precioUnitario.toLocaleString('es-AR')}
                                        </p>
                                    </div>

                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        className="text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl cursor-pointer"
                                        onClick={() => eliminarDelCarrito(articulo.idVariante)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {articulosEnCarrito.length > 0 && (
                    <div className="border-t-2 border-slate-900 pt-4 bg-background">
                        <div className="flex justify-between items-center font-base mb-4">
                            <span className="font-bold text-slate-700">Total estimado:</span>
                            <span className="font-retro text-2xl text-slate-950 font-bold">
                                ${obtenerTotalFinal().toLocaleString('es-AR')}
                            </span>
                        </div>

                        <Button
                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-full border-2 border-slate-900 shadow-sm gap-2 font-base cursor-pointer h-12"
                            onClick={manejarEnvioPedido}
                        >
                            <MessageSquare className="h-5 w-5" />
                            Enviar pedido a WhatsApp
                        </Button>
                    </div>
                )}
            </SheetContent>
        </Sheet>
    );
}