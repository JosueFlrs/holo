// app/page.jsx
import BarraNavegacion from "@/components/barraNavegacion";
import TarjetaProducto from "@/components/tarjetaProducto";

// Simulación exacta del catálogo relacional tal como vendrá de Supabase
const catalogoSimuladoProductos = [
  {
    id: 1,
    nombreProducto: "Sticker Michi Holográfico",
    descripcion: "Sticker de gatito astronauta con brillo holográfico premium. Resistente al agua, ideal para la compu o el termo.",
    categorias: { nombreCategoria: "Stickers" },
    variantesProducto: [
      { id: 101, nombreVariante: "Chico (5cm)", precioUnitario: 800, urlImagen: "https://images.unsplash.com/photo-1572375995301-4598b2c20ce4?w=500" },
      { id: 102, nombreVariante: "Grande (10cm)", precioUnitario: 1400, urlImagen: "https://images.unsplash.com/photo-1572375995301-4598b2c20ce4?w=500" }
    ]
  },
  {
    id: 2,
    nombreProducto: "Agenda Retro Pop 2026",
    descripcion: "Agenda perpetua con tapas duras laminadas, hojas de puntos de 90g y stickers de regalo para organizarte con onda.",
    categorias: { nombreCategoria: "Agendas" },
    variantesProducto: [
      { id: 201, nombreVariante: "Tapa Rosa - Espiral", precioUnitario: 18500, urlImagen: "https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=500" },
      { id: 202, nombreVariante: "Tapa Naranja - Cosida", precioUnitario: 21000, urlImagen: "https://images.unsplash.com/photo-1544816155-12df9643f363?w=500" }
    ]
  },
  {
    id: 3,
    nombreProducto: "Remera Y2K Over-sized",
    descripcion: "Remera 100% algodón peinado de calce suelto con estampa en tinta relieve reflectiva en la espalda.",
    categorias: { nombreCategoria: "Remeras" },
    variantesProducto: [
      { id: 301, nombreVariante: "Talle S/M", precioUnitario: 24000, urlImagen: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500" },
      { id: 302, nombreVariante: "Talle L/XL", precioUnitario: 26500, urlImagen: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500" }
    ]
  }
];

export default function PaginaInicio() {
  return (
    <div className="min-h-screen bg-background pb-12">
      {/* Barra superior con estilo e identidad */}
      <BarraNavegacion />

      {/* Banner de Bienvenida con estilo retro-pop / Y2K */}
      <section className="bg-accent border-b-4 border-slate-900 py-12 px-6 text-center select-none">
        <h1 className="font-retro text-4xl md:text-6xl text-slate-950 tracking-wide drop-shadow-[2px_2px_0px_rgba(255,255,255,1)]">
          ¡Dale onda a tus cosas!
        </h1>
        <p className="font-base text-sm md:text-base text-slate-800 font-bold mt-3 max-w-xl mx-auto">
          Catálogo interactivo con diseños llenos de brillo. Armá tu pedido y coordiná la entrega al toque por WhatsApp.
        </p>
      </section>

      {/* Grilla principal del catálogo de HOLO */}
      <main className="max-w-6xl mx-auto px-6 mt-12">
        <h2 className="font-retro text-3xl text-slate-950 mb-8 tracking-wide">
          Diseños Disponibles
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {catalogoSimuladoProductos.map((unProducto) => (
            <TarjetaProducto key={unProducto.id} unProducto={unProducto} />
          ))}
        </div>
      </main>
    </div>
  );
}