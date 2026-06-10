// components/barraNavegacion.jsx
'use client';

import CarritoCompras from "./carritoCompras";

export default function BarraNavegacion() {
    return (
        // El fondo ahora usa tu naranja con opacidad para el blur, y el borde un naranja sutilmente más oscuro
        <header className="sticky top-0 z-50 w-full bg-primary/95 backdrop-blur-md  px-6 py-4 transition-all duration-200 shadow-sm">
            <div className="max-w-6xl mx-auto flex items-center justify-between">

                {/* Espacio para Logo y Nombre en color Crema */}
                <div className="flex items-center gap-3 select-none">
                    {/* El contenedor del logo ahora es crema con la letra naranja */}
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
                </div>

                {/* Contenedor del Carrito (Las letras e íconos internos heredarán el color crema gracias a text-background) */}
                <div className="flex items-center gap-4 text-background">
                    <CarritoCompras />
                </div>

            </div>
        </header>
    );
}