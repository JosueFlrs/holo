// app/page.js
import BarraNavegacion from "@/components/barraNavegacion";
import TarjetaProducto from "@/components/tarjetaProducto";
import { clienteSupabase } from "@/utilities/clienteSupabase";

// Al ser un Server Component, podemos usar 'async' directamente
export default async function PaginaInicio() {
  
  // Hacemos la consulta relacional a Supabase
  const { data: catalogoProductos, error } = await clienteSupabase
    .from('productos')
    .select(`
      id,
      nombreProducto,
      descripcion,
      categorias (
        nombreCategoria
      ),
      variantesProducto (
        id,
        nombreVariante,
        precioUnitario,
        urlImagen
      )
    `);

  if (error) {
    console.error("Error al obtener los productos:", error);
  }

  // Si no hay datos por algún motivo, devolvemos un array vacío para que no explote el .map
  const productosMostrados = catalogoProductos || [];

  return (
    <div className="min-h-screen bg-background pb-12">
      <BarraNavegacion />

      <section className="bg-accent border-b-4 border-slate-900 py-12 px-6 text-center select-none">
        <h1 className="font-retro text-4xl md:text-6xl text-slate-950 tracking-wide drop-shadow-[2px_2px_0px_rgba(255,255,255,1)]">
          ¡Dale onda a tus cosas!
        </h1>
        <p className="font-base text-sm md:text-base text-slate-800 font-bold mt-3 max-w-xl mx-auto">
          Catálogo interactivo con diseños llenos de brillo. Armá tu pedido y coordiná la entrega al toque por WhatsApp.
        </p>
      </section>

      <main className="max-w-6xl mx-auto px-6 mt-12">
        <h2 className="font-retro text-3xl text-slate-950 mb-8 tracking-wide">
          Diseños Disponibles
        </h2>

        {productosMostrados.length === 0 ? (
          <p className="text-center font-base text-slate-500 py-10">
            Aún no hay productos en la base de datos de HOLO.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {productosMostrados.map((unProducto) => (
              <TarjetaProducto key={unProducto.id} unProducto={unProducto} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}