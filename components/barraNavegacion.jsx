'use client';

import CarritoCompras from "./carritoCompras";

export default function BarraNavegacion() {
    return (
        <header className="sticky top-0 z-50 w-full bg-primary border-b-4 border-slate-900 px-6 py-4 shadow-sm">
            <div className="max-w-6xl mx-auto flex items-center justify-between">

                {/* Logo de HOLO */}
                <div className="flex flex-col select-none">
                    <span className="font-retro text-4xl text-white tracking-widest drop-shadow-[2px_2px_0px_rgba(15,23,42,1)]">
                        HOLO
                    </span>
                    <span className="font-base text-[9px] font-black uppercase text-accent tracking-widest mt-0.5 bg-slate-900 px-2 py-0.5 rounded-full border border-white max-w-max">
                        Stickers & Más
                    </span>
                </div>

                {/* Contenedor del Carrito */}
                <div className="flex items-center gap-4">
                    <CarritoCompras />
                </div>

            </div>
        </header>
    );
}