export function generarEnlaceWhatsapp(articulosEnCarrito, totalPedido) {
    const numeroTelefono = "5492612704469";

    let mensaje = `*¡Hola HOLO! Vengo de la tienda web y quiero hacer un pedido:* \n\n`;

    // Recorremos los artículos para listarlos ordenadamente
    articulosEnCarrito.forEach((articulo) => {
        const subtotalItem = articulo.precioUnitario * articulo.cantidadComprada;
        mensaje += `🔸 *${articulo.cantidadComprada}x* ${articulo.nombreProducto} (${articulo.nombreVariante}) \n`;
        mensaje += `   ↳ Subtotal: $${subtotalItem.toLocaleString('es-AR')}\n\n`;
    });

    mensaje += `----------------------------------\n`;
    mensaje += `💰 *Total del Pedido:* $${totalPedido.toLocaleString('es-AR')}\n\n`;
    mensaje += `¿Cómo coordinamos el pago y el retiro/envío? 😊`;

    // Codificamos el texto para que los espacios y emojis sean válidos en una URL
    const mensajeCodificado = encodeURIComponent(mensaje);

    return `https://wa.me/${numeroTelefono}?text=${mensajeCodificado}`;
}