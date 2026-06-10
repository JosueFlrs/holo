import { Calistoga, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';



const fuenteTitulos = Calistoga({
  weight: '400',
  subsets: ['latin'],
  variable: '--fuente-retro',
});

const fuenteTextoBase = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--fuente-base',
});

export const metadata = {
  title: 'HOLO | Tienda de Stickers',
  description: 'Catálogo interactivo de HOLO',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body 
        className="font-base antialiased bg-background text-foreground"
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}