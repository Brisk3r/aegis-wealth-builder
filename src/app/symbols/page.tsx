import { Metadata } from 'next';
import SymbolStudio from '@/components/symbols/SymbolStudio';

export const metadata: Metadata = {
  title: 'GlyphCraft Studio | Cool Symbols, Kaomoji, Aesthetic Combos & Fancy Font Generator',
  description: 'Copy and paste over 1,500+ cool symbols, aesthetic sparkles, kaomoji combinations, Lenny faces, fancy Unicode fonts, and bio templates. Instant 1-click clipboard forge with live collector tray.',
  keywords: [
    'cool symbols',
    'copy and paste symbols',
    'kaomoji copy paste',
    'lenny face generator',
    'aesthetic text combos',
    'fancy font generator',
    'discord bio symbols',
    'instagram bio aesthetic',
    'math symbols unicode',
    'greek letters copy paste',
    'star symbols',
    'heart symbols',
    'GlyphCraft'
  ],
  openGraph: {
    title: 'GlyphCraft Studio | Cool Symbols, Kaomoji & Unicode Font Forge',
    description: 'Instant 1-click copy-paste platform for 1,500+ aesthetic symbols, kaomoji emoticons, borders, and 22+ fancy Unicode text styles.',
    type: 'website',
    url: 'https://aegis-wealth-builder.vercel.app/symbols'
  }
};

export default function SymbolsPage() {
  return <SymbolStudio />;
}
