// app/layout.js
import { Cherry_Bomb_One, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';

// Importamos Cherry Bomb One (los espacios se convierten en guiones bajos)
const fuenteTitulos = Cherry_Bomb_One({
  weight: '400', // Esta fuente también requiere especificar el peso
  subsets: ['latin'],
  variable: '--fuente-retro',
});

// Mantenemos Plus Jakarta Sans para que los textos largos sean legibles
const fuenteTextoBase = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--fuente-base',
});

export const metadata = {
  title: 'HOLO | Tienda de Stickers, Agendas y Remeras',
  description: 'Catálogo oficial de productos HOLO con diseños exclusivos.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" className={`${fuenteTitulos.variable} ${fuenteTextoBase.variable}`}>
      <body 
        className="font-base antialiased bg-background text-foreground"
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}