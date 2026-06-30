// components/carruselHero.jsx
'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';

export default function CarruselHero() {
    const diapositivas = [
        {
            id: 'slide-bienvenida',
            urlImagen: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=1600&q=80', 
            titulo: '¡Bienvenidos a HOLO!',
            subtitulo: 'Los mejores stickers holográficos y diseños premium para personalizar tu mundo.',
            enlace: null, 
        },
        {
            id: 'slide-agendas',
            urlImagen: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=1600&q=80',
            titulo: 'Planificá tu año con estilo',
            subtitulo: 'Descubrí nuestra nueva colección exclusiva de Agendas de alta calidad.',
            enlace: '/productos?categoria=Agendas', 
        },
        {
            id: 'slide-remeras',
            urlImagen: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=1600&q=80',
            titulo: 'Remeras que hablan por vos',
            subtitulo: 'Estampados únicos con la onda retro e institucional que buscás.',
            enlace: '/productos?categoria=Remeras',
        }
    ];

    const [indiceActual, setIndiceActual] = useState(0);
    const [estaPausado, setEstaPausado] = useState(false);
    const idTemporizador = useRef(null);

    useEffect(() => {
        if (!estaPausado) {
            idTemporizador.current = setInterval(() => {
                manejarSiguiente();
            }, 5000);
        }

        return () => {
            if (idTemporizador.current) clearInterval(idTemporizador.current);
        };
    }, [indiceActual, estaPausado]);

    const manejarAnterior = (e) => {
        if (e) e.stopPropagation();
        const esPrimerSlide = indiceActual === 0;
        const nuevoIndice = esPrimerSlide ? diapositivas.length - 1 : indiceActual - 1;
        setIndiceActual(nuevoIndice);
    };

    const manejarSiguiente = (e) => {
        if (e) e.stopPropagation();
        const esUltimoSlide = indiceActual === diapositivas.length - 1;
        const nuevoIndice = esUltimoSlide ? 0 : indiceActual + 1;
        setIndiceActual(nuevoIndice);
    };

    const irAlSlide = (indice) => {
        setIndiceActual(indice);
    };

    const ejecutarScrollAbajo = () => {
        window.scrollTo({
            top: window.innerHeight * 0.9,
            behavior: 'smooth'
        });
    };

    return (
        // FIJAMOS: Vuelve a ser absoluto en el pixel 0 para meterse detrás de la barra.
        <section 
            className="absolute top-0 left-0 w-full h-[90dvh] select-none z-0"
            onMouseEnter={() => setEstaPausado(true)}
            onMouseLeave={() => setEstaPausado(false)}
        >
            <div className="relative w-full h-full overflow-hidden bg-slate-950 group">
                
                {/* DIAPOSITIVAS */}
                <div 
                    className="flex h-full w-full transition-transform duration-700 ease-out"
                    style={{ transform: `translateX(-${indiceActual * 100}%)` }}
                >
                    {diapositivas.map((slide) => {
                        const contenidoSlide = (
                            <div className="relative w-full h-full shrink-0 overflow-hidden">
                                <img 
                                    src={slide.urlImagen} 
                                    alt={slide.titulo}
                                    className={`w-full h-full object-cover opacity-65 transition-transform duration-700 ${slide.enlace ? 'cursor-pointer hover:scale-102' : ''}`}
                                />
                                <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/20 to-transparent" />

                                {/* Ajustamos padding para mobile y desktop */}
                                <div className="absolute inset-x-0 bottom-0 max-w-7xl mx-auto px-8 pb-24 md:pb-28 flex flex-col gap-3 text-white">
                                    <h2 className="font-retro text-3xl md:text-5xl lg:text-6xl tracking-wide text-background drop-shadow-md">
                                        {slide.titulo}
                                    </h2>
                                    <p className="font-base text-xs md:text-sm lg:text-base text-white/80 max-w-2xl leading-relaxed font-medium drop-shadow-sm line-clamp-2 md:line-clamp-none">
                                        {slide.subtitulo}
                                    </p>
                                    
                                    {slide.enlace && (
                                        <span className="inline-flex mt-2 font-base text-[10px] md:text-xs font-bold uppercase tracking-wider text-primary bg-background px-5 py-2.5 rounded-xl w-fit shadow-md">
                                            Explorar catálogo
                                        </span>
                                    )}
                                </div>
                            </div>
                        );

                        return slide.enlace ? (
                            <Link key={slide.id} href={slide.enlace} className="w-full h-full shrink-0 block">
                                {contenidoSlide}
                            </Link>
                        ) : (
                            <div key={slide.id} className="w-full h-full shrink-0 block">
                                {contenidoSlide}
                            </div>
                        );
                    })}
                </div>

                {/* BOTONES LATERALES */}
                <button
                    onClick={manejarAnterior}
                    className="absolute left-6 top-1/2 -translate-y-1/2 p-2.5 rounded-xl bg-black/20 backdrop-blur-md text-white border border-white/10 hover:bg-primary hover:border-primary opacity-0 group-hover:opacity-100 transition-all duration-300 cursor-pointer hidden md:block z-10"
                >
                    <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                    onClick={manejarSiguiente}
                    className="absolute right-6 top-1/2 -translate-y-1/2 p-2.5 rounded-xl bg-black/20 backdrop-blur-md text-white border border-white/10 hover:bg-primary hover:border-primary opacity-0 group-hover:opacity-100 transition-all duration-300 cursor-pointer hidden md:block z-10"
                >
                    <ChevronRight className="h-5 w-5" />
                </button>

                {/* INDICADORES */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                    {diapositivas.map((_, indice) => (
                        <button
                            key={`indicador-carrusel-${indice}`}
                            onClick={(e) => {
                                e.stopPropagation();
                                irAlSlide(indice);
                            }}
                            className={`transition-all duration-300 rounded-full cursor-pointer h-2 ${
                                indiceActual === indice 
                                    ? 'w-6 bg-primary' 
                                    : 'w-2 bg-white/50 hover:bg-white'
                            }`}
                            title={`Ir al banner ${indice + 1}`}
                        />
                    ))}
                </div>

            </div>

            {/* ICONO REBOTANDO: Lo dejamos en absolute bottom-4 respecto al final del 90dvh */}
            <div className="absolute -bottom-16 left-0 w-full flex justify-center z-30 pointer-events-none">
                <button
                    onClick={ejecutarScrollAbajo}
                    className="pointer-events-auto p-3 text-primary animate-bounce cursor-pointer flex items-center justify-center"
                    title="Hacer scroll hacia abajo"
                >
                    <ChevronDown className="h-5 w-5" />
                </button>
            </div>
        </section>
    );
}