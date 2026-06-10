import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const usarCarrito = create(
    persist(
        (set, get) => ({
            articulosEnCarrito: [],

            // 1. Agregar un artículo o sumar cantidad si ya existe
            agregarAlCarrito: (nuevaVariante, productoBase) => {
                const { articulosEnCarrito } = get();

                const articuloExistente = articulosEnCarrito.find(
                    (articulo) => articulo.idVariante === nuevaVariante.id
                );

                if (articuloExistente) {
                    // Si ya está en el carrito, mapeamos y le sumamos 1 a la cantidad
                    const carritoActualizado = articulosEnCarrito.map((articulo) =>
                        articulo.idVariante === nuevaVariante.id
                            ? { ...articulo, cantidadComprada: articulo.cantidadComprada + 1 }
                            : articulo
                    );
                    set({ articulosEnCarrito: carritoActualizado });
                } else {
                    // Si es nuevo, lo agregamos al array con cantidad inicial en 1
                    set({
                        articulosEnCarrito: [
                            ...articulosEnCarrito,
                            {
                                idVariante: nuevaVariante.id,
                                nombreProducto: productoBase.nombreProducto,
                                nombreVariante: nuevaVariante.nombreVariante,
                                precioUnitario: Number(nuevaVariante.precioUnitario),
                                cantidadComprada: 1,
                            },
                        ],
                    });
                }
            },

            // 2. Quitar un artículo por completo del carrito
            eliminarDelCarrito: (idVariante) => {
                const { articulosEnCarrito } = get();
                set({
                    articulosEnCarrito: articulosEnCarrito.filter(
                        (articulo) => articulo.idVariante !== idVariante
                    ),
                });
            },

            // 3. Vaciar el carrito por completo (luego de finalizar compra o si el usuario lo desea)
            vaciarCarrito: () => set({ articulosEnCarrito: [] }),

            // 4. Calcular el total acumulado de la compra
            obtenerTotalFinal: () => {
                const { articulosEnCarrito } = get();
                return articulosEnCarrito.reduce(
                    (acumulador, articulo) => acumulador + (articulo.precioUnitario * articulo.cantidadComprada),
                    0
                );
            },
        }),
        {
            name: 'holo-carrito-almacenamiento',
            skipHydration: true,
        }
    )
);