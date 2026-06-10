import { useEffect, useState } from 'react';
import { usarCarrito } from '@/store/usarCarrito';

export function useContadorCarrito() {
    const [estaCargado, setEstaCargado] = useState(false);
    const articulosEnCarrito = usarCarrito((estado) => estado.articulosEnCarrito);

    // Forzamos a que re-renderice solo cuando ya se leyó el localStorage del cliente
    useEffect(() => {
        usarCarrito.persist.rehydrate();
        setEstaCargado(true);
    }, []);

    const totalItems = articulosEnCarrito.reduce(
        (acumulador, articulo) => acumulador + articulo.cantidadComprada,
        0
    );

    return {
        estaCargado,
        totalItems: estaCargado ? totalItems : 0,
        articulosEnCarrito: estaCargado ? articulosEnCarrito : []
    };
}