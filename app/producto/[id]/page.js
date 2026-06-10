// app/producto/[id]/page.js
'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import BarraNavegacion from "@/components/barraNavegacion";
import { Button } from "@/components/ui/button";
import { usarCarrito } from "@/store/usarCarrito";
import { clienteSupabase } from "@/utilities/clienteSupabase";
import { ArrowLeft, ShoppingCart, Tag, Check } from "lucide-react";

export default function DetalleProducto({ params: parametrosPromesa }) {
    // Desempaquetamos los parámetros reactivos usando el patrón unwrap nativo de Next.js
    const parametros = use(parametrosPromesa);
    const enrutador = useRouter();
    const agregarAlCarrito = usarCarrito.getState().agregarAlCarrito;

    const [unProducto, setUnProducto] = useState(null);
    const [varianteSeleccionada, setVarianteSeleccionada] = useState(null);
    const [estaCargando, setEstaCargando] = useState(true);
    const [agregadoAnimacion, setAgregadoAnimacion] = useState(false);

    useEffect(() => {
        async function obtenerDetalleProducto() {
            if (!parametros?.id) return;

            // 1. Traemos todos los productos mínimos con sus nombres para comparar con el slug de la URL
            const { data: todosLosProductos, error: errorListado } = await clienteSupabase
                .from('productos')
                .select('id, nombreProducto');

            if (errorListado || !todosLosProductos) {
                console.error("Error al listar productos para mapeo de slug:", errorListado);
                enrutador.push('/');
                return;
            }

            // Helper idéntico para generar el slug de comparación exacta
            const crearSlugComparacion = (texto) => {
                return texto
                    .toLowerCase()
                    .trim()
                    .normalize('NFD')
                    .replace(/[\u0300-\u036f]/g, '')
                    .replace(/[^\w\s-]/g, '')
                    .replace(/[\s_-]+/g, '-')
                    .replace(/^-+|-+$/g, '');
            };

            // Encuentra el producto cuyo nombre transformado coincida perfectamente con el parámetro de la URL
            const productoEncontrado = todosLosProductos.find(
                (p) => crearSlugComparacion(p.nombreProducto) === parametros.id
            );

            if (!productoEncontrado) {
                console.error("No se encontró ningún producto que coincida con el slug:", parametros.id);
                enrutador.push('/');
                return;
            }

            // 2. Una vez que tenemos el ID real del producto correspondiente al slug, hacemos el fetch completo optimizado
            const { data: productoData, error } = await clienteSupabase
                .from('productos')
                .select(`
          id,
          nombreProducto,
          descripcion,
          categorias ( nombreCategoria ),
          variantesProducto ( id, nombreVariante, precioUnitario, urlImagen )
        `)
                .eq('id', productoEncontrado.id)
                .single();

            if (error || !productoData) {
                console.error("Error al recuperar el detalle del producto:", error);
                enrutador.push('/');
                return;
            }

            setUnProducto(productoData);
            if (productoData.variantesProducto && productoData.variantesProducto.length > 0) {
                setVarianteSeleccionada(productoData.variantesProducto[0]);
            }
            setEstaCargando(false);
        }

        obtenerDetalleProducto();
    }, [parametros?.id]);

    if (estaCargando) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center font-base font-bold text-foreground/50 animate-pulse">
                Abriendo los detalles del sticker de HOLO...
            </div>
        );
    }

    const presionarAgregar = () => {
        agregarAlCarrito(varianteSeleccionada, unProducto);
        setAgregadoAnimacion(true);
        setTimeout(() => setAgregadoAnimacion(false), 2000);
    };

    return (
        <div className="min-h-screen bg-background pb-20">
            <BarraNavegacion />

            <main className="max-w-5xl mx-auto px-6 mt-8">
                {/* Botón de Retorno Minimalista */}
                <button
                    onClick={() => enrutador.push('/')}
                    className="flex items-center gap-2 font-base font-bold text-xs uppercase tracking-wider text-slate-500 hover:text-primary transition-colors duration-200 mb-8 cursor-pointer select-none"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Volver al Catálogo
                </button>

                {/* Panel Estructural de Doble Columna */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">

                    {/* COLUMNA IZQUIERDA: Presentación Multimedia */}
                    <div className="bg-white border border-[#fca266]/20 rounded-2xl overflow-hidden shadow-md max-w-md mx-auto w-full aspect-square relative">
                        <img
                            src={varianteSeleccionada?.urlImagen || "https://images.unsplash.com/photo-1572375995301-4598b2c20ce4?w=500"}
                            alt={unProducto.nombreProducto}
                            className="object-cover w-full h-full transition-transform duration-300"
                        />

                        {unProducto.categorias && (
                            <span className="absolute top-4 left-4 bg-accent text-white font-base font-black text-xs px-3.5 py-1.5 rounded-full shadow-md tracking-wider uppercase flex items-center gap-1.5">
                                <Tag className="h-3 w-3" />
                                {unProducto.categorias.nombreCategoria}
                            </span>
                        )}
                    </div>

                    {/* COLUMNA DERECHA: Ficha Técnica e Interacción Comercial */}
                    <div className="flex flex-col h-full justify-center">
                        <h1 className="font-retro text-4xl md:text-5xl text-slate-900 leading-none tracking-wide">
                            {unProducto.nombreProducto}
                        </h1>

                        {/* Bloque Exclusivo del Precio */}
                        <div className="mt-4 flex items-baseline gap-2">
                            <span className="font-retro text-4xl text-primary tracking-wide">
                                ${Number(varianteSeleccionada?.precioUnitario).toLocaleString('es-AR')}
                            </span>
                            <span className="text-xs font-base font-semibold text-slate-400 uppercase tracking-wide">
                                precio unitario
                            </span>
                        </div>

                        {/* Separador de Línea Orgánico */}
                        <div className="h-px w-full bg-[#fca266]/10 my-6" />

                        <div className="font-base">
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Descripción del diseño</h3>
                            <p className="text-slate-600 text-sm md:text-base leading-relaxed">
                                {unProducto.descripcion || "Este increíble artículo de HOLO no cuenta con una descripción detallada todavía, ¡pero te aseguramos que tiene una calidad excepcional!"}
                            </p>
                        </div>

                        {/* CONTROL: Renderizado Condicional del Selector de Variantes con tu naranja claro coral */}
                        {unProducto.variantesProducto && unProducto.variantesProducto.length > 1 && (
                            <div className="mt-8 font-base">
                                <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-3">
                                    Selecciona la opción que querés:
                                </h3>
                                <div className="flex flex-wrap gap-2.5">
                                    {unProducto.variantesProducto.map((variante) => {
                                        const esActiva = variante.id === varianteSeleccionada?.id;
                                        return (
                                            <button
                                                key={variante.id}
                                                onClick={() => setVarianteSeleccionada(variante)}
                                                className={`text-xs px-4 py-2.5 rounded-xl border transition-all duration-200 cursor-pointer font-bold tracking-wide shadow-sm uppercase ${esActiva
                                                    ? 'bg-[#fca266] text-white border-transparent scale-105 shadow-[#fca266]/20'
                                                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                                                    }`}
                                            >
                                                {variante.nombreVariante}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* ACCIÓN PRINCIPAL: Añadir al carrito con tu naranja corporativo */}
                        <div className="mt-10">
                            <Button
                                onClick={presionarAgregar}
                                className={`w-full md:w-auto min-w-60 h-12 rounded-xl text-white font-base font-bold uppercase tracking-wider text-xs transition-all duration-300 shadow-md gap-2 cursor-pointer ${agregadoAnimacion
                                    ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-200'
                                    : 'bg-primary hover:bg-primary/90 shadow-primary/20 hover:scale-[1.02]'
                                    }`}
                            >
                                {agregadoAnimacion ? (
                                    <>
                                        <Check className="h-5 w-5 stroke-3" />
                                        ¡Agregado al Pedido!
                                    </>
                                ) : (
                                    <>
                                        <ShoppingCart className="h-4 w-4" />
                                        Añadir al carrito
                                    </>
                                )}
                            </Button>
                        </div>

                    </div>

                </div>
            </main>
        </div>
    );
}